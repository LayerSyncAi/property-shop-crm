import { httpRouter } from "convex/server";
import { ConvexError } from "convex/values";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

/*
 * Public "Get in touch" endpoint for layersyncai.com (and any other LayerSync
 * marketing site). The browser posts { name, phone, site, interest, page, cta }
 * and then opens WhatsApp; see convex/websiteEnquiries.ts.
 *
 * The form is public, so any origin may post. Sites send the body as
 * text/plain so the browser skips the CORS preflight and a keepalive request
 * survives the tab switching to WhatsApp.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const str = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

http.route({
  path: "/website-enquiry",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

http.route({
  path: "/website-enquiry",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const text = await request.text();
    if (text.length > 4000) return json(413, { ok: false, error: "Too large" });

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
      body = parsed as Record<string, unknown>;
    } catch {
      return json(400, { ok: false, error: "Send JSON" });
    }

    const site = str(body.site) === "syncestate" ? "syncestate" : "layersync";
    try {
      await ctx.runMutation(internal.websiteEnquiries.record, {
        name: str(body.name) ?? "",
        phone: str(body.phone) ?? "",
        site,
        interest: str(body.interest),
        page: str(body.page),
        cta: str(body.cta),
      });
    } catch (error) {
      const message = error instanceof ConvexError ? String(error.data) : "Could not save";
      const status = /rate limit/i.test(error instanceof Error ? error.message : "") ? 429 : 400;
      return json(status, { ok: false, error: message });
    }
    return json(200, { ok: true });
  }),
});

export default http;
