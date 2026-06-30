/**
 * Shared, dependency-free location utilities for preferred-area suggestions
 * and matching.
 *
 * This module is the single source of truth for:
 *  - the curated Zimbabwe area dataset used to seed suggestions, and
 *  - the normalization / matching primitives used everywhere a preferred area
 *    is compared against a property location.
 *
 * It is imported by both Convex functions (relative `./lib/locations`) and the
 * Next.js frontend (relative `../../../convex/lib/locations`). Keep it free of
 * any Convex server imports so it stays usable on both sides and in tests.
 *
 * Design decision (see docs/preferred-area-suggestions.md): we ship a
 * self-hosted dataset rather than calling Google Places. It is offline, free,
 * deterministic, and — unlike Places — lets us reconcile hand-typed variants
 * (e.g. "Mt Pleasant" -> "Mount Pleasant") against the free-text `location`
 * strings stored on properties.
 */

export interface ZwArea {
  /** Canonical display name, stored verbatim and shown in suggestions. */
  name: string;
  /** City / town the suburb belongs to (for grouping & future filtering). */
  city: string;
  /** Known spelling/abbreviation variants that should resolve to `name`. */
  aliases?: string[];
}

/**
 * Curated list of Zimbabwean suburbs / areas across the major cities.
 * Add entries here to expand coverage — this is the maintenance surface for
 * the "self-hosted dataset" decision.
 */
export const ZW_AREAS: ZwArea[] = [
  // ── Harare ──────────────────────────────────────────────────────────────
  { name: "Harare CBD", city: "Harare", aliases: ["CBD", "Town", "City Centre", "Central Business District", "Harare Town"] },
  { name: "The Avenues", city: "Harare", aliases: ["Avenues"] },
  { name: "Arcadia", city: "Harare" },
  { name: "Ashdown Park", city: "Harare" },
  { name: "Avondale", city: "Harare" },
  { name: "Avondale West", city: "Harare" },
  { name: "Avonlea", city: "Harare" },
  { name: "Belgravia", city: "Harare" },
  { name: "Belvedere", city: "Harare" },
  { name: "Bluff Hill", city: "Harare", aliases: ["Bluffhill"] },
  { name: "Borrowdale", city: "Harare" },
  { name: "Borrowdale Brooke", city: "Harare" },
  { name: "Borrowdale West", city: "Harare" },
  { name: "Budiriro", city: "Harare" },
  { name: "Chadcombe", city: "Harare" },
  { name: "Chisipite", city: "Harare" },
  { name: "Cranborne", city: "Harare" },
  { name: "Eastlea", city: "Harare" },
  { name: "Emerald Hill", city: "Harare" },
  { name: "Glen Lorne", city: "Harare" },
  { name: "Glen Norah", city: "Harare" },
  { name: "Glen View", city: "Harare", aliases: ["Glenview"] },
  { name: "Greendale", city: "Harare" },
  { name: "Greystone Park", city: "Harare" },
  { name: "Gunhill", city: "Harare" },
  { name: "Hatcliffe", city: "Harare" },
  { name: "Hatfield", city: "Harare" },
  { name: "Helensvale", city: "Harare" },
  { name: "Highfield", city: "Harare", aliases: ["Highfields"] },
  { name: "Highlands", city: "Harare" },
  { name: "Hillside", city: "Harare" },
  { name: "Hogerty Hill", city: "Harare" },
  { name: "Houghton Park", city: "Harare" },
  { name: "Kambuzuma", city: "Harare" },
  { name: "Kensington", city: "Harare" },
  { name: "Kuwadzana", city: "Harare" },
  { name: "Lochinvar", city: "Harare" },
  { name: "Mabelreign", city: "Harare" },
  { name: "Madokero", city: "Harare" },
  { name: "Mainway Meadows", city: "Harare" },
  { name: "Mandara", city: "Harare" },
  { name: "Marimba Park", city: "Harare" },
  { name: "Marlborough", city: "Harare", aliases: ["Malborough"] },
  { name: "Mbare", city: "Harare" },
  { name: "Meyrick Park", city: "Harare" },
  { name: "Milton Park", city: "Harare" },
  { name: "Mount Pleasant", city: "Harare", aliases: ["Mt Pleasant", "Mnt Pleasant"] },
  { name: "Mufakose", city: "Harare" },
  { name: "Newlands", city: "Harare" },
  { name: "Northwood", city: "Harare" },
  { name: "Pomona", city: "Harare" },
  { name: "Prospect", city: "Harare" },
  { name: "Queensdale", city: "Harare" },
  { name: "Rolf Valley", city: "Harare" },
  { name: "Sentosa", city: "Harare" },
  { name: "Strathaven", city: "Harare" },
  { name: "Sunningdale", city: "Harare" },
  { name: "Sunridge", city: "Harare" },
  { name: "The Grange", city: "Harare", aliases: ["Grange"] },
  { name: "Tynwald", city: "Harare" },
  { name: "Vainona", city: "Harare" },
  { name: "Warren Park", city: "Harare" },
  { name: "Waterfalls", city: "Harare" },
  { name: "Westgate", city: "Harare" },
  { name: "Westlea", city: "Harare" },
  { name: "Willowvale", city: "Harare" },

  // ── Greater Harare / satellite towns ────────────────────────────────────
  { name: "Chitungwiza", city: "Chitungwiza" },
  { name: "Norton", city: "Norton" },
  { name: "Ruwa", city: "Ruwa" },
  { name: "Epworth", city: "Epworth" },
  { name: "Domboshava", city: "Domboshava" },

  // ── Bulawayo ────────────────────────────────────────────────────────────
  { name: "Bulawayo CBD", city: "Bulawayo", aliases: ["Bulawayo Town", "Bulawayo City Centre"] },
  { name: "Ascot", city: "Bulawayo" },
  { name: "Barbourfields", city: "Bulawayo" },
  { name: "Bradfield", city: "Bulawayo" },
  { name: "Burnside", city: "Bulawayo" },
  { name: "Famona", city: "Bulawayo" },
  { name: "Hillcrest", city: "Bulawayo" },
  { name: "Hillside (Bulawayo)", city: "Bulawayo", aliases: ["Hillside Bulawayo"] },
  { name: "Khumalo", city: "Bulawayo", aliases: ["Kumalo"] },
  { name: "Mahatshula", city: "Bulawayo" },
  { name: "Malindela", city: "Bulawayo" },
  { name: "Montrose", city: "Bulawayo" },
  { name: "Northend", city: "Bulawayo", aliases: ["North End"] },
  { name: "Nketa", city: "Bulawayo" },
  { name: "Nkulumane", city: "Bulawayo" },
  { name: "Parklands", city: "Bulawayo" },
  { name: "Pelandaba", city: "Bulawayo" },
  { name: "Pumula", city: "Bulawayo" },
  { name: "Queens Park", city: "Bulawayo" },
  { name: "Riverside", city: "Bulawayo" },
  { name: "Selborne Park", city: "Bulawayo" },
  { name: "Suburbs", city: "Bulawayo" },
  { name: "Woodville", city: "Bulawayo" },

  // ── Mutare ──────────────────────────────────────────────────────────────
  { name: "Mutare CBD", city: "Mutare", aliases: ["Mutare Town"] },
  { name: "Chikanga", city: "Mutare" },
  { name: "Dangamvura", city: "Mutare" },
  { name: "Fairbridge Park", city: "Mutare" },
  { name: "Florida", city: "Mutare" },
  { name: "Greenside", city: "Mutare" },
  { name: "Morningside", city: "Mutare" },
  { name: "Murambi", city: "Mutare" },
  { name: "Palmerston", city: "Mutare" },
  { name: "Sakubva", city: "Mutare" },
  { name: "Yeovil", city: "Mutare" },
  { name: "Zimunya", city: "Mutare" },

  // ── Gweru ───────────────────────────────────────────────────────────────
  { name: "Gweru CBD", city: "Gweru", aliases: ["Gweru Town"] },
  { name: "Mkoba", city: "Gweru" },
  { name: "Mtapa", city: "Gweru" },
  { name: "Nashville", city: "Gweru" },
  { name: "Senga", city: "Gweru" },
  { name: "Southdowns", city: "Gweru" },
  { name: "Windsor Park", city: "Gweru" },

  // ── Masvingo ────────────────────────────────────────────────────────────
  { name: "Masvingo CBD", city: "Masvingo", aliases: ["Masvingo Town"] },
  { name: "Mucheke", city: "Masvingo" },
  { name: "Rhodene", city: "Masvingo" },
  { name: "Rujeko", city: "Masvingo" },
  { name: "Target Kopje", city: "Masvingo" },

  // ── Other cities & towns ────────────────────────────────────────────────
  { name: "Beitbridge", city: "Beitbridge" },
  { name: "Bindura", city: "Bindura" },
  { name: "Chegutu", city: "Chegutu" },
  { name: "Chinhoyi", city: "Chinhoyi" },
  { name: "Chiredzi", city: "Chiredzi" },
  { name: "Hwange", city: "Hwange" },
  { name: "Kadoma", city: "Kadoma" },
  { name: "Karoi", city: "Karoi" },
  { name: "Kariba", city: "Kariba" },
  { name: "Kwekwe", city: "Kwekwe" },
  { name: "Marondera", city: "Marondera" },
  { name: "Redcliff", city: "Redcliff" },
  { name: "Rusape", city: "Rusape" },
  { name: "Victoria Falls", city: "Victoria Falls", aliases: ["Vic Falls"] },
  { name: "Zvishavane", city: "Zvishavane" },
];

/**
 * Deduplicated, alphabetically sorted list of canonical area names used to
 * seed the per-org suggestion list.
 */
export const ZW_AREA_NAMES: string[] = Array.from(
  new Set(ZW_AREAS.map((a) => a.name))
).sort((a, b) => a.localeCompare(b));

/**
 * Word-level abbreviation expansions applied during normalization so that
 * hand-typed shorthand reconciles with canonical names. Kept deliberately
 * small and unambiguous to avoid wrong expansions.
 */
const ABBREVIATIONS: Record<string, string> = {
  mt: "mount",
  mnt: "mount",
  ext: "extension",
  pk: "park",
  hts: "heights",
  hgts: "heights",
  gdns: "gardens",
  vic: "victoria",
};

/**
 * Normalize an area / location string to a stable comparison key:
 * lowercase, punctuation stripped, whitespace collapsed, and known
 * abbreviations expanded word-by-word.
 */
export function normalizeArea(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/[._/]/g, " ") // dots, underscores, slashes -> space
    .replace(/[^a-z0-9\s-]/g, "") // drop other punctuation, keep hyphen for now
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ABBREVIATIONS[w] ?? w)
    .join(" ")
    .trim();
}

// normalized canonical name -> display name
const NORM_TO_DISPLAY = new Map<string, string>();
// normalized alias -> normalized canonical name
const ALIAS_TO_CANON = new Map<string, string>();

for (const area of ZW_AREAS) {
  const canonNorm = normalizeArea(area.name);
  if (canonNorm) NORM_TO_DISPLAY.set(canonNorm, area.name);
  for (const alias of area.aliases ?? []) {
    const aliasNorm = normalizeArea(alias);
    if (aliasNorm) ALIAS_TO_CANON.set(aliasNorm, canonNorm);
  }
}

/**
 * Resolve a raw string to its normalized canonical key — applying alias
 * mapping when the normalized form is a known variant. Returns the plain
 * normalized form for unknown areas (still useful for matching).
 */
function canonicalKey(raw: string): string {
  const n = normalizeArea(raw);
  if (!n) return "";
  if (NORM_TO_DISPLAY.has(n)) return n;
  return ALIAS_TO_CANON.get(n) ?? n;
}

function titleCase(normalized: string): string {
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Canonicalize an area for *storage*. Known suburbs / aliases snap to the
 * official display name; unknown free-text areas are cleaned and title-cased
 * so they are stored consistently and remain matchable. Never throws and
 * never drops a non-empty input (falls back to the trimmed original).
 */
export function canonicalizeArea(raw: string): string {
  if (!raw || !raw.trim()) return "";
  const key = canonicalKey(raw);
  const display = NORM_TO_DISPLAY.get(key);
  if (display) return display;
  return titleCase(key) || raw.trim();
}

/**
 * Canonicalize a list of areas: trim, canonicalize, and drop empties /
 * case-insensitive duplicates while preserving order.
 */
export function canonicalizeAreas(areas: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of areas) {
    const canonical = canonicalizeArea(raw);
    if (!canonical) continue;
    const dedupeKey = canonical.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(canonical);
  }
  return out;
}

/**
 * The single shared primitive for deciding whether a preferred `area` matches
 * a property `location`. Both sides are normalized (abbreviations expanded)
 * and alias-resolved before a two-way containment check, so "Mt Pleasant",
 * "Mount Pleasant", and a property at "12 Mount Pleasant, Harare" all match.
 */
export function areaMatchesLocation(area: string, location: string): boolean {
  const a = canonicalKey(area);
  const l = normalizeArea(location);
  if (!a || !l) return false;
  if (l.includes(a) || a.includes(l)) return true;
  // Resolve whole-string aliases on the location side too (e.g. "CBD").
  const lc = canonicalKey(location);
  if (lc !== l && (lc.includes(a) || a.includes(lc))) return true;
  return false;
}
