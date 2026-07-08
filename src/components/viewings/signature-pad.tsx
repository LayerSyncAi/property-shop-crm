"use client";

import * as React from "react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ImageUpload, type ImageItem } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";

export interface SignatureValue {
  storageId: string;
  url: string;
}

interface SignatureFieldProps {
  label: string;
  value: SignatureValue | null;
  onChange: (value: SignatureValue | null) => void;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Upload a Blob/File to Convex storage and resolve its permanent URL.
 * Mirrors the flow in `src/components/ui/image-upload.tsx`.
 */
function useBlobUploader() {
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  return React.useCallback(
    async (blob: Blob, contentType: string): Promise<SignatureValue> => {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: blob,
      });
      if (!response.ok) throw new Error("Failed to upload signature");
      const { storageId } = await response.json();
      const url = await convex.query(api.storage.getUrl, {
        storageId: storageId as Id<"_storage">,
      });
      return { storageId, url: url ?? URL.createObjectURL(blob) };
    },
    [convex, generateUploadUrl]
  );
}

/**
 * A canvas the user signs with mouse / finger / stylus. High-DPI aware.
 * Calls `onExport` with a PNG blob when the user commits the drawing.
 */
function DrawCanvas({
  onExport,
  onCancel,
  disabled,
}: {
  onExport: (blob: Blob) => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const hasStrokes = React.useRef(false);
  const [dirty, setDirty] = React.useState(false);

  // Size the canvas backing store to its CSS box × devicePixelRatio so lines
  // stay crisp and coordinates map 1:1.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111827";
    }
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    if (disabled) return;
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || disabled) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasStrokes.current = true;
    if (!dirty) setDirty(true);
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokes.current = false;
    setDirty(false);
  };

  const commit = () => {
    if (!hasStrokes.current) return;
    canvasRef.current!.toBlob((blob) => {
      if (blob) onExport(blob);
    }, "image/png");
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="h-36 w-full touch-none rounded-lg border border-border-strong bg-white"
        style={{ touchAction: "none" }}
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" className="h-8 text-xs" onClick={commit} disabled={!dirty || disabled}>
          Save signature
        </Button>
        <Button type="button" variant="ghost" className="h-8 text-xs" onClick={clear} disabled={!dirty || disabled}>
          Clear
        </Button>
        <Button type="button" variant="ghost" className="h-8 text-xs" onClick={onCancel} disabled={disabled}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function SignatureField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}: SignatureFieldProps) {
  const [mode, setMode] = React.useState<"idle" | "draw" | "upload">("idle");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const upload = useBlobUploader();

  const handleDrawExport = async (blob: Blob) => {
    setBusy(true);
    setError(null);
    try {
      const result = await upload(blob, "image/png");
      onChange(result);
      setMode("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleUploadChange = (images: ImageItem[]) => {
    const img = images[0];
    if (img?.storageId) {
      onChange({ storageId: img.storageId, url: img.url });
      setMode("idle");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-text-muted hover:text-danger"
          >
            Remove
          </button>
        )}
      </div>

      {/* Existing signature preview */}
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-border-strong bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt={`${label} signature`} className="h-16 w-auto max-w-[240px] object-contain" />
          <span className="text-xs text-emerald-600">Signed</span>
        </div>
      ) : mode === "idle" ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-8 text-xs"
            onClick={() => setMode("draw")}
            disabled={disabled}
          >
            Draw signature
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setMode("upload")}
            disabled={disabled}
          >
            Upload image
          </Button>
        </div>
      ) : mode === "draw" ? (
        <div className={cn(busy && "opacity-60 pointer-events-none")}>
          <DrawCanvas onExport={handleDrawExport} onCancel={() => setMode("idle")} disabled={busy} />
        </div>
      ) : (
        <div className="space-y-2">
          <ImageUpload
            images={[]}
            onChange={handleUploadChange}
            minImages={0}
            maxImages={1}
            disabled={disabled}
          />
          <Button type="button" variant="ghost" className="h-8 text-xs" onClick={() => setMode("idle")}>
            Cancel
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
