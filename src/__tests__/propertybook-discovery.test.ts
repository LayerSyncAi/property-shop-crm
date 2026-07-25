import { describe, it, expect } from "vitest";
import { pickNewUrls } from "../../convex/propertyBook/discovery";

const BASE = "https://propertybook.co.zw/listings/for-sale";
const u = (slug: string) => `${BASE}/${slug}`;

// URLs end in "-<letters><digits>" so extractRefCodeFromUrl derives the ref code
// (e.g. ".../house-borrowdale-ref101" -> "REF101").
const p1 = u("house-borrowdale-ref101");
const p2 = u("flat-avondale-ref102");
const p3 = u("stand-mtpleasant-ref103");
const p4 = u("cottage-greendale-ref104");

describe("pickNewUrls", () => {
  it("returns all links (up to remaining) when nothing is excluded", () => {
    expect(pickNewUrls([p1, p2, p3], { remaining: 10 })).toEqual([p1, p2, p3]);
  });

  it("respects the remaining cap", () => {
    expect(pickNewUrls([p1, p2, p3, p4], { remaining: 2 })).toEqual([p1, p2]);
  });

  it("excludes listings already imported by exact source URL", () => {
    const picked = pickNewUrls([p1, p2, p3], {
      excludeSourceUrls: [p1, p3],
      remaining: 10,
    });
    expect(picked).toEqual([p2]);
  });

  it("excludes listings already imported by URL-derived ref code", () => {
    const picked = pickNewUrls([p1, p2, p3], {
      excludeRefCodes: ["REF102"],
      remaining: 10,
    });
    expect(picked).toEqual([p1, p3]);
  });

  it("matches ref codes case-insensitively", () => {
    const picked = pickNewUrls([p1, p2], {
      excludeRefCodes: ["ref101"],
      remaining: 10,
    });
    expect(picked).toEqual([p2]);
  });

  it("treats an all-excluded page as empty (caller keeps paging, does not stop)", () => {
    // The scraper decides 'agency exhausted' from links.length, not from this
    // helper returning [] — so a fully-imported page must yield [] here.
    const picked = pickNewUrls([p1, p2], {
      excludeRefCodes: ["REF101", "REF102"],
      remaining: 10,
    });
    expect(picked).toEqual([]);
  });

  it("skips urls already collected earlier in the run (seen set)", () => {
    const seen = new Set([p1]);
    expect(pickNewUrls([p1, p2, p3], { remaining: 10, seen })).toEqual([p2, p3]);
  });

  it("still returns a listing whose URL has no derivable ref code (only URL-excludable)", () => {
    const noRef = u("mystery-listing"); // no trailing -<letters><digits>
    expect(pickNewUrls([noRef], { excludeRefCodes: ["REF101"], remaining: 5 })).toEqual([
      noRef,
    ]);
    expect(pickNewUrls([noRef], { excludeSourceUrls: [noRef], remaining: 5 })).toEqual([]);
  });
});
