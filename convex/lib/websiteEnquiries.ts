/**
 * Website enquiries: the "Get in touch" form on the SyncEstate landing page
 * and on layersyncai.com. A visitor leaves a name and phone number, we keep
 * them here, and their browser opens a WhatsApp chat with LayerSync.
 *
 * Dependency-free so the cleaning rules can be unit-tested without the
 * Convex runtime.
 */
import { toE164 } from "../sms";

export const ENQUIRY_SITES = ["syncestate", "layersync"] as const;
export type EnquirySite = (typeof ENQUIRY_SITES)[number];

export const ENQUIRY_STATUSES = ["new", "contacted", "archived"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_LIMITS = {
  name: 80,
  interest: 80,
  page: 200,
  cta: 40,
} as const;

export type EnquiryInput = {
  name: string;
  phone: string;
  site?: string;
  interest?: string;
  page?: string;
  cta?: string;
};

export type CleanEnquiry = {
  name: string;
  /** The number as an international string, e.g. +263775187682. */
  phone: string;
  /** Digits only, the key one person's enquiries are grouped by. */
  phoneDigits: string;
  site: EnquirySite;
  interest?: string;
  page?: string;
  cta?: string;
};

/** Trim, collapse whitespace and cut to `max` characters; empty becomes undefined. */
function tidy(value: string | undefined, max: number): string | undefined {
  const s = (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  return s || undefined;
}

/**
 * Validate and normalise what a visitor typed. Local Zimbabwe numbers
 * ("077 123 4567") get +263, the rule SMS sending uses.
 */
export function cleanEnquiry(input: EnquiryInput): { ok: true; value: CleanEnquiry } | { ok: false; error: string } {
  const name = tidy(input.name, ENQUIRY_LIMITS.name);
  if (!name || name.length < 2) return { ok: false, error: "Please enter your name." };

  const e164 = toE164(input.phone ?? "");
  const phoneDigits = e164 ? e164.slice(1) : "";
  if (!e164 || phoneDigits.length < 9 || phoneDigits.length > 15 || !/^\d+$/.test(phoneDigits)) {
    return { ok: false, error: "Please enter a phone number we can reach you on." };
  }

  const site: EnquirySite = (ENQUIRY_SITES as readonly string[]).includes(input.site ?? "")
    ? (input.site as EnquirySite)
    : "layersync";

  return {
    ok: true,
    value: {
      name,
      phone: e164,
      phoneDigits,
      site,
      interest: tidy(input.interest, ENQUIRY_LIMITS.interest),
      page: tidy(input.page, ENQUIRY_LIMITS.page),
      cta: tidy(input.cta, ENQUIRY_LIMITS.cta),
    },
  };
}
