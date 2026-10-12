"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { downscaleImage } from "@/lib/syncmedia/images";
import { getTemplate } from "@/lib/syncmedia/templates";
import type { BrochureDoc, Photo } from "@/lib/syncmedia/types";
import { cn } from "@/lib/utils";
import { Section } from "./controls";

const MAX_PHOTOS = 8;

export function PhotoPanel({
  doc,
  patch,
  propertyPhotos,
}: {
  doc: BrochureDoc;
  patch: (changes: Partial<BrochureDoc>) => void;
  /** The tray of photos from the selected property, if there is one. */
  propertyPhotos: Photo[];
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const template = getTemplate(doc.templateId);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  function setPhotos(photos: Photo[]) {
    patch({ photos: photos.slice(0, MAX_PHOTOS) });
  }

  function togglePropertyPhoto(photo: Photo) {
    if (doc.photos.some((p) => p.ref === photo.ref)) {
      setPhotos(doc.photos.filter((p) => p.ref !== photo.ref));
    } else if (doc.photos.length < MAX_PHOTOS) {
      setPhotos([...doc.photos, photo]);
    } else {
      setError(`You can use up to ${MAX_PHOTOS} photos.`);
    }
  }

  /**
   * Uploads go straight to Convex storage rather than being held as data URLs.
   * That is what lets a draft survive a page reload — a base64 photo is far too
   * big to persist, and the brochure row stores the storage id instead.
   */
  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    // Reset immediately so re-picking the same file still fires a change event.
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_PHOTOS - doc.photos.length;
    if (room <= 0) {
      setError(`You can use up to ${MAX_PHOTOS} photos.`);
      return;
    }

    setBusy(true);
    setError(null);
    const added: Photo[] = [];
    let failures = 0;

    for (const file of files.slice(0, room)) {
      try {
        const blob = await downscaleImage(file);
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
        if (!response.ok) throw new Error("Upload failed");
        const { storageId } = await response.json();
        // The storage id is the ref; the object URL is display-only and is
        // never persisted.
        added.push({ ref: storageId as string, url: URL.createObjectURL(blob) });
      } catch {
        failures += 1;
      }
    }

    // One state write at the end: updating per file would repeatedly start from
    // the same stale array and only the last photo would survive.
    if (added.length > 0) setPhotos([...doc.photos, ...added]);
    if (failures > 0) {
      setError(`${failures} photo${failures > 1 ? "s" : ""} couldn't be uploaded.`);
    } else if (files.length > room) {
      setError(`Only the first ${room} were added.`);
    }
    setBusy(false);
  }

  /** Explicit move buttons rather than drag — these work on a phone. */
  function move(from: number, to: number) {
    if (to < 0 || to >= doc.photos.length) return;
    const next = [...doc.photos];
    const [photo] = next.splice(from, 1);
    next.splice(to, 0, photo);
    setPhotos(next);
  }

  const unusedCount = Math.max(0, doc.photos.length - template.photoSlots);

  return (
    <div className="space-y-7">
      {propertyPhotos.length > 0 ? (
        <Section title="From this property" hint="Tap to add or remove.">
          <div className="grid grid-cols-4 gap-2">
            {propertyPhotos.map((photo, i) => {
              const position = doc.photos.findIndex((p) => p.ref === photo.ref);
              return (
                <button
                  key={`${photo.ref}-${i}`}
                  type="button"
                  onClick={() => togglePropertyPhoto(photo)}
                  className={cn(
                    "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition active:scale-[0.97]",
                    position >= 0
                      ? "border-primary"
                      : "border-transparent hover:border-primary/40"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  {position >= 0 ? (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {position + 1}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Section>
      ) : null}

      <Section title="Upload" hint={`Up to ${MAX_PHOTOS} photos in total.`}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFiles}
          className="sr-only"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={busy || doc.photos.length >= MAX_PHOTOS}
          className="w-full"
        >
          <ImagePlus className="h-4 w-4" />
          {busy ? "Uploading…" : "Add photos from this device"}
        </Button>
      </Section>

      <Section
        title={`In the brochure (${doc.photos.length})`}
        hint={
          doc.photos.length === 0
            ? "Add at least one photo."
            : `${template.name} shows up to ${template.photoSlots}. The first is the hero.`
        }
      >
        {doc.photos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong p-4 text-center text-xs text-text-muted">
            No photos yet
          </p>
        ) : (
          <ul className="space-y-2">
            {doc.photos.map((photo, i) => {
              const spare = i >= template.photoSlots;
              return (
                <li
                  key={`${photo.ref}-${i}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-border p-2",
                    spare ? "bg-surface-2" : "bg-card-bg"
                  )}
                >
                  <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt=""
                      className={cn("h-full w-full object-cover", spare && "opacity-40")}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-text">
                      {i === 0 ? "Hero" : `Photo ${i + 1}`}
                    </span>
                    {spare ? (
                      <span className="block text-[11px] text-text-muted">
                        Not shown in this layout
                      </span>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      aria-label="Move earlier"
                      className="cursor-pointer rounded p-1.5 text-text-muted hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, i + 1)}
                      disabled={i === doc.photos.length - 1}
                      aria-label="Move later"
                      className="cursor-pointer rounded p-1.5 text-text-muted hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotos(doc.photos.filter((_, idx) => idx !== i))}
                      aria-label="Remove photo"
                      className="cursor-pointer rounded p-1.5 text-danger hover:bg-danger/10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {unusedCount > 0 ? (
          <p className="text-xs text-text-muted">
            {unusedCount} photo{unusedCount > 1 ? "s" : ""} won&apos;t appear — switch to the
            Mosaic layout to show up to four.
          </p>
        ) : null}
      </Section>

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
