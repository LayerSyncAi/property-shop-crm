/**
 * Which side of the business a contact belongs to.
 *
 * A person can be a buyer/tenant, a property owner (seller/landlord), or both —
 * the same human often is. Both are stored as role flags on one contact record
 * so phone dedupe, agent assignment and the activity timeline work across both
 * sides instead of being duplicated.
 *
 * Pure and Convex-free so the legacy-row semantics can be unit tested.
 */

export type OwnerTypeValue = "seller" | "landlord" | "both";

export interface ContactRoles {
  ownerType?: string;
  isBuyerTenant?: boolean;
}

/**
 * Contacts created before the Owners module have neither flag set, and must
 * read as buyers/tenants so they keep appearing where they always did. Once a
 * record carries an owner role, an unset `isBuyerTenant` means owner-only.
 */
export function isBuyerTenantContact(contact: ContactRoles): boolean {
  return contact.isBuyerTenant ?? contact.ownerType === undefined;
}

export function isOwnerContact(contact: ContactRoles): boolean {
  return contact.ownerType !== undefined;
}

/**
 * Does a contact's owner role match a filter? An owner marked "both" is a
 * seller and a landlord, so it matches either.
 */
export function ownerTypeMatches(
  ownerType: string | undefined,
  filter: OwnerTypeValue | undefined
): boolean {
  if (!filter) return true;
  if (ownerType === undefined) return false;
  if (ownerType === "both") return true;
  return ownerType === filter;
}

/**
 * The role to record when linking an owner to a property. An owner marked
 * "both" is still either selling or letting any given property, so fall back to
 * the listing type rather than guessing.
 */
export function roleForProperty(
  ownerType: OwnerTypeValue,
  listingType: "rent" | "sale"
): "seller" | "landlord" {
  if (ownerType !== "both") return ownerType;
  return listingType === "rent" ? "landlord" : "seller";
}
