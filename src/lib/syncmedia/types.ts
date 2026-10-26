import type { FormatKey } from "./formats";
import type { Nudge } from "./nudges";
import type { TemplateId } from "./templates";

/**
 * A photo on a brochure.
 *
 * `ref` is what persists — an absolute URL for a property image, a Convex
 * storage id for anything uploaded in the studio. `url` is display-only and is
 * swapped freely (for an object URL while uploading, for a data URL while
 * exporting), so saving a draft must never write it back as the ref.
 */
export interface Photo {
  ref: string;
  url: string;
}

/**
 * Everything a brochure is. One flat document so the whole editor is a single
 * `useState` and every control is a pure `patch()` — no step-local state that
 * can drift out of sync with the canvas.
 */
export interface BrochureDoc {
  formatKey: FormatKey;
  templateId: TemplateId;
  themeId: ThemeId;
  photos: Photo[];
  /** Small letter-spaced kicker above the title, e.g. "FOR SALE". */
  eyebrow: string;
  title: string;
  location: string;
  price: string;
  /** Caption above the price, e.g. "Asking price" or "Rent per month". */
  priceLabel: string;
  features: string[];
  reference: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  showLogo: boolean;
  /** Marks the phone number as WhatsApp-reachable on the brochure. */
  whatsappContact: boolean;
  /**
   * Manual position tweaks on top of the template's own layout, keyed by
   * format and block. Empty for every brochure that has never been adjusted,
   * which is the overwhelming majority — see `./nudges`.
   */
  nudges: Nudge[];
}

export type ThemeId = "brand" | "midnight" | "ivory" | "slate" | "terracotta";

export type PageStyle = "light" | "cream" | "dark";

/**
 * The organisation's brand kit as the studio sees it, with every optional
 * field already resolved to a usable value. Built by `resolveBrandKit` from
 * the `orgBranding` row plus the app's own brand config, so a brand-new
 * organisation still produces a properly signed brochure.
 */
export interface BrandKit {
  orgName: string;
  accent: string;
  pageStyle: PageStyle;
  logoUrl?: string;
  logoOnDarkUrl?: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
}

/**
 * Templates never name a colour directly — they only ever read these tokens,
 * which is what lets any template render under any theme.
 *
 * Every value is a hex literal on purpose. Tailwind v4 emits `oklch()` for its
 * palette and html2canvas 1.4.1 throws on unsupported colour functions, so
 * anything that ends up inside an exported node must avoid utility classes and
 * CSS custom properties alike.
 */
export interface BrochureTheme {
  id: ThemeId;
  name: string;
  /** Page background. */
  page: string;
  /** Primary text on `page`. */
  ink: string;
  /** Secondary text on `page`. */
  inkSoft: string;
  /** Solid block colour — footers, panels, price bars. */
  accent: string;
  /** Text on `accent`. */
  onAccent: string;
  /** Tint of `accent` for chips and fills sitting on `page`. */
  accentSoft: string;
  /** Text on `accentSoft`. */
  onAccentSoft: string;
  /** Hairline rules and dividers on `page`. */
  line: string;
}

export const EMPTY_DOC: BrochureDoc = {
  formatKey: "social-portrait",
  templateId: "housestyle",
  themeId: "brand",
  photos: [],
  eyebrow: "FOR SALE",
  title: "",
  location: "",
  price: "",
  priceLabel: "Asking price",
  features: [],
  reference: "",
  agentName: "",
  agentPhone: "",
  agentEmail: "",
  showLogo: true,
  whatsappContact: true,
  nudges: [],
};
