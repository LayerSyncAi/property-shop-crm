import { describe, it, expect } from "vitest";
import {
  isBuyerTenantContact,
  isOwnerContact,
  ownerTypeMatches,
  roleForProperty,
} from "../../convex/lib/contactRoles";

describe("isBuyerTenantContact", () => {
  it("treats a legacy contact with no role flags as a buyer/tenant", () => {
    // Every contact predates the Owners module, so it must keep showing up
    // under Contacts exactly as it did before.
    expect(isBuyerTenantContact({})).toBe(true);
  });

  it("treats an owner-only contact as not a buyer/tenant", () => {
    expect(isBuyerTenantContact({ ownerType: "landlord" })).toBe(false);
  });

  it("respects an explicit flag over the legacy default", () => {
    expect(isBuyerTenantContact({ isBuyerTenant: false })).toBe(false);
    expect(
      isBuyerTenantContact({ ownerType: "seller", isBuyerTenant: true })
    ).toBe(true);
  });
});

describe("isOwnerContact", () => {
  it("is true only when an owner role is set", () => {
    expect(isOwnerContact({})).toBe(false);
    expect(isOwnerContact({ isBuyerTenant: true })).toBe(false);
    expect(isOwnerContact({ ownerType: "seller" })).toBe(true);
    expect(isOwnerContact({ ownerType: "both" })).toBe(true);
  });
});

describe("ownerTypeMatches", () => {
  it("matches everything when no filter is given", () => {
    expect(ownerTypeMatches("seller", undefined)).toBe(true);
    expect(ownerTypeMatches(undefined, undefined)).toBe(true);
  });

  it("matches an exact role", () => {
    expect(ownerTypeMatches("seller", "seller")).toBe(true);
    expect(ownerTypeMatches("seller", "landlord")).toBe(false);
  });

  it("matches 'both' against either role", () => {
    expect(ownerTypeMatches("both", "seller")).toBe(true);
    expect(ownerTypeMatches("both", "landlord")).toBe(true);
  });

  it("never matches a contact with no owner role", () => {
    expect(ownerTypeMatches(undefined, "seller")).toBe(false);
  });
});

describe("roleForProperty", () => {
  it("uses the owner's role when it is unambiguous", () => {
    expect(roleForProperty("seller", "rent")).toBe("seller");
    expect(roleForProperty("landlord", "sale")).toBe("landlord");
  });

  it("resolves 'both' from the listing type", () => {
    expect(roleForProperty("both", "rent")).toBe("landlord");
    expect(roleForProperty("both", "sale")).toBe("seller");
  });
});
