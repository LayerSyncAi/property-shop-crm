/**
 * Pure, dependency-free helpers for viewing-form access/validation and the
 * admin/agent effective-role rule. Kept free of any Convex server imports so it
 * can be unit-tested directly (see src/__tests__/viewing-form.test.ts).
 */

export type ScopeUser = {
  _id: string;
  role: "admin" | "agent";
  agentMode?: boolean;
};

/**
 * Effective-admin for DATA VISIBILITY: a real admin who has toggled into Agent
 * Mode is treated as a normal agent. Never affects hard permission gates.
 */
export function isEffectiveAdmin(user: {
  role: "admin" | "agent";
  agentMode?: boolean;
}): boolean {
  return user.role === "admin" && !user.agentMode;
}

export type ViewingFormLike = {
  createdByUserId: string;
  agentUserId: string;
  status: "draft" | "completed";
};

/** Visibility: effective-admins see all; agents see forms they created or run. */
export function canSeeViewingForm(form: ViewingFormLike, user: ScopeUser): boolean {
  if (isEffectiveAdmin(user)) return true;
  return form.createdByUserId === user._id || form.agentUserId === user._id;
}

/** Edit/delete: the real admin or the creator. */
export function canEditViewingForm(
  form: { createdByUserId: string },
  user: { _id: string; role: "admin" | "agent" }
): boolean {
  return user.role === "admin" || form.createdByUserId === user._id;
}

/** A completed form is locked against edits for everyone except a real admin. */
export function isViewingFormLocked(
  form: { status: "draft" | "completed" },
  user: { role: "admin" | "agent" }
): boolean {
  return form.status === "completed" && user.role !== "admin";
}

/**
 * Validate a viewing form's required fields. When `requireSignature` is true
 * (completing/locking the form) the client signature is also mandatory.
 * Returns an error message, or null when valid.
 */
export function validateViewingForm(
  input: {
    clientName?: string;
    propertyAddress?: string;
    hasClientSignature: boolean;
  },
  opts: { requireSignature: boolean }
): string | null {
  if (!input.clientName?.trim()) return "Client name is required";
  if (!input.propertyAddress?.trim()) return "Property address is required";
  if (opts.requireSignature && !input.hasClientSignature) {
    return "The client must sign before completing the form";
  }
  return null;
}

/**
 * Whether a property should be visible to an admin who is in Agent Mode: only
 * the properties they own or created. Normal agents are handled by the caller
 * (properties stay org-shared for them).
 */
export function ownsPropertyForAgentMode(
  property: { ownerUserIds?: string[]; createdByUserId?: string },
  userId: string
): boolean {
  return (
    (property.ownerUserIds ?? []).includes(userId) ||
    property.createdByUserId === userId
  );
}
