import { describe, it, expect } from "vitest";
import {
  normalizeArea,
  canonicalizeArea,
  canonicalizeAreas,
  areaMatchesLocation,
  ZW_AREA_NAMES,
} from "../../convex/lib/locations";

describe("normalizeArea", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeArea("  Mount   Pleasant ")).toBe("mount pleasant");
  });

  it("expands known abbreviations", () => {
    expect(normalizeArea("Mt Pleasant")).toBe("mount pleasant");
    expect(normalizeArea("Vic Falls")).toBe("victoria falls");
  });

  it("strips punctuation", () => {
    expect(normalizeArea("Mt. Pleasant")).toBe("mount pleasant");
    expect(normalizeArea("Glen-View")).toBe("glen view");
  });

  it("returns empty string for blank input", () => {
    expect(normalizeArea("   ")).toBe("");
    expect(normalizeArea("")).toBe("");
  });
});

describe("canonicalizeArea", () => {
  it("snaps known abbreviations to the official suburb name", () => {
    expect(canonicalizeArea("mt pleasant")).toBe("Mount Pleasant");
    expect(canonicalizeArea("MT PLEASANT")).toBe("Mount Pleasant");
  });

  it("resolves explicit aliases to the canonical name", () => {
    expect(canonicalizeArea("Bluffhill")).toBe("Bluff Hill");
    expect(canonicalizeArea("Kumalo")).toBe("Khumalo");
    expect(canonicalizeArea("CBD")).toBe("Harare CBD");
  });

  it("title-cases unknown free-text areas without dropping them", () => {
    expect(canonicalizeArea("greenfields farm")).toBe("Greenfields Farm");
  });

  it("returns empty string for blank input", () => {
    expect(canonicalizeArea("   ")).toBe("");
  });
});

describe("canonicalizeAreas", () => {
  it("dedupes case-insensitively after canonicalization and preserves order", () => {
    expect(
      canonicalizeAreas(["Mt Pleasant", "Mount Pleasant", "Borrowdale", "  "])
    ).toEqual(["Mount Pleasant", "Borrowdale"]);
  });
});

describe("areaMatchesLocation", () => {
  it("matches a hand-typed variant against a property location", () => {
    expect(areaMatchesLocation("Mt Pleasant", "12 Acacia Rd, Mount Pleasant, Harare")).toBe(true);
  });

  it("matches a suggested area as a substring of a fuller location string", () => {
    expect(areaMatchesLocation("Borrowdale", "Borrowdale Brooke, Harare")).toBe(true);
  });

  it("matches regardless of casing and surrounding text", () => {
    expect(areaMatchesLocation("avondale", "AVONDALE WEST")).toBe(true);
  });

  it("does not match unrelated areas", () => {
    expect(areaMatchesLocation("Highlands", "Borrowdale, Harare")).toBe(false);
  });

  it("returns false for empty inputs", () => {
    expect(areaMatchesLocation("", "Harare")).toBe(false);
    expect(areaMatchesLocation("Avondale", "")).toBe(false);
  });
});

describe("ZW_AREA_NAMES coverage", () => {
  it("includes the spec's known suburbs and previously-missing ones", () => {
    const required = [
      "Avondale",
      "Highlands",
      "Borrowdale",
      "Mount Pleasant",
      "Waterfalls",
      "Glen View",
      "Kuwadzana",
      "Famona", // Bulawayo suburb absent from the old list
      "Chikanga", // Mutare suburb absent from the old list
      "Mkoba", // Gweru suburb absent from the old list
    ];
    for (const name of required) {
      expect(ZW_AREA_NAMES).toContain(name);
    }
  });

  it("is deduplicated and sorted", () => {
    expect(new Set(ZW_AREA_NAMES).size).toBe(ZW_AREA_NAMES.length);
    const sorted = [...ZW_AREA_NAMES].sort((a, b) => a.localeCompare(b));
    expect(ZW_AREA_NAMES).toEqual(sorted);
  });
});
