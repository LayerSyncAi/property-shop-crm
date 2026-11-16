import { describe, it, expect } from "vitest";
import { cleanEnquiry } from "../../convex/lib/websiteEnquiries";
import { enquiryWhatsAppMessage, salesWhatsApp, whatsAppLink } from "../config/marketing";

describe("cleanEnquiry", () => {
  it("normalises a local Zimbabwe number and tidies the name", () => {
    const r = cleanEnquiry({ name: "  Rudo   Chikwanha ", phone: "077 123 4567", site: "syncestate" });
    expect(r).toEqual({
      ok: true,
      value: {
        name: "Rudo Chikwanha",
        phone: "+263771234567",
        phoneDigits: "263771234567",
        site: "syncestate",
        interest: undefined,
        page: undefined,
        cta: undefined,
      },
    });
  });

  it("keeps international numbers", () => {
    const r = cleanEnquiry({ name: "Thandi", phone: "+27 82 123 4567" });
    expect(r.ok && r.value.phone).toBe("+27821234567");
  });

  it("defaults an unknown site to layersync", () => {
    const r = cleanEnquiry({ name: "Tendai", phone: "0775187682", site: "elsewhere" });
    expect(r.ok && r.value.site).toBe("layersync");
  });

  it("rejects a missing name or an unusable number", () => {
    expect(cleanEnquiry({ name: " ", phone: "0771234567" }).ok).toBe(false);
    expect(cleanEnquiry({ name: "Farai", phone: "12" }).ok).toBe(false);
    expect(cleanEnquiry({ name: "Farai", phone: "call me" }).ok).toBe(false);
  });

  it("cuts long fields down to size", () => {
    const r = cleanEnquiry({ name: "x".repeat(200), phone: "0771234567", interest: "y".repeat(200) });
    expect(r.ok && r.value.name.length).toBe(80);
    expect(r.ok && r.value.interest?.length).toBe(80);
  });
});

describe("enquiry WhatsApp message", () => {
  it("defaults to LayerSync's sales number", () => {
    expect(salesWhatsApp).toBe("263775187682");
  });

  it("introduces the visitor by name and number", () => {
    const msg = enquiryWhatsAppMessage({ name: "Rudo", phone: "+263771234567", interest: "SyncStay" });
    expect(msg).toBe("Hi LayerSync! I'm Rudo (+263771234567). I'm interested in SyncStay for my agency. Can we chat?");
    expect(whatsAppLink(msg)).toContain("https://wa.me/263775187682?text=Hi%20LayerSync!%20I'm%20Rudo");
  });

  it("falls back to SyncEstate when no module was named", () => {
    expect(enquiryWhatsAppMessage({ name: "Rudo", phone: "+263771234567" })).toBe(
      "Hi LayerSync! I'm Rudo (+263771234567). I run an estate agency and I'm interested in SyncEstate. Can we chat?"
    );
  });
});
