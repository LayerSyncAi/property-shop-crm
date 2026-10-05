"use client";

import { forwardRef } from "react";
import { getFormat } from "@/lib/syncmedia/formats";
import { getTheme } from "@/lib/syncmedia/theme";
import type { TemplateId } from "@/lib/syncmedia/templates";
import type { BrandKit, BrochureDoc } from "@/lib/syncmedia/types";
import { AdjustProvider, type AdjustState, type TemplateProps } from "./templates/shared";
import { HouseStyle } from "./templates/HouseStyle";
import { Editorial } from "./templates/Editorial";
import { Overlay } from "./templates/Overlay";
import { Mosaic } from "./templates/Mosaic";
import { Split } from "./templates/Split";
import { Spotlight } from "./templates/Spotlight";

const REGISTRY: Record<TemplateId, (props: TemplateProps) => React.ReactElement> = {
  housestyle: HouseStyle,
  editorial: Editorial,
  overlay: Overlay,
  mosaic: Mosaic,
  split: Split,
  spotlight: Spotlight,
};

/**
 * Renders a brochure at its exact export size. Every consumer — the live
 * preview, the template thumbnails, the hidden export node — goes through
 * here, so what an agent sees is literally the thing that gets rasterised.
 *
 * Scaling is never done inside this component; callers wrap it in a transform.
 *
 * `adjust` is supplied only by the editable preview. Passing nothing — which
 * the thumbnails and the export node do — renders the stored position tweaks
 * but none of the editing chrome, so what gets rasterised is the brochure
 * rather than the editor.
 */
export const BrochureRenderer = forwardRef<
  HTMLDivElement,
  { doc: BrochureDoc; brand: BrandKit; adjust?: AdjustState | null }
>(function BrochureRenderer({ doc, brand, adjust = null }, ref) {
  const preset = getFormat(doc.formatKey);
  const theme = getTheme(doc.themeId, brand);
  const Template = REGISTRY[doc.templateId] ?? HouseStyle;

  return (
    <div
      ref={ref}
      style={{
        width: `${preset.width}px`,
        height: `${preset.height}px`,
        overflow: "hidden",
        position: "relative",
        backgroundColor: theme.page,
        // html2canvas reads computed styles, so anything the templates rely
        // on has to be set here rather than inherited from the app shell.
        textRendering: "geometricPrecision",
      }}
      // Clicking the backdrop drops the selection, so the outline goes away
      // without having to find the toggle again.
      onPointerDown={adjust ? () => adjust.onSelect(null) : undefined}
    >
      <AdjustProvider value={adjust}>
        <Template doc={doc} theme={theme} preset={preset} brand={brand} />
      </AdjustProvider>
    </div>
  );
});
