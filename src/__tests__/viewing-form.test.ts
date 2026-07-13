import { describe, it, expect } from "vitest";
import {
  isEffectiveAdmin,
  canSeeViewingForm,
  canEditViewingForm,
  isViewingFormLocked,
  validateViewingForm,
  ownsPropertyForAgentMode,
  type ScopeUser,
  type ViewingFormLike,
} from "../../convex/viewingFormLib";

const admin: ScopeUser = { _id: "admin1", role: "admin" };
const adminInAgentMode: ScopeUser = { _id: "admin1", role: "admin", agentMode: true };
const agentCreator: ScopeUser = { _id: "agentA", role: "agent" };
const agentNegotiator: ScopeUser = { _id: "agentB", role: "agent" };
const otherAgent: ScopeUser = { _id: "agentX", role: "agent" };

const form: ViewingFormLike = {
  createdByUserId: "agentA",
  agentUserId: "agentB",
  status: "draft",
};

describe("isEffectiveAdmin", () => {
  it("true for a real admin not in agent mode", () => {
    expect(isEffectiveAdmin(admin)).toBe(true);
  });
  it("false for an admin in agent mode", () => {
    expect(isEffectiveAdmin(adminInAgentMode)).toBe(false);
  });
  it("false for a normal agent regardless of agentMode flag", () => {
    expect(isEffectiveAdmin(agentCreator)).toBe(false);
    expect(isEffectiveAdmin({ role: "agent", agentMode: false })).toBe(false);
  });
});

describe("canSeeViewingForm", () => {
  it("admins see every form", () => {
    expect(canSeeViewingForm(form, admin)).toBe(true);
  });
  it("an admin in agent mode only sees their own", () => {
    expect(canSeeViewingForm(form, adminInAgentMode)).toBe(false);
    expect(
      canSeeViewingForm({ ...form, agentUserId: "admin1" }, adminInAgentMode)
    ).toBe(true);
  });
  it("the creator and the assigned negotiator can see it", () => {
    expect(canSeeViewingForm(form, agentCreator)).toBe(true);
    expect(canSeeViewingForm(form, agentNegotiator)).toBe(true);
  });
  it("an unrelated agent cannot", () => {
    expect(canSeeViewingForm(form, otherAgent)).toBe(false);
  });
});

describe("canEditViewingForm", () => {
  it("the creator may edit", () => {
    expect(canEditViewingForm(form, agentCreator)).toBe(true);
  });
  it("the negotiator (not creator) may not edit", () => {
    expect(canEditViewingForm(form, agentNegotiator)).toBe(false);
  });
  it("a real admin may always edit", () => {
    expect(canEditViewingForm(form, admin)).toBe(true);
  });
});

describe("isViewingFormLocked", () => {
  it("draft forms are never locked", () => {
    expect(isViewingFormLocked({ status: "draft" }, agentCreator)).toBe(false);
  });
  it("completed forms are locked for agents", () => {
    expect(isViewingFormLocked({ status: "completed" }, agentCreator)).toBe(true);
  });
  it("completed forms can still be reopened by a real admin", () => {
    expect(isViewingFormLocked({ status: "completed" }, admin)).toBe(false);
  });
});

describe("validateViewingForm", () => {
  it("requires a client name", () => {
    expect(
      validateViewingForm(
        { clientName: "  ", propertyAddress: "12 Main St", hasClientSignature: false },
        { requireSignature: false }
      )
    ).toBe("Client name is required");
  });
  it("requires a property address", () => {
    expect(
      validateViewingForm(
        { clientName: "Jane", propertyAddress: "", hasClientSignature: false },
        { requireSignature: false }
      )
    ).toBe("Property address is required");
  });
  it("does not require a signature when saving a draft", () => {
    expect(
      validateViewingForm(
        { clientName: "Jane", propertyAddress: "12 Main St", hasClientSignature: false },
        { requireSignature: false }
      )
    ).toBeNull();
  });
  it("requires the client signature when completing", () => {
    expect(
      validateViewingForm(
        { clientName: "Jane", propertyAddress: "12 Main St", hasClientSignature: false },
        { requireSignature: true }
      )
    ).toBe("The client must sign before completing the form");
    expect(
      validateViewingForm(
        { clientName: "Jane", propertyAddress: "12 Main St", hasClientSignature: true },
        { requireSignature: true }
      )
    ).toBeNull();
  });
});

describe("ownsPropertyForAgentMode", () => {
  it("true when the user is an owner", () => {
    expect(
      ownsPropertyForAgentMode({ ownerUserIds: ["agentA", "agentB"] }, "agentA")
    ).toBe(true);
  });
  it("true when the user created it", () => {
    expect(
      ownsPropertyForAgentMode({ ownerUserIds: [], createdByUserId: "agentA" }, "agentA")
    ).toBe(true);
  });
  it("false otherwise (company / other-owned listings)", () => {
    expect(ownsPropertyForAgentMode({ ownerUserIds: ["agentB"] }, "agentA")).toBe(false);
    expect(ownsPropertyForAgentMode({}, "agentA")).toBe(false);
  });
});
