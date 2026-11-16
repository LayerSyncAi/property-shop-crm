export type FormatKey =
  | "social-square"
  | "social-portrait"
  | "story"
  | "landscape"
  | "print-a4";

export interface FormatPreset {
  key: FormatKey;
  /** Short name for the format chip. */
  label: string;
  /** Where an agent would actually post this. */
  platforms: string[];
  /** One line of "use this when…" guidance. */
  blurb: string;
  /** Canvas size in px — templates render at exactly this size, 1:1 on export. */
  width: number;
  height: number;
  /** `"print"` formats export to PDF, `"social"` to PNG. */
  kind: "social" | "print";
  /** Physical page size, print formats only. */
  pdfMm?: { width: number; height: number };
}

export const FORMAT_PRESETS: FormatPreset[] = [
  {
    key: "social-portrait",
    label: "Feed portrait",
    platforms: ["Instagram", "Facebook"],
    blurb: "Tallest post the feed allows — the default for listings.",
    width: 1080,
    height: 1350,
    kind: "social",
  },
  {
    key: "social-square",
    label: "Square post",
    platforms: ["Instagram", "Facebook"],
    blurb: "Safe everywhere, and the right shape for carousels.",
    width: 1080,
    height: 1080,
    kind: "social",
  },
  {
    key: "story",
    label: "Story / Status",
    platforms: ["WhatsApp", "Instagram", "Facebook"],
    blurb: "Full-screen vertical for WhatsApp Status and Stories.",
    width: 1080,
    height: 1920,
    kind: "social",
  },
  {
    key: "landscape",
    label: "Link banner",
    platforms: ["Facebook", "LinkedIn", "X"],
    blurb: "Wide banner for shared links and page covers.",
    width: 1200,
    height: 630,
    kind: "social",
  },
  {
    key: "print-a4",
    label: "A4 flyer",
    platforms: ["Print", "Email", "WhatsApp document"],
    blurb: "Print-ready A4 at 150 DPI. Exports as PDF.",
    width: 1240,
    height: 1754,
    kind: "print",
    pdfMm: { width: 210, height: 297 },
  },
];

export function getFormat(key: FormatKey): FormatPreset {
  return FORMAT_PRESETS.find((p) => p.key === key) ?? FORMAT_PRESETS[0];
}

/**
 * Layout hint templates branch on. Aspect alone is what decides whether a
 * split reads as side-by-side or stacked, and how much vertical room there is
 * for optional rows.
 */
export function formatShape(preset: FormatPreset) {
  const aspect = preset.width / preset.height;
  return {
    aspect,
    /** Wider than it is tall — stack content horizontally. */
    isWide: aspect > 1.1,
    /** Story-tall — there is room for extra rows and bigger type. */
    isTall: aspect < 0.66,
    isPrint: preset.kind === "print",
  };
}
