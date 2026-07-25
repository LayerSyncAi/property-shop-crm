/**
 * Pure, dependency-free helpers for the "Discover New Properties" flow.
 *
 * Kept free of any Convex server / network imports so the URL-selection logic
 * (which decides what gets scraped) is unit-testable in isolation — see
 * src/__tests__/propertybook-discovery.test.ts.
 */

import { extractRefCodeFromUrl } from "./parser";

export interface PickNewUrlsOptions {
  /** Ref codes already imported for this org+agency — skip listings matching. */
  excludeRefCodes?: Iterable<string>;
  /** Source URLs already imported for this org+agency — skip exact matches. */
  excludeSourceUrls?: Iterable<string>;
  /** How many NEW urls are still wanted (the remaining room under the cap). */
  remaining: number;
  /** URLs already collected on previous pages, to avoid intra-run duplicates. */
  seen?: Set<string>;
}

/**
 * From a single page's listing links, pick up to `remaining` that are NOT
 * already imported (by source URL or by URL-derived ref code) and not already
 * collected this run. Returns the picked urls in page order.
 *
 * This is the core of the sliding-window discovery: excluding already-imported
 * listings lets a re-run advance past what was pulled last time instead of
 * re-collecting the same first N.
 */
export function pickNewUrls(
  links: string[],
  { excludeRefCodes, excludeSourceUrls, remaining, seen }: PickNewUrlsOptions
): string[] {
  // Ref codes are compared case-insensitively — stored codes may be upper- or
  // mixed-case depending on whether they came from the page or the URL.
  const refSet = new Set(
    Array.from(excludeRefCodes ?? [], (r) => r.toUpperCase())
  );
  const urlSet = new Set(excludeSourceUrls ?? []);
  const seenSet = seen ?? new Set<string>();
  const picked: string[] = [];

  for (const link of links) {
    if (picked.length >= remaining) break;
    if (seenSet.has(link)) continue;
    if (urlSet.has(link)) continue;
    const ref = extractRefCodeFromUrl(link);
    if (ref && refSet.has(ref.toUpperCase())) continue;
    picked.push(link);
  }
  return picked;
}
