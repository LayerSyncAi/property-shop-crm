"use client";

import {
  createContext,
  useContext,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { FormatPreset } from "@/lib/syncmedia/formats";
import { clampNudge, getNudge, SLOT_LABELS, type SlotId } from "@/lib/syncmedia/nudges";
import type { BrandKit, BrochureDoc, BrochureTheme, Photo } from "@/lib/syncmedia/types";

export interface TemplateProps {
  doc: BrochureDoc;
  theme: BrochureTheme;
  preset: FormatPreset;
  /** The organisation's logo and name, as the brochure should sign itself. */
  brand: BrandKit;
}

/**
 * What the editable preview supplies so blocks can be dragged. Absent
 * everywhere else — the layout thumbnails and the off-screen export node
 * render through the very same templates, and neither should grow outlines,
 * cursors or pointer handlers.
 */
export interface AdjustState {
  /** Selected block, or null. Drives the handle and the arrow-key target. */
  selected: SlotId | null;
  onSelect: (slot: SlotId | null) => void;
  onChange: (slot: SlotId, offset: { x: number; y: number }) => void;
  /**
   * Preview-to-canvas ratio. A drag is measured in screen pixels but stored in
   * canvas pixels, so without this a nudge on a preview shrunk to 40% would
   * come out two and a half times too far in the export.
   */
  scale: number;
}

const AdjustContext = createContext<AdjustState | null>(null);

export function AdjustProvider({
  value,
  children,
}: {
  value: AdjustState | null;
  children: ReactNode;
}) {
  return <AdjustContext.Provider value={value}>{children}</AdjustContext.Provider>;
}

/**
 * A block of a template that an agent can reposition.
 *
 * Templates use this *in place of* the wrapper they already had, handing over
 * the same style, so adopting it changes nothing about how a layout renders
 * until someone actually drags something.
 *
 * The offset is applied by `position: relative` + `left`/`top` rather than a
 * transform: relative offsets are equally invisible to siblings, and
 * html2canvas reproduces them far more reliably than transforms — an
 * adjustment that showed in the preview but not in the downloaded PNG would be
 * worse than not having the feature. Blocks the template already positioned
 * absolutely keep their own positioning and take a translate instead.
 */
export function Slot({
  id,
  doc,
  preset,
  style,
  children,
}: {
  id: SlotId;
  doc: BrochureDoc;
  preset: FormatPreset;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const adjust = useContext(AdjustContext);
  const offset = getNudge(doc.nudges, doc.formatKey, id);
  // Where the block was when the drag started, so the offset tracks the
  // pointer's total travel instead of accumulating rounding on every event.
  const origin = useRef<{ x: number; y: number; offX: number; offY: number } | null>(null);

  const moved = offset.x !== 0 || offset.y !== 0;
  const absolute = style?.position === "absolute" || style?.position === "fixed";

  const offsetStyle: CSSProperties = !moved
    ? {}
    : absolute
      ? {
          transform: [style?.transform, `translate(${offset.x}px, ${offset.y}px)`]
            .filter(Boolean)
            .join(" "),
        }
      : { position: "relative", left: offset.x, top: offset.y };

  if (!adjust) {
    return <div style={{ ...style, ...offsetStyle }}>{children}</div>;
  }

  const selected = adjust.selected === id;

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!adjust) return;
    // Let a nested slot claim the drag rather than moving its parent too.
    event.stopPropagation();
    event.preventDefault();
    adjust.onSelect(id);
    origin.current = { x: event.clientX, y: event.clientY, offX: offset.x, offY: offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = origin.current;
    if (!adjust || !start) return;
    /**
     * `pointermove` also fires on plain hover, so a `pointerup` that never
     * arrives — the pointer leaving the window mid-drag, capture being lost to
     * a re-render — would otherwise leave the block glued to the cursor with
     * no button held, dragging every time it passed underneath. Trusting the
     * button state rather than only the up event is what makes that
     * unrecoverable state impossible.
     */
    if (event.buttons === 0) {
      origin.current = null;
      return;
    }
    // Guard against a zero scale on the very first frame, before the stage has
    // measured itself — dividing by it would send the block to infinity.
    if (adjust.scale <= 0) return;
    const dx = (event.clientX - start.x) / adjust.scale;
    const dy = (event.clientY - start.y) / adjust.scale;
    adjust.onChange(id, clampNudge(preset, start.offX + dx, start.offY + dy));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    origin.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  /** Arrow keys for the last pixel, which a mouse on a scaled preview can't hit. */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!adjust) return;
    const step = event.shiftKey ? 10 : 1;
    const delta =
      event.key === "ArrowLeft"
        ? { x: -step, y: 0 }
        : event.key === "ArrowRight"
          ? { x: step, y: 0 }
          : event.key === "ArrowUp"
            ? { x: 0, y: -step }
            : event.key === "ArrowDown"
              ? { x: 0, y: step }
              : null;

    if (delta) {
      event.preventDefault();
      adjust.onChange(id, clampNudge(preset, offset.x + delta.x, offset.y + delta.y));
      return;
    }
    // Backspace/Delete puts this one block back where the template had it.
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      adjust.onChange(id, { x: 0, y: 0 });
    }
  }

  // Outlines scale with the canvas so they stay hairline-thin in the preview
  // rather than swelling into slabs on the 1240px-wide A4.
  const ring = Math.max(2, Math.round(preset.width / 400));

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Move ${SLOT_LABELS[id]}`}
      aria-pressed={selected}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      style={{
        ...style,
        ...offsetStyle,
        cursor: "move",
        outline: `${ring}px ${selected ? "solid" : "dashed"} ${
          selected ? "rgba(37,99,235,0.95)" : "rgba(37,99,235,0.45)"
        }`,
        outlineOffset: ring * 2,
        borderRadius: style?.borderRadius ?? ring * 2,
        touchAction: "none",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Templates are laid out in *design units*, not pixels: one unit is 1/1080th
 * of the reference canvas. A single set of numbers then renders correctly at
 * 1080 square, 1200 wide and 1240 for A4 — which is what lets one template
 * serve every format instead of needing a variant per orientation.
 *
 * Scaling on width alone would size a 1200×630 banner off its long edge and
 * blow the copy straight out the bottom, so height is folded in: the `1.35`
 * is the tallest aspect that still counts as width-limited, which leaves every
 * portrait format on a clean 1× and only pulls wide ones down.
 */
export function unit(preset: FormatPreset) {
  const u = Math.min(preset.width, preset.height * 1.35) / 1080;
  return (n: number) => `${Math.round(n * u * 100) / 100}px`;
}

/**
 * Applied to the block a template is willing to lose first when a format is
 * too short for its content. Without it, flex overflow pushes the price and
 * contact details off the canvas — losing a feature bullet is recoverable,
 * losing the phone number makes the brochure useless.
 */
export const CLIPPABLE = {
  flexShrink: 1,
  minHeight: 0,
  overflow: "hidden",
} as const;

/**
 * next/font exposes the family through a CSS variable. Referencing the
 * variable keeps the brochure on the same faces as the rest of the app, and
 * the literal fallbacks keep it legible if the webfont hasn't loaded.
 */
export const SERIF = 'var(--font-playfair), "Playfair Display", Georgia, serif';
export const SANS = 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif';

export function photoFill(photo: Photo | undefined): CSSProperties {
  if (!photo?.url) return {};
  return {
    backgroundImage: `url("${photo.url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

/**
 * The photos a layout will actually place, capped at what it can hold. Every
 * template renders however many it is given up to its own limit, so adding a
 * third photo fills a thumbnail slot rather than being silently ignored.
 */
export function usablePhotos(doc: BrochureDoc, limit: number): Photo[] {
  return doc.photos.slice(0, Math.max(1, limit));
}

/**
 * A strip of secondary photos. Shared by the layouts that grew a thumbnail
 * rail, so they stay visually consistent with each other.
 */
export function ThumbStrip({
  photos,
  vertical,
  thickness,
  radius,
  gap,
  border,
}: {
  photos: Photo[];
  vertical: boolean;
  thickness: string;
  radius: string;
  gap: string;
  border?: string;
}) {
  if (photos.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        gap,
        flexShrink: 0,
        width: vertical ? thickness : undefined,
        height: vertical ? undefined : thickness,
      }}
    >
      {photos.map((photo, i) => (
        <div
          key={`${photo.ref}-${i}`}
          style={{
            flex: "1 1 0",
            minWidth: 0,
            minHeight: 0,
            borderRadius: radius,
            border,
            ...photoFill(photo),
          }}
        />
      ))}
    </div>
  );
}

/**
 * Stands in for a missing photo so the canvas reads as "nothing here yet"
 * rather than looking like a broken layout.
 */
export function Placeholder({
  theme,
  style,
  label = "Add a photo",
  scale,
}: {
  theme: BrochureTheme;
  style?: CSSProperties;
  label?: string;
  scale: (n: number) => string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.accentSoft,
        color: theme.onAccentSoft,
        fontFamily: SANS,
        fontSize: scale(22),
        fontWeight: 600,
        letterSpacing: scale(1),
        opacity: 0.65,
        ...style,
      }}
    >
      {label}
    </div>
  );
}

/**
 * How the brochure signs itself: the organisation's uploaded logo, or its name
 * set in the display serif when no logo has been uploaded yet — so a brand-new
 * organisation still produces a properly signed brochure rather than a blank
 * space where the mark should be.
 *
 * `onDark` picks the light-on-dark variant when the block sits on the accent.
 * The `<img>` is subject to the same canvas tainting as a photo, so the export
 * path inlines it as a data URL before rasterising (see lib/syncmedia/images).
 */
export function BrandMark({
  scale,
  color,
  brand,
  onDark = false,
  markHeight = 96,
  wordSize = 40,
}: {
  scale: (n: number) => string;
  /** Colour for the wordmark fallback. */
  color: string;
  brand: BrandKit;
  onDark?: boolean;
  /** Cap on the logo's height, in design units. */
  markHeight?: number;
  wordSize?: number;
}) {
  const src = onDark ? brand.logoOnDarkUrl ?? brand.logoUrl : brand.logoUrl;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={{
          height: scale(markHeight),
          // Wide wordmark logos would otherwise stretch past the canvas edge.
          maxWidth: scale(markHeight * 5),
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
        }}
      />
    );
  }

  return (
    <span
      style={{
        fontFamily: SERIF,
        fontWeight: 500,
        fontSize: scale(wordSize),
        lineHeight: 1.05,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {brand.orgName}
    </span>
  );
}

/** Up to two initials from the organisation's name, for the tile fallback. */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * The mark in a filled tile, for layouts with no room for a full lockup.
 *
 * Falls back to the organisation's initials rather than the whole name — a
 * long agency name in a square tile is unreadable at any size.
 */
export function BrandTile({
  size,
  bg,
  fg,
  radius,
  brand,
  onDark = true,
}: {
  size: string;
  bg: string;
  fg: string;
  radius: string;
  brand: BrandKit;
  onDark?: boolean;
}) {
  const src = onDark ? brand.logoOnDarkUrl ?? brand.logoUrl : brand.logoUrl;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          style={{
            width: `calc(${size} * 0.74)`,
            height: `calc(${size} * 0.74)`,
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            color: fg,
            fontSize: `calc(${size} * 0.42)`,
            lineHeight: 1,
            letterSpacing: `calc(${size} * -0.01)`,
          }}
        >
          {initialsOf(brand.orgName)}
        </span>
      )}
    </div>
  );
}

/** WhatsApp glyph in a filled disc, for the contact bar. */
export function WhatsAppBadge({
  size,
  bg,
  fg,
}: {
  size: string;
  bg: string;
  fg: string;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill={fg}
        style={{ transform: "scale(0.62)" }}
        aria-hidden
      >
        <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.82 9.82 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 016.99 2.9 9.82 9.82 0 012.9 7c0 5.45-4.44 9.87-9.9 9.87zm8.42-18.29A11.8 11.8 0 0012.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.94L.07 24l6.32-1.66a11.9 11.9 0 005.66 1.44h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z" />
      </svg>
    </span>
  );
}

/**
 * Name over phone-and-email, with the WhatsApp mark when the agent has said
 * the number takes WhatsApp. Shared so the toggle behaves the same on every
 * layout instead of each one deciding for itself.
 */
export function ContactLines({
  doc,
  scale,
  color,
  mutedColor,
  behind,
  nameSize = 26,
  detailSize = 24,
  align = "left",
  extra,
}: {
  doc: BrochureDoc;
  scale: (n: number) => string;
  color: string;
  mutedColor: string;
  /**
   * The colour behind this block. The WhatsApp glyph is knocked out of the
   * disc in it, so the mark reads on a solid panel and on a white bar alike.
   */
  behind: string;
  nameSize?: number;
  detailSize?: number;
  align?: "left" | "right";
  /** Appended after the email, e.g. a reference number. */
  extra?: string;
}) {
  const details = joinParts([doc.agentPhone, doc.agentEmail, extra], "  ·  ");
  const showMark = doc.whatsappContact && doc.agentPhone.trim().length > 0;

  return (
    <div style={{ textAlign: align, minWidth: 0 }}>
      {doc.agentName ? (
        <p
          style={{
            margin: 0,
            fontFamily: SANS,
            fontSize: scale(nameSize),
            fontWeight: 700,
            color,
            lineHeight: 1.25,
          }}
        >
          {doc.agentName}
        </p>
      ) : null}
      {details ? (
        <div
          style={{
            marginTop: scale(5),
            display: "flex",
            alignItems: "center",
            justifyContent: align === "right" ? "flex-end" : "flex-start",
            gap: scale(9),
          }}
        >
          {showMark ? (
            <WhatsAppBadge size={scale(detailSize * 1.15)} bg={color} fg={behind} />
          ) : null}
          <span
            style={{
              fontFamily: SANS,
              fontSize: scale(detailSize),
              color: mutedColor,
            }}
          >
            {details}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** Drops blanks and caps the list at what the layout can actually hold. */
export function usableFeatures(doc: BrochureDoc, limit: number): string[] {
  return doc.features.map((f) => f.trim()).filter(Boolean).slice(0, limit);
}

/** Truthy-only join, so an empty reference or location leaves no stray dot. */
export function joinParts(parts: (string | undefined)[], sep = " · "): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(sep);
}
