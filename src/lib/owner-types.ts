// Single source of truth for property-owner role values and their labels.
// Keep in sync with the `contacts.ownerType` union in convex/contacts.ts.
//
// "Owner" here always means the CLIENT who owns a property (its seller or
// landlord). The agent who owns a record is `ownerUserIds` and is labelled
// "assigned agent" in the UI.

export type OwnerType = "seller" | "landlord" | "both";

export const OWNER_TYPE_OPTIONS: { value: OwnerType; label: string }[] = [
  { value: "seller", label: "Seller" },
  { value: "landlord", label: "Landlord" },
  { value: "both", label: "Both" },
];

const OWNER_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  OWNER_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export function ownerTypeLabel(type: string | null | undefined): string {
  if (!type) return "—";
  return OWNER_TYPE_LABELS[type] ?? type;
}

/** The role an owner holds on one specific property. */
export type PropertyOwnerRole = "seller" | "landlord";

export const PROPERTY_OWNER_ROLE_OPTIONS: {
  value: PropertyOwnerRole;
  label: string;
}[] = [
  { value: "seller", label: "Seller" },
  { value: "landlord", label: "Landlord" },
];
