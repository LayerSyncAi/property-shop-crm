import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import {
  getCurrentUserWithOrg,
  assertOrgAccess,
  isEffectiveAdmin,
} from "./helpers";
import { recordAudit } from "./logs";

/**
 * Viewing forms: a signed record proving an agent introduced a client to a
 * property during a viewing. Supports commission claims and internal audit.
 *
 * Access model:
 *  - Everything is org-scoped.
 *  - Visibility: an (effective) admin sees every form in the org; an agent sees
 *    forms they created OR where they are the assigned negotiator (agentUserId).
 *  - Edit/delete: the creator or a real admin. A "completed" form is locked
 *    against further edits (except deletion by an admin) to preserve audit
 *    integrity.
 */

const signerFields = {
  clientName: v.string(),
  clientCompany: v.optional(v.string()),
  clientIdNumber: v.optional(v.string()),
  clientSpouseName: v.optional(v.string()),
  clientPhone: v.optional(v.string()),
  clientEmail: v.optional(v.string()),
  clientSignatureId: v.optional(v.id("_storage")),
  negotiatorName: v.string(),
  negotiatorSignatureId: v.optional(v.id("_storage")),
  sellerName: v.optional(v.string()),
  sellerSignatureId: v.optional(v.id("_storage")),
};

/** Whether `user` may see this viewing form (org already checked). */
function canSeeForm(form: Doc<"viewingForms">, user: Doc<"users">): boolean {
  if (isEffectiveAdmin(user)) return true;
  return form.createdByUserId === user._id || form.agentUserId === user._id;
}

/** Whether `user` may edit/delete this viewing form. Real admins always may. */
function canEditForm(form: Doc<"viewingForms">, user: Doc<"users">): boolean {
  return user.role === "admin" || form.createdByUserId === user._id;
}

/** Resolve the storage URLs for a form's three signature slots. */
async function resolveSignatureUrls(ctx: QueryCtx | MutationCtx, form: Doc<"viewingForms">) {
  const [clientSignatureUrl, negotiatorSignatureUrl, sellerSignatureUrl] =
    await Promise.all([
      form.clientSignatureId ? ctx.storage.getUrl(form.clientSignatureId) : null,
      form.negotiatorSignatureId
        ? ctx.storage.getUrl(form.negotiatorSignatureId)
        : null,
      form.sellerSignatureId ? ctx.storage.getUrl(form.sellerSignatureId) : null,
    ]);
  return { clientSignatureUrl, negotiatorSignatureUrl, sellerSignatureUrl };
}

/**
 * Verify each supplied parent link exists and belongs to the caller's org, and
 * return a sensible default property address if one wasn't typed.
 */
async function assertLinks(
  ctx: MutationCtx,
  orgId: Id<"organizations">,
  links: {
    propertyId?: Id<"properties">;
    contactId?: Id<"contacts">;
    leadId?: Id<"leads">;
    agentUserId: Id<"users">;
  }
) {
  if (links.propertyId) {
    const property = await ctx.db.get(links.propertyId);
    if (!property) throw new ConvexError("Property not found");
    assertOrgAccess(property, orgId);
  }
  if (links.contactId) {
    const contact = await ctx.db.get(links.contactId);
    if (!contact) throw new ConvexError("Contact not found");
    assertOrgAccess(contact, orgId);
  }
  if (links.leadId) {
    const lead = await ctx.db.get(links.leadId);
    if (!lead) throw new ConvexError("Lead not found");
    assertOrgAccess(lead, orgId);
  }
  const agent = await ctx.db.get(links.agentUserId);
  if (!agent) throw new ConvexError("Agent not found");
  assertOrgAccess(agent, orgId);
}

export const create = mutation({
  args: {
    propertyId: v.optional(v.id("properties")),
    contactId: v.optional(v.id("contacts")),
    leadId: v.optional(v.id("leads")),
    agentUserId: v.optional(v.id("users")),
    viewingDate: v.string(),
    viewingTime: v.optional(v.string()),
    propertyAddress: v.string(),
    status: v.optional(v.union(v.literal("draft"), v.literal("completed"))),
    ...signerFields,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);

    const clientName = args.clientName.trim();
    const propertyAddress = args.propertyAddress.trim();
    if (!clientName) throw new ConvexError("Client name is required");
    if (!propertyAddress) throw new ConvexError("Property address is required");

    // Default the negotiator to the current user.
    const agentUserId = args.agentUserId ?? user._id;
    await assertLinks(ctx, user.orgId, {
      propertyId: args.propertyId,
      contactId: args.contactId,
      leadId: args.leadId,
      agentUserId,
    });

    const status = args.status ?? "draft";
    const now = Date.now();
    const formId = await ctx.db.insert("viewingForms", {
      propertyId: args.propertyId,
      contactId: args.contactId,
      leadId: args.leadId,
      agentUserId,
      viewingDate: args.viewingDate,
      viewingTime: args.viewingTime,
      propertyAddress,
      clientName,
      clientCompany: args.clientCompany,
      clientIdNumber: args.clientIdNumber,
      clientSpouseName: args.clientSpouseName,
      clientPhone: args.clientPhone,
      clientEmail: args.clientEmail,
      clientSignatureId: args.clientSignatureId,
      negotiatorName: args.negotiatorName.trim() || (user.fullName ?? user.name ?? ""),
      negotiatorSignatureId: args.negotiatorSignatureId,
      sellerName: args.sellerName,
      sellerSignatureId: args.sellerSignatureId,
      status,
      completedAt: status === "completed" ? now : undefined,
      createdByUserId: user._id,
      orgId: user.orgId,
      createdAt: now,
      updatedAt: now,
    });

    await recordAudit(ctx, {
      actorUserId: user._id,
      actorLabel: user.fullName || user.name || user.email,
      action: "viewing_form.create",
      category: "other",
      description: `Created viewing form for "${clientName}" at ${propertyAddress}`,
      targetType: "viewingForm",
      targetId: formId,
      targetLabel: clientName,
      orgId: user.orgId,
    });

    return formId;
  },
});

export const update = mutation({
  args: {
    formId: v.id("viewingForms"),
    propertyId: v.optional(v.id("properties")),
    contactId: v.optional(v.id("contacts")),
    leadId: v.optional(v.id("leads")),
    agentUserId: v.optional(v.id("users")),
    viewingDate: v.optional(v.string()),
    viewingTime: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("completed"))),
    clientName: v.optional(v.string()),
    clientCompany: v.optional(v.string()),
    clientIdNumber: v.optional(v.string()),
    clientSpouseName: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientSignatureId: v.optional(v.id("_storage")),
    negotiatorName: v.optional(v.string()),
    negotiatorSignatureId: v.optional(v.id("_storage")),
    sellerName: v.optional(v.string()),
    sellerSignatureId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const form = await ctx.db.get(args.formId);
    if (!form) throw new ConvexError("Viewing form not found");
    assertOrgAccess(form, user.orgId);
    if (!canEditForm(form, user)) {
      throw new ConvexError("You are not authorised to edit this viewing form");
    }
    // A completed (signed) form is locked. Only a real admin may re-open it.
    if (form.status === "completed" && user.role !== "admin") {
      throw new ConvexError(
        "This viewing form is completed and locked. Ask an admin to re-open it."
      );
    }

    if (args.agentUserId || args.propertyId || args.contactId || args.leadId) {
      await assertLinks(ctx, user.orgId, {
        propertyId: args.propertyId ?? form.propertyId,
        contactId: args.contactId ?? form.contactId,
        leadId: args.leadId ?? form.leadId,
        agentUserId: args.agentUserId ?? form.agentUserId,
      });
    }

    // Free any signature file that is being replaced with a new one.
    for (const key of [
      "clientSignatureId",
      "negotiatorSignatureId",
      "sellerSignatureId",
    ] as const) {
      const next = args[key];
      const prev = form[key];
      if (next && prev && next !== prev) {
        await ctx.storage.delete(prev);
      }
    }

    const patch: Partial<Doc<"viewingForms">> = { updatedAt: Date.now() };
    const assign = <K extends keyof Doc<"viewingForms">>(k: K, val: Doc<"viewingForms">[K] | undefined) => {
      if (val !== undefined) patch[k] = val;
    };
    assign("propertyId", args.propertyId);
    assign("contactId", args.contactId);
    assign("leadId", args.leadId);
    assign("agentUserId", args.agentUserId);
    assign("viewingDate", args.viewingDate);
    assign("viewingTime", args.viewingTime);
    assign("propertyAddress", args.propertyAddress?.trim());
    assign("clientName", args.clientName?.trim());
    assign("clientCompany", args.clientCompany);
    assign("clientIdNumber", args.clientIdNumber);
    assign("clientSpouseName", args.clientSpouseName);
    assign("clientPhone", args.clientPhone);
    assign("clientEmail", args.clientEmail);
    assign("clientSignatureId", args.clientSignatureId);
    assign("negotiatorName", args.negotiatorName?.trim());
    assign("negotiatorSignatureId", args.negotiatorSignatureId);
    assign("sellerName", args.sellerName);
    assign("sellerSignatureId", args.sellerSignatureId);

    if (args.status) {
      patch.status = args.status;
      patch.completedAt =
        args.status === "completed" ? form.completedAt ?? Date.now() : undefined;
    }

    await ctx.db.patch(args.formId, patch);

    if (args.status === "completed" && form.status !== "completed") {
      await recordAudit(ctx, {
        actorUserId: user._id,
        actorLabel: user.fullName || user.name || user.email,
        action: "viewing_form.complete",
        category: "other",
        description: `Completed viewing form for "${form.clientName}"`,
        targetType: "viewingForm",
        targetId: args.formId,
        targetLabel: form.clientName,
        orgId: user.orgId,
      });
    }

    return args.formId;
  },
});

export const remove = mutation({
  args: { formId: v.id("viewingForms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const form = await ctx.db.get(args.formId);
    if (!form) throw new ConvexError("Viewing form not found");
    assertOrgAccess(form, user.orgId);
    if (!canEditForm(form, user)) {
      throw new ConvexError("You are not authorised to delete this viewing form");
    }

    // Clean up any stored signature files.
    for (const id of [
      form.clientSignatureId,
      form.negotiatorSignatureId,
      form.sellerSignatureId,
    ]) {
      if (id) await ctx.storage.delete(id);
    }
    await ctx.db.delete(args.formId);

    await recordAudit(ctx, {
      actorUserId: user._id,
      actorLabel: user.fullName || user.name || user.email,
      action: "viewing_form.delete",
      category: "other",
      description: `Deleted viewing form for "${form.clientName}"`,
      targetType: "viewingForm",
      targetId: args.formId,
      targetLabel: form.clientName,
      orgId: user.orgId,
    });
  },
});

/** A single form enriched with signature URLs and the agent's display name. */
async function enrichForm(ctx: QueryCtx | MutationCtx, form: Doc<"viewingForms">) {
  const [urls, agent] = await Promise.all([
    resolveSignatureUrls(ctx, form),
    ctx.db.get(form.agentUserId),
  ]);
  return {
    ...form,
    ...urls,
    agentName: agent ? agent.fullName || agent.name || agent.email || "Unknown" : "Unknown",
  };
}

export const getById = query({
  args: { formId: v.id("viewingForms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const form = await ctx.db.get(args.formId);
    if (!form) return null;
    if (form.orgId && form.orgId !== user.orgId) return null;
    if (!canSeeForm(form, user)) return null;

    const [enriched, property, contact, lead] = await Promise.all([
      enrichForm(ctx, form),
      form.propertyId ? ctx.db.get(form.propertyId) : null,
      form.contactId ? ctx.db.get(form.contactId) : null,
      form.leadId ? ctx.db.get(form.leadId) : null,
    ]);
    return {
      ...enriched,
      propertyTitle: property?.title ?? null,
      contactName: contact?.name ?? null,
      leadName: lead?.fullName ?? null,
      canEdit: canEditForm(form, user),
    };
  },
});

/** Shared list helper: enrich + apply visibility filter. */
async function listVisible(
  ctx: QueryCtx,
  user: Doc<"users">,
  forms: Doc<"viewingForms">[]
) {
  const visible = forms.filter(
    (f) => (!f.orgId || f.orgId === user.orgId) && canSeeForm(f, user)
  );
  visible.sort((a, b) => b.createdAt - a.createdAt);
  return Promise.all(visible.map((f) => enrichForm(ctx, f)));
}

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const forms = await ctx.db
      .query("viewingForms")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .collect();
    return listVisible(ctx, user, forms);
  },
});

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const forms = await ctx.db
      .query("viewingForms")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    return listVisible(ctx, user, forms);
  },
});

export const listByContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    const forms = await ctx.db
      .query("viewingForms")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
    return listVisible(ctx, user, forms);
  },
});

/** Org-wide audit list with optional filters. Respects the visibility rule. */
export const listForOrg = query({
  args: {
    agentUserId: v.optional(v.id("users")),
    status: v.optional(v.union(v.literal("draft"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    let forms = await ctx.db
      .query("viewingForms")
      .withIndex("by_org", (q) => q.eq("orgId", user.orgId))
      .collect();

    if (args.agentUserId) {
      forms = forms.filter((f) => f.agentUserId === args.agentUserId);
    }
    if (args.status) {
      forms = forms.filter((f) => f.status === args.status);
    }
    return listVisible(ctx, user, forms);
  },
});
