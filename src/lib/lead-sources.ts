// Single source of truth for lead `source` values and their display labels.
// Keep in sync with the `leads.source` union in convex/schema.ts.
//
// Portal values (`propertybook`, `property_co_zw`) deliberately reuse the
// strings from src/lib/marketing-channels.ts: reports bucket lead `source` and
// marketing `channel` into one keyspace, so matching values make per-portal
// spend line up with the leads it produced.
//
// `property_portal` is the retired generic bucket. It stays in the union so
// historical rows keep validating, but it is NOT offered for new leads — pick
// the specific portal instead. See LEAD_SOURCE_OPTIONS vs ALL_LEAD_SOURCES.

export type LeadSource =
  | "walk_in"
  | "referral"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "whatsapp"
  | "website"
  | "propertybook"
  | "property_co_zw"
  | "property_portal"
  | "other";

/** The retired generic portal bucket, kept only for historical leads. */
export const LEGACY_PORTAL_SOURCE = "property_portal" as const;

/**
 * Every source value, including retired ones. Use for filter dropdowns,
 * report legends and anywhere existing leads are rendered.
 */
export const ALL_LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: "walk_in", label: "Walk-in" },
  { value: "referral", label: "Referral" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Website" },
  { value: "propertybook", label: "PropertyBook" },
  { value: "property_co_zw", label: "Property.co.zw" },
  { value: "property_portal", label: "Other portal" },
  { value: "other", label: "Other" },
];

/**
 * Sources selectable when creating or editing a lead. Excludes the retired
 * generic portal bucket so new leads always name the real platform.
 */
export const LEAD_SOURCE_OPTIONS: { value: LeadSource; label: string }[] =
  ALL_LEAD_SOURCES.filter((o) => o.value !== LEGACY_PORTAL_SOURCE);

export const LEAD_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  ALL_LEAD_SOURCES.map((o) => [o.value, o.label])
);

export function leadSourceLabel(source: string): string {
  return (
    LEAD_SOURCE_LABELS[source] ??
    source.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}
