import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { LEGACY_PORTAL_SOURCE } from "./lib/leadSources";

/**
 * Backfill the ownership model onto pre-existing properties.
 *
 * Run from the CLI / dashboard:
 *   npx convex run migrations:backfillPropertyOwnership
 *   # repeat until it reports { isDone: true } for very large tables
 *
 * Rule (per spec): assign to the creating agent if known, otherwise the
 * company.
 *   - creator is an active agent  -> ownershipType "agent",  owners [creator]
 *   - creator is an admin/unknown -> ownershipType "company", owners []
 *
 * Idempotent: a property that already has `ownershipType` is skipped, so the
 * job is safe to re-run.
 */
export const backfillPropertyOwnership = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(Math.max(args.batchSize ?? 200, 1), 500);

    const all = await ctx.db.query("properties").collect();
    const pending = all.filter((p) => !p.ownershipType);

    let updated = 0;
    for (const property of pending) {
      if (updated >= batchSize) break;

      let ownershipType: "agent" | "company" = "company";
      let ownerUserIds: typeof property.ownerUserIds = [];

      if (property.createdByUserId) {
        const creator = await ctx.db.get(property.createdByUserId);
        if (creator && creator.isActive && creator.role === "agent") {
          ownershipType = "agent";
          ownerUserIds = [property.createdByUserId];
        }
      }

      await ctx.db.patch(property._id, { ownershipType, ownerUserIds });
      updated++;
    }

    const remaining = pending.length - updated;
    return {
      scanned: all.length,
      pending: pending.length,
      updated,
      remaining,
      isDone: remaining === 0,
    };
  },
});

/**
 * Make the contact role flags explicit on pre-existing contacts.
 *
 * Run from the CLI / dashboard:
 *   npx convex run migrations:backfillContactRoles
 *   # repeat until it reports { isDone: true } for very large tables
 *
 * Every contact that existed before the Owners module was a buyer/tenant, so
 * they get `isBuyerTenant: true` and no `ownerType`. The queries treat an unset
 * flag as true anyway; this backfill exists so the field is explicit rather
 * than implied, and so "buyer/tenant" can be filtered on directly.
 *
 * Idempotent: a contact that already has either role flag is skipped.
 */
export const backfillContactRoles = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(Math.max(args.batchSize ?? 200, 1), 500);

    const all = await ctx.db.query("contacts").collect();
    const pending = all.filter(
      (c) => c.isBuyerTenant === undefined && c.ownerType === undefined
    );

    let updated = 0;
    for (const contact of pending) {
      if (updated >= batchSize) break;
      await ctx.db.patch(contact._id, { isBuyerTenant: true });
      updated++;
    }

    const remaining = pending.length - updated;
    return {
      scanned: all.length,
      pending: pending.length,
      updated,
      remaining,
      isDone: remaining === 0,
    };
  },
});

/**
 * Flag leads still carrying the retired generic "property_portal" source so an
 * agent can reassign them to the real platform (PropertyBook / Property.co.zw).
 *
 * Run from the CLI / dashboard:
 *   npx convex run migrations:flagLegacyPortalLeads
 *   # repeat until it reports { isDone: true } for very large tables
 *
 * The source itself is deliberately NOT rewritten: guessing between portals
 * would invent data, and the brief asks for the distinction to be surfaced
 * rather than silently lost. Reassignment happens in /app/leads/source-review.
 *
 * Idempotent: a lead that already has `sourceNeedsReview` is skipped, so the
 * job is safe to re-run.
 */
export const flagLegacyPortalLeads = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = Math.min(Math.max(args.batchSize ?? 200, 1), 500);

    const all = await ctx.db.query("leads").collect();
    const pending = all.filter(
      (l) => l.source === LEGACY_PORTAL_SOURCE && l.sourceNeedsReview === undefined
    );

    let updated = 0;
    for (const lead of pending) {
      if (updated >= batchSize) break;
      await ctx.db.patch(lead._id, { sourceNeedsReview: true });
      updated++;
    }

    const remaining = pending.length - updated;
    return {
      scanned: all.length,
      pending: pending.length,
      updated,
      remaining,
      isDone: remaining === 0,
    };
  },
});
