/**
 * Owners — the sellers and landlords whose property the agency represents.
 *
 * An owner is a contact carrying an `ownerType` role rather than a record in a
 * table of its own, because the same person is very often both a landlord and a
 * buyer. Keeping one record per person means phone dedupe, agent assignment,
 * the activity timeline and search all work across both sides of the business
 * instead of being duplicated and drifting apart.
 *
 * These functions are deliberately thin wrappers over the contacts helpers —
 * access control and phone normalisation live there and are reused, not
 * reimplemented.
 *
 * Careful with the word "owner": `contacts.ownerUserIds` and
 * `properties.ownerUserIds` mean the AGENT who owns the record. Everything in
 * this file means the client who owns the property.
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  getCurrentUserWithOrg,
  assertOrgAccess,
  isEffectiveAdmin,
  canAccessPropertyPrivate,
  assertCanAccessPropertyPrivate,
} from "./helpers";
import { Id, Doc } from "./_generated/dataModel";
import { canAccessContact, normalizePhone, ownerTypeValidator } from "./contacts";
import {
  isOwnerContact,
  isBuyerTenantContact,
  ownerTypeMatches,
  roleForProperty,
} from "./lib/contactRoles";

/** The role an owner holds on one specific property. */
const propertyOwnerRole = v.union(v.literal("seller"), v.literal("landlord"));

function userLabel(u: Doc<"users"> | null | undefined): string {
  return u?.fullName || u?.name || u?.email || "Unknown";
}

// ── List / read ──────────────────────────────────────────────────────

/**
 * Owners visible to the caller, with the same search, agent-scoping and
 * pagination behaviour as the Contacts list.
 */
export const list = query({
  args: {
    q: v.optional(v.string()),
    ownerUserId: v.optional(v.id("users")),
    ownerType: v.optional(ownerTypeValidator),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const isAdmin = isEffectiveAdmin(user);

    const [contacts, users] = await Promise.all([
      ctx.db.query("contacts").withIndex("by_org", (q) => q.eq("orgId", user.orgId)).collect(),
      ctx.db.query("users").withIndex("by_org", (q) => q.eq("orgId", user.orgId)).collect(),
    ]);
    const userMap = new Map(users.map((u) => [u._id, u]));

    const filtered = contacts.filter((contact) => {
      if (!isOwnerContact(contact)) return false;

      if (!isAdmin && !contact.ownerUserIds.includes(user._id)) return false;
      if (isAdmin && args.ownerUserId && !contact.ownerUserIds.includes(args.ownerUserId)) {
        return false;
      }

      if (!ownerTypeMatches(contact.ownerType, args.ownerType)) return false;

      if (args.q) {
        const search = args.q.toLowerCase();
        const nameMatch = contact.name.toLowerCase().includes(search);
        const phoneMatch =
          contact.phone?.includes(search) ||
          contact.normalizedPhone?.includes(normalizePhone(search));
        const emailMatch = contact.email?.toLowerCase().includes(search);
        const companyMatch = contact.company?.toLowerCase().includes(search);
        if (!nameMatch && !phoneMatch && !emailMatch && !companyMatch) return false;
      }

      return true;
    });

    // How many properties each owner is linked to — the headline figure on the
    // Owners list. One query for the whole org beats one per owner.
    const links = await ctx.db
      .query("propertyOwners")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();
    const propertyCounts = new Map<string, number>();
    for (const link of links) {
      const key = link.contactId as string;
      propertyCounts.set(key, (propertyCounts.get(key) ?? 0) + 1);
    }

    const enriched = filtered
      .map((contact) => ({
        ...contact,
        ownerNames: contact.ownerUserIds.map((id) => userLabel(userMap.get(id))),
        propertyCount: propertyCounts.get(contact._id as string) ?? 0,
        alsoBuyerTenant: isBuyerTenantContact(contact),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const page = args.page ?? 0;
    const pageSize = args.pageSize ?? 50;
    const totalCount = enriched.length;
    const start = page * pageSize;

    return {
      items: enriched.slice(start, start + pageSize),
      totalCount,
      page,
      pageSize,
      hasMore: start + pageSize < totalCount,
      isAdmin,
    };
  },
});

/** One owner plus the properties they hold. */
export const getById = query({
  args: { ownerId: v.id("contacts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const contact = await canAccessContact(
      ctx,
      args.ownerId,
      user._id,
      isEffectiveAdmin(user),
      user.orgId
    );
    if (!contact || !isOwnerContact(contact)) return null;

    const links = await ctx.db
      .query("propertyOwners")
      .withIndex("by_contact", (q) => q.eq("contactId", args.ownerId))
      .collect();

    const properties = await Promise.all(
      links.map(async (link) => {
        const property = await ctx.db.get(link.propertyId);
        if (!property) return null;
        return {
          _id: property._id,
          title: property.title,
          location: property.location,
          status: property.status,
          listingType: property.listingType,
          price: property.price,
          currency: property.currency,
          role: link.role,
          linkedAt: link.linkedAt,
        };
      })
    );

    const agents = await Promise.all(
      contact.ownerUserIds.map(async (id: Id<"users">) => ({
        _id: id,
        name: userLabel(await ctx.db.get(id)),
      }))
    );

    return {
      ...contact,
      agents,
      alsoBuyerTenant: isBuyerTenantContact(contact),
      // Narrowing filter: a link whose property was deleted resolves to null
      // and must not leak into the response type as a nullable row.
      properties: properties.filter(
        (p): p is NonNullable<typeof p> => p !== null
      ),
    };
  },
});

// ── Create / update ──────────────────────────────────────────────────

/**
 * Create an owner. If a contact with the same phone already exists, the role is
 * added to that contact instead of creating a second record for one person.
 */
export const create = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    ownerType: ownerTypeValidator,
    ownerUserIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const now = Date.now();

    const normalized = args.phone ? normalizePhone(args.phone) : undefined;
    if (normalized) {
      const existing = await ctx.db
        .query("contacts")
        .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
        .collect();
      const match = existing.find((c) => c.normalizedPhone === normalized);
      if (match) {
        // Already on file — promote them rather than duplicating the person.
        await ctx.db.patch(match._id, {
          ownerType: args.ownerType,
          updatedAt: now,
        });
        return { contactId: match._id, promotedExisting: true };
      }
    }

    const owners =
      user.role === "admin" && args.ownerUserIds?.length
        ? args.ownerUserIds
        : [user._id];

    const contactId = await ctx.db.insert("contacts", {
      name: args.name,
      phone: args.phone || undefined,
      normalizedPhone: normalized,
      email: args.email,
      company: args.company,
      notes: args.notes,
      ownerType: args.ownerType,
      // Created purely as an owner: they only show under Contacts once someone
      // marks them as a buyer/tenant too.
      isBuyerTenant: false,
      ownerUserIds: owners,
      createdByUserId: user._id,
      orgId: user.orgId,
      createdAt: now,
      updatedAt: now,
    });

    return { contactId, promotedExisting: false };
  },
});

export const update = mutation({
  args: {
    ownerId: v.id("contacts"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    ownerType: v.optional(ownerTypeValidator),
    ownerUserIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const contact = await canAccessContact(
      ctx,
      args.ownerId,
      user._id,
      isEffectiveAdmin(user),
      user.orgId
    );
    if (!contact) throw new Error("Owner not found or access denied");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) {
      updates.phone = args.phone;
      updates.normalizedPhone = normalizePhone(args.phone);
    }
    if (args.email !== undefined) updates.email = args.email;
    if (args.company !== undefined) updates.company = args.company;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.ownerType !== undefined) updates.ownerType = args.ownerType;

    if (isEffectiveAdmin(user) && args.ownerUserIds !== undefined) {
      if (args.ownerUserIds.length === 0) {
        throw new Error("Owner must be assigned to at least one agent");
      }
      updates.ownerUserIds = args.ownerUserIds;
    }

    await ctx.db.patch(args.ownerId, updates);
  },
});

/**
 * Drop the owner role. The contact record survives if they are also a
 * buyer/tenant — deleting it would take their leads and history with it — and
 * is removed only when the owner role was the sole reason it existed.
 */
export const remove = mutation({
  args: { ownerId: v.id("contacts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const contact = await canAccessContact(
      ctx,
      args.ownerId,
      user._id,
      isEffectiveAdmin(user),
      user.orgId
    );
    if (!contact) throw new Error("Owner not found or access denied");

    const links = await ctx.db
      .query("propertyOwners")
      .withIndex("by_contact", (q) => q.eq("contactId", args.ownerId))
      .collect();
    for (const link of links) {
      await ctx.db.delete(link._id);
    }

    if (isBuyerTenantContact(contact)) {
      await ctx.db.patch(args.ownerId, {
        ownerType: undefined,
        updatedAt: Date.now(),
      });
      return { deletedContact: false, unlinkedProperties: links.length };
    }

    await ctx.db.delete(args.ownerId);
    return { deletedContact: true, unlinkedProperties: links.length };
  },
});

// ── Property links ───────────────────────────────────────────────────

/** The owners linked to one property. */
export const listForProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const property = await ctx.db.get(args.propertyId);
    if (!property) return [];
    assertOrgAccess(property, user.orgId);
    // Who a property's seller/landlord is sits alongside the mandate, so it
    // follows the same private-data gate as documents rather than being
    // visible to everyone who can see the listing.
    if (!(await canAccessPropertyPrivate(ctx, property, user))) return [];

    const links = await ctx.db
      .query("propertyOwners")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    const rows = await Promise.all(
      links.map(async (link) => {
        const contact = await ctx.db.get(link.contactId);
        if (!contact) return null;
        return {
          linkId: link._id,
          contactId: contact._id,
          name: contact.name,
          phone: contact.phone ?? null,
          email: contact.email ?? null,
          ownerType: contact.ownerType ?? null,
          role: link.role,
          linkedAt: link.linkedAt,
        };
      })
    );

    return rows.filter(Boolean);
  },
});

/**
 * Link an existing owner to a property. Idempotent: re-linking the same pair
 * updates the role rather than creating a duplicate row.
 */
export const linkToProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    contactId: v.id("contacts"),
    role: v.optional(propertyOwnerRole),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const isAdmin = isEffectiveAdmin(user);

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");
    assertOrgAccess(property, user.orgId);
    await assertCanAccessPropertyPrivate(ctx, property, user);

    const contact = await canAccessContact(
      ctx,
      args.contactId,
      user._id,
      isAdmin,
      user.orgId
    );
    if (!contact) throw new Error("Owner not found or access denied");

    const now = Date.now();

    // Linking a plain contact makes them an owner — that is the point of the
    // action, so record the role rather than rejecting it.
    if (!isOwnerContact(contact)) {
      await ctx.db.patch(args.contactId, {
        ownerType: property.listingType === "rent" ? "landlord" : "seller",
        updatedAt: now,
      });
    }

    const role =
      args.role ??
      roleForProperty(
        (contact.ownerType ??
          (property.listingType === "rent" ? "landlord" : "seller")) as
          | "seller"
          | "landlord"
          | "both",
        property.listingType
      );

    const existing = await ctx.db
      .query("propertyOwners")
      .withIndex("by_property_contact", (q) =>
        q.eq("propertyId", args.propertyId).eq("contactId", args.contactId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role });
      return existing._id;
    }

    return ctx.db.insert("propertyOwners", {
      propertyId: args.propertyId,
      contactId: args.contactId,
      role,
      linkedByUserId: user._id,
      linkedAt: now,
      orgId: user.orgId,
    });
  },
});

/**
 * Create an owner and link them to a property in one step — the quick-add on
 * the property record, mirroring how a contact is created from a lead.
 */
export const quickAddForProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    ownerType: v.optional(ownerTypeValidator),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");
    assertOrgAccess(property, user.orgId);
    await assertCanAccessPropertyPrivate(ctx, property, user);

    // Default the role from the listing: a rental has a landlord, a sale has a
    // seller. The agent can change it afterwards.
    const ownerType =
      args.ownerType ?? (property.listingType === "rent" ? "landlord" : "seller");

    const now = Date.now();
    const normalized = args.phone ? normalizePhone(args.phone) : undefined;

    let contactId: Id<"contacts"> | null = null;
    if (normalized) {
      const existing = await ctx.db
        .query("contacts")
        .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
        .collect();
      const match = existing.find((c) => c.normalizedPhone === normalized);
      if (match) {
        contactId = match._id;
        await ctx.db.patch(match._id, { ownerType, updatedAt: now });
      }
    }

    if (!contactId) {
      contactId = await ctx.db.insert("contacts", {
        name: args.name,
        phone: args.phone || undefined,
        normalizedPhone: normalized,
        email: args.email,
        ownerType,
        isBuyerTenant: false,
        ownerUserIds: [user._id],
        createdByUserId: user._id,
        orgId: user.orgId,
        createdAt: now,
        updatedAt: now,
      });
    }

    const role = roleForProperty(ownerType, property.listingType);

    const existingLink = await ctx.db
      .query("propertyOwners")
      .withIndex("by_property_contact", (q) =>
        q.eq("propertyId", args.propertyId).eq("contactId", contactId!)
      )
      .first();

    if (!existingLink) {
      await ctx.db.insert("propertyOwners", {
        propertyId: args.propertyId,
        contactId,
        role,
        linkedByUserId: user._id,
        linkedAt: now,
        orgId: user.orgId,
      });
    }

    return { contactId };
  },
});

export const unlinkFromProperty = mutation({
  args: { linkId: v.id("propertyOwners") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const link = await ctx.db.get(args.linkId);
    if (!link) return;
    assertOrgAccess(link, user.orgId);

    const property = await ctx.db.get(link.propertyId);
    await assertCanAccessPropertyPrivate(ctx, property, user);

    // Unlinking only breaks the property relationship; the owner record stays.
    await ctx.db.delete(args.linkId);
  },
});
