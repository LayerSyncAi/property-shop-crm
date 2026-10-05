"use client";

import { useMemo } from "react";
import { FORMAT_PRESETS, getFormat } from "@/lib/syncmedia/formats";
import { TEMPLATES } from "@/lib/syncmedia/templates";
import { themesFor } from "@/lib/syncmedia/theme";
import type { BrandKit, BrochureDoc } from "@/lib/syncmedia/types";
import { cn } from "@/lib/utils";
import { BrochureThumb } from "../BrochureStage";
import { OptionCard, Section } from "./controls";

/**
 * Format, template and colour — the three choices that decide what the
 * brochure looks like.
 */
export function DesignPanel({
  doc,
  patch,
  brand,
}: {
  doc: BrochureDoc;
  patch: (changes: Partial<BrochureDoc>) => void;
  brand: BrandKit;
}) {
  const themes = useMemo(() => themesFor(brand), [brand]);

  /**
   * Template thumbnails render from a stand-in document rather than the live
   * one, so typing in the Details panel doesn't re-render six extra brochures
   * on every keystroke. They still track format, theme and the hero photo,
   * which is what actually changes how a template reads.
   */
  const thumbDoc = useMemo<BrochureDoc>(
    () => ({
      ...doc,
      title: doc.title || "Four Bedroom Cluster",
      location: doc.location || "Borrowdale, Harare",
      price: doc.price || "$285,000",
      features: doc.features.filter(Boolean).length
        ? doc.features
        : ["4 Bedrooms", "3 Bathrooms", "Double garage", "Borehole"],
      agentName: doc.agentName || brand.orgName,
      agentPhone: doc.agentPhone || brand.contactPhone || "+263 775 920 436",
    }),
    [doc, brand]
  );

  return (
    <div className="space-y-7">
      <Section title="Format" hint="Where is this going to be posted?">
        <div className="space-y-2">
          {FORMAT_PRESETS.map((preset) => {
            const selected = doc.formatKey === preset.key;
            const boxHeight = 44;
            const boxWidth = Math.max(
              16,
              Math.round((preset.width / preset.height) * boxHeight)
            );
            return (
              <OptionCard
                key={preset.key}
                selected={selected}
                onClick={() => patch({ formatKey: preset.key })}
                title={preset.label}
                subtitle={`${preset.platforms.join(" · ")} — ${preset.blurb}`}
                visual={
                  <span
                    className="flex items-center justify-center"
                    style={{ width: 46, height: boxHeight }}
                  >
                    <span
                      className={cn(
                        "block rounded-sm border-2",
                        selected
                          ? "border-primary bg-primary/20"
                          : "border-border-strong bg-surface-2"
                      )}
                      style={{ width: boxWidth, height: boxHeight }}
                    />
                  </span>
                }
              />
            );
          })}
        </div>
      </Section>

      <Section title="Layout" hint="Every layout works in every format.">
        <div className="space-y-2">
          {TEMPLATES.map((template) => (
            <OptionCard
              key={template.id}
              selected={doc.templateId === template.id}
              onClick={() => patch({ templateId: template.id })}
              title={template.name}
              subtitle={template.description}
              visual={
                <span className="block overflow-hidden rounded border border-border">
                  <BrochureThumb
                    doc={{ ...thumbDoc, templateId: template.id }}
                    brand={brand}
                    width={54}
                  />
                </span>
              }
            />
          ))}
        </div>
      </Section>

      <Section
        title="Colour"
        hint="Brand is your agency's own scheme. The rest are for standing out in a busy feed."
      >
        <div className="grid grid-cols-5 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => patch({ themeId: theme.id })}
              title={theme.name}
              aria-label={theme.name}
              aria-pressed={doc.themeId === theme.id}
              className={cn(
                "cursor-pointer overflow-hidden rounded-lg border-2 transition active:scale-[0.97]",
                doc.themeId === theme.id
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border hover:border-border-strong"
              )}
            >
              <span className="flex h-9 w-full">
                <span className="h-full w-1/2" style={{ backgroundColor: theme.page }} />
                <span className="h-full w-1/2" style={{ backgroundColor: theme.accent }} />
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted">
          {themes.find((t) => t.id === doc.themeId)?.name}
        </p>
      </Section>

      <p className="rounded-lg bg-surface-2 p-3 text-xs leading-relaxed text-text-muted">
        Exports at {getFormat(doc.formatKey).width}×{getFormat(doc.formatKey).height}px
        {getFormat(doc.formatKey).kind === "print" ? " as a print-ready PDF." : " as a PNG."}
      </p>
    </div>
  );
}
