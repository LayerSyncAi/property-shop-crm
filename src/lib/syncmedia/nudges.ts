import type { FormatKey, FormatPreset } from "./formats";

/**
 * Manual position adjustments on top of a template's automatic layout.
 *
 * The templates lay themselves out in flow — that is what lets one template
 * serve all five formats. So a nudge is deliberately *not* a free-form
 * position: it is an offset applied to a block that the template has already
 * placed. Everything else stays where the template put it, and a layout that
 * has never been touched behaves exactly as before.
 *
 * The offsets are what let an agent fix the last 5% — a headline sitting a
 * little low, a price crowding the bullets — without anyone having to reopen
 * the template code.
 */

/**
 * The blocks an agent can move. A shared vocabulary rather than per-template
 * ids: every layout is built from the same handful of pieces, so "the price"
 * means the same thing everywhere and a slot label can be written once.
 *
 * Templates opt in — each wraps whichever of these it actually renders.
 */
export type SlotId =
  | "logo"
  | "eyebrow"
  | "headline"
  | "hero"
  | "thumbs"
  | "features"
  | "price"
  | "contact";

export const SLOT_LABELS: Record<SlotId, string> = {
  logo: "Logo",
  eyebrow: "Kicker",
  headline: "Headline",
  hero: "Main photo",
  thumbs: "Small photos",
  features: "Features",
  price: "Price",
  contact: "Contact details",
};

/**
 * One adjustment. Stored flat rather than as a nested map so it validates as a
 * plain array in Convex and needs no conversion layer between the database and
 * the editor.
 *
 * `x`/`y` are in *canvas* pixels — the same coordinate space the format
 * exports at — so an offset means the same distance in the preview as it does
 * in the downloaded PNG regardless of how the preview happens to be scaled.
 */
export interface Nudge {
  format: FormatKey;
  slot: SlotId;
  x: number;
  y: number;
}

/**
 * Adjustments are per format on purpose. A headline nudged down to clear a
 * tall hero on the portrait post would collide with the contact bar on the
 * 1200×630 banner, so the two cannot share one number — switching format has
 * to give back that format's own adjustments, including none at all.
 */
export function getNudge(
  nudges: Nudge[] | undefined,
  format: FormatKey,
  slot: SlotId
): { x: number; y: number } {
  const found = nudges?.find((n) => n.format === format && n.slot === slot);
  return found ? { x: found.x, y: found.y } : { x: 0, y: 0 };
}

/**
 * How far a block may travel: a quarter of the canvas each way. Enough to
 * rescue any layout that is merely slightly off, and little enough that a
 * fumbled drag can't fling the phone number off the page and leave an agent
 * staring at a brochure with no obvious way back.
 */
const RANGE = 0.25;

export function clampNudge(
  preset: FormatPreset,
  x: number,
  y: number
): { x: number; y: number } {
  const limitX = preset.width * RANGE;
  const limitY = preset.height * RANGE;
  return {
    x: Math.round(Math.min(limitX, Math.max(-limitX, x))),
    y: Math.round(Math.min(limitY, Math.max(-limitY, y))),
  };
}

/**
 * Upsert, dropping entries that are back at zero so an adjusted-then-undone
 * block leaves nothing behind — `hasNudges` stays honest and the row stays
 * small.
 */
export function setNudge(
  nudges: Nudge[] | undefined,
  format: FormatKey,
  slot: SlotId,
  offset: { x: number; y: number }
): Nudge[] {
  const rest = (nudges ?? []).filter((n) => !(n.format === format && n.slot === slot));
  if (offset.x === 0 && offset.y === 0) return rest;
  return [...rest, { format, slot, x: offset.x, y: offset.y }];
}

/** Clears one format's adjustments, or all of them when no format is given. */
export function clearNudges(nudges: Nudge[] | undefined, format?: FormatKey): Nudge[] {
  if (format === undefined) return [];
  return (nudges ?? []).filter((n) => n.format !== format);
}

export function hasNudges(nudges: Nudge[] | undefined, format?: FormatKey): boolean {
  if (!nudges || nudges.length === 0) return false;
  return format === undefined ? true : nudges.some((n) => n.format === format);
}
