import { v } from "convex/values";

/**
 * The canonical lead `source` type, defined once and reused by the schema,
 * every mutation that accepts a source, and the CSV importer — so a new source
 * can never be added to one and forgotten in another.
 *
 * Mirrored for the frontend in src/lib/lead-sources.ts, which also owns the
 * display labels. The two portal values match the marketing `channel` strings
 * in src/lib/marketing-channels.ts so reports bucket per-portal spend and the
 * leads it produced together.
 *
 * "property_portal" is the retired generic bucket. It remains valid so
 * pre-existing rows keep validating, but it is never offered for new leads —
 * see LEAD_SOURCE_OPTIONS in src/lib/lead-sources.ts.
 */
export const leadSourceValidator = v.union(
  v.literal("walk_in"),
  v.literal("referral"),
  v.literal("facebook"),
  v.literal("instagram"),
  v.literal("tiktok"),
  v.literal("whatsapp"),
  v.literal("website"),
  v.literal("propertybook"),
  v.literal("property_co_zw"),
  v.literal("property_portal"),
  v.literal("other")
);

export type LeadSourceValue = typeof leadSourceValidator.type;

/** The retired generic portal bucket, kept only for historical leads. */
export const LEGACY_PORTAL_SOURCE = "property_portal";

/**
 * The same values as a runtime list, for code that validates free-form input
 * (the CSV importer). The two assignments below fail to compile if this list
 * and the validator above ever drift apart.
 */
export const LEAD_SOURCE_VALUES = [
  "walk_in",
  "referral",
  "facebook",
  "instagram",
  "tiktok",
  "whatsapp",
  "website",
  "propertybook",
  "property_co_zw",
  "property_portal",
  "other",
] as const;

const _valuesCoverValidator: (typeof LEAD_SOURCE_VALUES)[number] =
  null as unknown as LeadSourceValue;
const _validatorCoversValues: LeadSourceValue =
  null as unknown as (typeof LEAD_SOURCE_VALUES)[number];
void _valuesCoverValidator;
void _validatorCoversValues;

/**
 * Display labels for every source, mirrored from src/lib/lead-sources.ts so the
 * CSV importer can recognise a human-typed label ("Property Book",
 * "property.co.zw") as well as the stored value. Keep the two in sync.
 */
export const LEAD_SOURCE_LABELS: Record<LeadSourceValue, string> = {
  walk_in: "Walk-in",
  referral: "Referral",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
  propertybook: "PropertyBook",
  property_co_zw: "Property.co.zw",
  property_portal: "Other portal",
  other: "Other",
};

/** Extra spellings a CSV is likely to carry, beyond the value and the label. */
const LEAD_SOURCE_ALIASES: Record<string, LeadSourceValue> = {
  "property book": "propertybook",
  "propertybook.co.zw": "propertybook",
  "property.co.zw": "property_co_zw",
  "propertycozw": "property_co_zw",
  "property co zw": "property_co_zw",
  "walk in": "walk_in",
  "walkin": "walk_in",
  "fb": "facebook",
  "ig": "instagram",
  "portal": "property_portal",
  "property portal": "property_portal",
};

function normalizeSourceKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

/**
 * Parse a free-form source string (CSV cell) into a known source value, or
 * null when it is empty / unrecognised. Matches the stored value, the display
 * label and a few common aliases, ignoring case, spacing and underscores.
 */
export function parseLeadSource(raw: string | undefined | null): LeadSourceValue | null {
  if (!raw) return null;
  const key = normalizeSourceKey(raw);
  if (!key) return null;
  for (const value of LEAD_SOURCE_VALUES) {
    if (normalizeSourceKey(value) === key) return value;
    if (normalizeSourceKey(LEAD_SOURCE_LABELS[value]) === key) return value;
  }
  return LEAD_SOURCE_ALIASES[key] ?? null;
}

export type ImportSourceMode = "batch" | "column";

/**
 * Decide the source for one imported row. In "batch" mode every row gets the
 * source chosen for the upload. In "column" mode a recognisable value in the
 * row wins and anything else falls back to the batch source — a row is never
 * silently filed under "other" any more.
 */
export function resolveImportSource(
  rowSource: string | undefined | null,
  batchSource: LeadSourceValue,
  mode: ImportSourceMode
): LeadSourceValue {
  if (mode === "column") {
    const parsed = parseLeadSource(rowSource);
    if (parsed) return parsed;
  }
  return batchSource;
}
