"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getFormat } from "@/lib/syncmedia/formats";
import type { BrandKit, BrochureDoc } from "@/lib/syncmedia/types";
import { BrochureRenderer } from "./BrochureRenderer";
import type { AdjustState } from "./templates/shared";

/**
 * Shows a brochure at whatever size the surrounding layout gives it.
 *
 * The brochure itself always renders at full export resolution; this measures
 * the available box and applies exactly the transform needed to fit. That is
 * what makes the preview trustworthy — switching between a 1080×1920 story and
 * a 1200×630 banner needs no per-format magic numbers, and the reserved space
 * always matches the scaled result instead of being hand-tuned with a negative
 * margin.
 */
export function BrochureStage({
  doc,
  brand,
  className,
  maxScale = 1,
  adjust,
}: {
  doc: BrochureDoc;
  brand: BrandKit;
  className?: string;
  /** Cap so a small format doesn't blow up past its native size. */
  maxScale?: number;
  /**
   * Turns the preview into an editable canvas. The stage fills in `scale`
   * itself — it is the only component that knows it — so callers pass the
   * selection and change handlers and nothing else.
   */
  adjust?: Omit<AdjustState, "scale"> | null;
}) {
  const preset = getFormat(doc.formatKey);
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale =
    box.width > 0 && box.height > 0
      ? Math.min(box.width / preset.width, box.height / preset.height, maxScale)
      : 0;

  const adjustState = useMemo<AdjustState | null>(
    () => (adjust ? { ...adjust, scale } : null),
    [adjust, scale]
  );

  return (
    <div
      ref={boxRef}
      className={className}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}
    >
      {/* Outer box occupies the *scaled* footprint so flow layout stays honest;
          the inner element is the full-size brochure being shrunk into it. */}
      <div
        style={{
          width: preset.width * scale,
          height: preset.height * scale,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 10px 34px rgba(20, 30, 40, 0.16)",
          // Avoid a flash of the unscaled, page-wide brochure on first paint.
          visibility: scale > 0 ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            width: preset.width,
            height: preset.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <BrochureRenderer doc={doc} brand={brand} adjust={adjustState} />
        </div>
      </div>
    </div>
  );
}

/**
 * Fixed-width variant for template and format thumbnails, where the caller
 * knows the width it wants and the height should follow the aspect ratio.
 */
export function BrochureThumb({
  doc,
  brand,
  width,
}: {
  doc: BrochureDoc;
  brand: BrandKit;
  width: number;
}) {
  const preset = getFormat(doc.formatKey);
  const scale = width / preset.width;

  return (
    <div
      style={{
        width,
        height: preset.height * scale,
        overflow: "hidden",
        borderRadius: 4,
      }}
    >
      <div
        style={{
          width: preset.width,
          height: preset.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <BrochureRenderer doc={doc} brand={brand} />
      </div>
    </div>
  );
}
