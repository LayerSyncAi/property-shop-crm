/**
 * Property Shop branding for the PUBLIC marketing surfaces only — the landing
 * page (`/`) and the auth screens (`/login`, etc.).
 *
 * This is intentionally separate from `src/config/brand.ts`, which remains the
 * white-label, env-driven source of truth for the authenticated app shell
 * (sidebar, metadata, in-app copy). These public screens are always branded
 * "Property Shop" regardless of the white-label vars.
 */

export const propertyShop = {
  /** Full product name. */
  name: "Property Shop",
  /** Wordmark split so it can be rendered two-tone (lead + gold accent). */
  nameLead: "Property",
  nameAccent: "Shop",
  /** Legal entity name for the footer. */
  legalName: "Property Shop",
  /** One-line tagline for the hero pill. */
  tagline: "The smarter CRM for modern real estate teams",
  /** Domain shown on the marketing browser mock. */
  appDomain: "app.propertyshop.com",
} as const;
