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
