import { describe, it, expect } from "vitest";
import {
  buildLeadDetailsPatch,
  type LeadDetailsCurrent,
} from "../../convex/leadEditLib";

const canonicalizeAreas = (areas: string[]) =>
  Array.from(new Set(areas.map((a) => a.trim()).filter(Boolean)));

const base: LeadDetailsCurrent = {
  fullName: "Jane Moyo",
  phone: "+263 77 123 4567",
  email: "jane@example.com",
  source: "walk_in",
  interestType: "buy",
  budgetCurrency: "USD",
  budgetMin: 50000,
  budgetMax: 120000,
  preferredAreas: ["Borrowdale"],
  notes: "",
};

const opts = { canonicalizeAreas, requireContactInfo: false };

describe("buildLeadDetailsPatch", () => {
  it("returns an empty patch when nothing changed", () => {
    const r = buildLeadDetailsPatch(base, { fullName: "Jane Moyo", budgetMin: 50000 }, opts);
    expect(r.error).toBeNull();
    expect(r.changedFields).toEqual([]);
    expect(r.leadPatch).toEqual({});
    expect(r.identityPatch).toEqual({});
  });

  it("writes identity fields to both the lead and the contact patch", () => {
    const r = buildLeadDetailsPatch(
      base,
      { fullName: "  Jane M. Moyo ", email: "Jane.New@Example.com", phone: "0771234567" },
      opts
    );
    expect(r.error).toBeNull();
    expect(r.changedFields).toEqual(["fullName", "phone", "email"]);
    expect(r.leadPatch).toMatchObject({
      fullName: "Jane M. Moyo",
      phone: "0771234567",
      normalizedPhone: "0771234567",
      email: "jane.new@example.com",
    });
    expect(r.identityPatch).toEqual({
      fullName: "Jane M. Moyo",
      phone: "0771234567",
      normalizedPhone: "0771234567",
      email: "jane.new@example.com",
    });
  });

  it("clears phone/email with an empty string and budgets with null", () => {
    const r = buildLeadDetailsPatch(base, { email: "", budgetMin: null }, opts);
    expect(r.error).toBeNull();
    expect(r.changedFields).toEqual(["email", "budgetMin"]);
    expect("email" in r.leadPatch && r.leadPatch.email === undefined).toBe(true);
    expect("email" in r.identityPatch && r.identityPatch.email === undefined).toBe(true);
    expect("budgetMin" in r.leadPatch && r.leadPatch.budgetMin === undefined).toBe(true);
  });

  it("rejects a budget range where min exceeds max, including against the stored value", () => {
    expect(buildLeadDetailsPatch(base, { budgetMin: 200000 }, opts).error).toMatch(/Minimum budget/);
    expect(buildLeadDetailsPatch(base, { budgetMin: 10, budgetMax: 5 }, opts).error).toMatch(/Minimum budget/);
    expect(buildLeadDetailsPatch(base, { budgetMax: null, budgetMin: 999999 }, opts).error).toBeNull();
  });

  it("validates name, phone and email formats", () => {
    expect(buildLeadDetailsPatch(base, { fullName: "J" }, opts).error).toMatch(/at least 2/);
    expect(buildLeadDetailsPatch(base, { phone: "12" }, opts).error).toMatch(/valid phone/);
    expect(buildLeadDetailsPatch(base, { email: "nope" }, opts).error).toMatch(/valid email/);
  });

  it("keeps a progressed lead contactable", () => {
    const strict = { ...opts, requireContactInfo: true };
    expect(buildLeadDetailsPatch(base, { phone: "", email: "" }, strict).error).toMatch(/phone number or an email/);
    expect(buildLeadDetailsPatch(base, { phone: "" }, strict).error).toBeNull();
    expect(buildLeadDetailsPatch({ ...base, email: undefined }, { phone: "" }, strict).error).toMatch(/phone number/);
    // Not enforced on a brand-new lead
    expect(buildLeadDetailsPatch(base, { phone: "", email: "" }, opts).error).toBeNull();
  });

  it("clears the source review flag once a real source is named", () => {
    const flagged = { ...base, source: "property_portal", sourceNeedsReview: true };
    const r = buildLeadDetailsPatch(flagged, { source: "propertybook" }, opts);
    expect(r.leadPatch.source).toBe("propertybook");
    expect("sourceNeedsReview" in r.leadPatch).toBe(true);
    // Still flagged while the legacy bucket remains
    const r2 = buildLeadDetailsPatch(flagged, { notes: "hi" }, opts);
    expect("sourceNeedsReview" in r2.leadPatch).toBe(false);
  });

  it("canonicalises and dedupes areas and ignores an unchanged list", () => {
    const r = buildLeadDetailsPatch(base, { preferredAreas: [" Borrowdale ", "Borrowdale", "Avondale"] }, opts);
    expect(r.leadPatch.preferredAreas).toEqual(["Borrowdale", "Avondale"]);
    expect(buildLeadDetailsPatch(base, { preferredAreas: ["Borrowdale"] }, opts).changedFields).toEqual([]);
  });
});
