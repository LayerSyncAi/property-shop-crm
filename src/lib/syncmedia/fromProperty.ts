import { formatMoney } from "@/lib/currency";
import type { BrochureDoc, Photo } from "./types";

/**
 * The property half of a brochure, derived from a listing already in the CRM.
 *
 * Contact details are deliberately excluded: the agent making the brochure is
 * usually putting their *own* number on it, and swapping property shouldn't
 * silently rewrite who the enquiries go to.
 */
export type PropertySeed = Pick<
  BrochureDoc,
  | "title"
  | "location"
  | "reference"
  | "eyebrow"
  | "price"
  | "priceLabel"
  | "features"
  | "photos"
>;

/**
 * Only the fields a brochure reads. Structural rather than `Doc<"properties">`
 * so the picker can pass a query result that carries extra joined fields.
 */
export interface BrochureProperty {
  title: string;
  type: string;
  listingType: string;
  price: number;
  currency: string;
  location: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  commercialType?: string;
  zoning?: string;
  usageType?: string;
  description?: string;
  images: string[];
  pbRefCode?: string;
}

const TYPE_LABELS: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  land: "Land",
  commercial: "Commercial",
  other: "Property",
};

const COMMERCIAL_LABELS: Record<string, string> = {
  warehouse: "Warehouse",
  office: "Office",
  retail_shop: "Retail shop",
  industrial: "Industrial",
  mixed_use: "Mixed use",
  other: "Commercial",
};

/** Property images are stored as absolute URLs, so the ref and the url match. */
export function propertyPhotos(property: BrochureProperty): Photo[] {
  return property.images.map((url) => ({ ref: url, url }));
}

export function seedFromProperty(property: BrochureProperty): PropertySeed {
  const isRental = property.listingType === "rent";

  // SynCRM has no amenities column, so the structured columns become the
  // opening bullets and the agent edits the rest by hand.
  const features = [
    property.bedrooms
      ? `${property.bedrooms} Bedroom${property.bedrooms > 1 ? "s" : ""}`
      : null,
    property.bathrooms
      ? `${property.bathrooms} Bathroom${property.bathrooms > 1 ? "s" : ""}`
      : null,
    property.area ? `${property.area.toLocaleString("en-US")} m²` : null,
    property.commercialType
      ? COMMERCIAL_LABELS[property.commercialType] ?? null
      : TYPE_LABELS[property.type] ?? null,
    property.zoning ? `${property.zoning} zoning` : null,
    property.usageType || null,
  ].filter((v): v is string => Boolean(v));

  return {
    title: property.title,
    location: property.location,
    reference: property.pbRefCode ?? "",
    eyebrow: isRental ? "TO LET" : "FOR SALE",
    price: `${formatMoney(property.price, property.currency, { decimals: 0 })}${
      isRental ? " pm" : ""
    }`,
    priceLabel: isRental ? "Rent per month" : "Asking price",
    features,
    photos: propertyPhotos(property).slice(0, 4),
  };
}
