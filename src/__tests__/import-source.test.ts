import { describe, it, expect } from "vitest";
import {
  parseLeadSource,
  resolveImportSource,
  LEAD_SOURCE_LABELS,
  LEAD_SOURCE_VALUES,
} from "../../convex/lib/leadSources";
import { ALL_LEAD_SOURCES } from "../lib/lead-sources";

describe("parseLeadSource", () => {
  it("accepts stored values regardless of case", () => {
    expect(parseLeadSource("propertybook")).toBe("propertybook");
    expect(parseLeadSource("PROPERTY_CO_ZW")).toBe("property_co_zw");
    expect(parseLeadSource(" walk_in ")).toBe("walk_in");
  });

  it("accepts display labels and common aliases", () => {
    expect(parseLeadSource("PropertyBook")).toBe("propertybook");
    expect(parseLeadSource("Property Book")).toBe("propertybook");
    expect(parseLeadSource("Property.co.zw")).toBe("property_co_zw");
    expect(parseLeadSource("Walk-in")).toBe("walk_in");
    expect(parseLeadSource("TikTok")).toBe("tiktok");
    expect(parseLeadSource("fb")).toBe("facebook");
  });

  it("returns null for empty or unknown input", () => {
    expect(parseLeadSource("")).toBeNull();
    expect(parseLeadSource(undefined)).toBeNull();
    expect(parseLeadSource("carrier pigeon")).toBeNull();
  });

  it("keeps the backend label map in step with the frontend list", () => {
    for (const { value, label } of ALL_LEAD_SOURCES) {
      expect(LEAD_SOURCE_LABELS[value]).toBe(label);
    }
    expect(Object.keys(LEAD_SOURCE_LABELS).sort()).toEqual([...LEAD_SOURCE_VALUES].sort());
  });
});

describe("resolveImportSource", () => {
  it("tags every row with the batch source in batch mode, even when the row has one", () => {
    expect(resolveImportSource("facebook", "propertybook", "batch")).toBe("propertybook");
    expect(resolveImportSource(undefined, "propertybook", "batch")).toBe("propertybook");
  });

  it("prefers a recognisable row source in column mode", () => {
    expect(resolveImportSource("Property.co.zw", "propertybook", "column")).toBe("property_co_zw");
    expect(resolveImportSource("referral", "propertybook", "column")).toBe("referral");
  });

  it("falls back to the batch source instead of 'other' in column mode", () => {
    expect(resolveImportSource("", "propertybook", "column")).toBe("propertybook");
    expect(resolveImportSource("unknown portal", "property_co_zw", "column")).toBe("property_co_zw");
  });
});
