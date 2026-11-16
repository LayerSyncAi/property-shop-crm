/**
 * "Get in touch" enquiries from the SyncEstate landing page and
 * layersyncai.com.
 *
 * A visitor leaves a name and phone number; we keep them here and their
 * browser opens a WhatsApp chat with LayerSync, prefilled with their name.
 * The SyncEstate landing page calls `submit` directly; layersyncai.com posts
 * to the `/website-enquiry` HTTP route (convex/http.ts), which calls `record`.
 * LayerSync staff see the list on the Platform page.
 */
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { requirePlatformAdmin } from "./helpers";
import { checkRateLimit } from "./rateLimit";
import { cleanEnquiry, type EnquiryInput } from "./lib/websiteEnquiries";

const enquiryArgs = {
  name: v.string(),
  phone: v.string(),
  site: v.optional(v.union(v.literal("syncestate"), v.literal("layersync"))),
  interest: v.optional(v.string()),
  page: v.optional(v.string()),
  cta: v.optional(v.string()),
};

const statusValidator = v.union(v.literal("new"), v.literal("contacted"), v.literal("archived"));

/** Save an enquiry. One row per phone number: a repeat updates it and marks it new again. */
async function recordEnquiry(ctx: MutationCtx, input: EnquiryInput): Promise<void> {
  const cleaned = cleanEnquiry(input);
  if (!cleaned.ok) throw new ConvexError(cleaned.error);
  const e = cleaned.value;

  await checkRateLimit(ctx, "websiteEnquiry", "all");

  const now = Date.now();
  const existing = await ctx.db
    .query("websiteEnquiries")
    .withIndex("by_phone", (q) => q.eq("phoneDigits", e.phoneDigits))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      name: e.name,
      phone: e.phone,
      site: e.site,
      // Keep what they asked about last time when this visit didn't say.
      interest: e.interest ?? existing.interest,
      page: e.page ?? existing.page,
      cta: e.cta ?? existing.cta,
      status: "new",
      submissions: existing.submissions + 1,
      lastSubmittedAt: now,
    });
    return;
  }

  await ctx.db.insert("websiteEnquiries", {
    ...e,
    status: "new",
    submissions: 1,
    createdAt: now,
    lastSubmittedAt: now,
  });
}

/** Public: the SyncEstate landing page's "Get in touch" form. No sign-in. */
export const submit = mutation({
  args: enquiryArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await recordEnquiry(ctx, args);
    return null;
  },
});

/** Called by the public HTTP route for layersyncai.com (convex/http.ts). */
export const record = internalMutation({
  args: enquiryArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await recordEnquiry(ctx, args);
    return null;
  },
});

/** Platform admins: the latest enquiries, newest first. */
export const list = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, { status }) => {
    await requirePlatformAdmin(ctx);
    const rows = status
      ? await ctx.db
          .query("websiteEnquiries")
          .withIndex("by_status_last_submitted", (q) => q.eq("status", status))
          .order("desc")
          .take(300)
      : await ctx.db.query("websiteEnquiries").withIndex("by_last_submitted").order("desc").take(300);
    return rows;
  },
});

/** Platform admins: count of enquiries nobody has picked up yet. */
export const countNew = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const rows = await ctx.db
      .query("websiteEnquiries")
      .withIndex("by_status_last_submitted", (q) => q.eq("status", "new"))
      .take(1000);
    return rows.length;
  },
});

/** Platform admins: mark an enquiry contacted, archived or new again. */
export const setStatus = mutation({
  args: { id: v.id("websiteEnquiries"), status: statusValidator },
  returns: v.null(),
  handler: async (ctx, { id, status }) => {
    await requirePlatformAdmin(ctx);
    const row = await ctx.db.get(id);
    if (!row) throw new ConvexError("Enquiry not found");
    await ctx.db.patch(id, { status });
    return null;
  },
});
