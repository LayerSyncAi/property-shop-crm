import { describe, it, expect } from "vitest";
import {
  normalizeArea,
  canonicalizeArea,
  canonicalizeAreas,
  areaMatchesLocation,
<<<<<<< HEAD
  ZW_AREA_NAMES,
} from "../../convex/lib/locations";
=======
  createAreaTools,
} from "../../convex/lib/locations";
import { ZIMBABWE_AREAS } from "../../convex/lib/areaSeed.zimbabwe";

// The default exports are bound to the generic (empty) upstream seed, so they
// only exercise the dataset-independent plumbing (normalization, abbreviation
// expansion, title-casing, substring matching).
>>>>>>> upstream/main

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

<<<<<<< HEAD
describe("canonicalizeArea", () => {
  it("snaps known abbreviations to the official suburb name", () => {
=======
describe("canonicalizeArea (generic seed)", () => {
  it("expands abbreviations and title-cases", () => {
>>>>>>> upstream/main
    expect(canonicalizeArea("mt pleasant")).toBe("Mount Pleasant");
    expect(canonicalizeArea("MT PLEASANT")).toBe("Mount Pleasant");
  });

<<<<<<< HEAD
  it("resolves explicit aliases to the canonical name", () => {
    expect(canonicalizeArea("Bluffhill")).toBe("Bluff Hill");
    expect(canonicalizeArea("Kumalo")).toBe("Khumalo");
    expect(canonicalizeArea("CBD")).toBe("Harare CBD");
  });

=======
>>>>>>> upstream/main
  it("title-cases unknown free-text areas without dropping them", () => {
    expect(canonicalizeArea("greenfields farm")).toBe("Greenfields Farm");
  });

  it("returns empty string for blank input", () => {
    expect(canonicalizeArea("   ")).toBe("");
  });
});

<<<<<<< HEAD
describe("canonicalizeAreas", () => {
=======
describe("canonicalizeAreas (generic seed)", () => {
>>>>>>> upstream/main
  it("dedupes case-insensitively after canonicalization and preserves order", () => {
    expect(
      canonicalizeAreas(["Mt Pleasant", "Mount Pleasant", "Borrowdale", "  "])
    ).toEqual(["Mount Pleasant", "Borrowdale"]);
  });
});

<<<<<<< HEAD
describe("areaMatchesLocation", () => {
=======
describe("areaMatchesLocation (generic seed)", () => {
>>>>>>> upstream/main
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

<<<<<<< HEAD
describe("ZW_AREA_NAMES coverage", () => {
  it("includes the spec's known suburbs and previously-missing ones", () => {
=======
// Alias reconciliation (e.g. "CBD" -> "Harare CBD", "Bluffhill" -> "Bluff Hill")
// depends on a curated dataset. Exercise it against the bundled Zimbabwe
// reference seed via createAreaTools — the same path a ZW deployment uses.
describe("createAreaTools with the Zimbabwe reference seed", () => {
  const zw = createAreaTools(ZIMBABWE_AREAS);

  it("snaps known abbreviations to the official suburb name", () => {
    expect(zw.canonicalizeArea("mt pleasant")).toBe("Mount Pleasant");
  });

  it("resolves explicit aliases to the canonical name", () => {
    expect(zw.canonicalizeArea("Bluffhill")).toBe("Bluff Hill");
    expect(zw.canonicalizeArea("Kumalo")).toBe("Khumalo");
    expect(zw.canonicalizeArea("CBD")).toBe("Harare CBD");
  });

  it("area names include the spec's known suburbs and previously-missing ones", () => {
>>>>>>> upstream/main
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
<<<<<<< HEAD
      expect(ZW_AREA_NAMES).toContain(name);
    }
  });

  it("is deduplicated and sorted", () => {
    expect(new Set(ZW_AREA_NAMES).size).toBe(ZW_AREA_NAMES.length);
    const sorted = [...ZW_AREA_NAMES].sort((a, b) => a.localeCompare(b));
    expect(ZW_AREA_NAMES).toEqual(sorted);
=======
      expect(zw.areaNames).toContain(name);
    }
  });

  it("area names are deduplicated and sorted", () => {
    expect(new Set(zw.areaNames).size).toBe(zw.areaNames.length);
    const sorted = [...zw.areaNames].sort((a, b) => a.localeCompare(b));
    expect(zw.areaNames).toEqual(sorted);
>>>>>>> upstream/main
  });
});
