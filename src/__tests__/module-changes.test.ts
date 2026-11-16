import { describe, it, expect } from "vitest";
import { moduleChangeNotes, moduleOffMessage } from "../../convex/lib/moduleChanges";

describe("moduleChangeNotes", () => {
  it("says nothing when no module with side effects changes", () => {
    expect(moduleChangeNotes(["crm", "stay"], ["crm", "stay"])).toEqual([]);
    expect(moduleChangeNotes(["crm", "media"], ["crm"])).toEqual([]);
    expect(moduleChangeNotes(["crm"], ["crm", "worth"])).toEqual([]);
  });

  it("warns that rent and the portals stop with SyncStay", () => {
    const notes = moduleChangeNotes(["crm", "stay"], ["crm"]);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain("rent is not charged");
    expect(notes[0]).toContain("portals close");
  });

  it("warns that receipts stop reaching the trust ledger with SyncFinance off", () => {
    const notes = moduleChangeNotes(["stay", "finance", "dev"], ["stay", "dev"]);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain("trust ledger");
  });

  it("warns about instalments only once Finance and Dev are both off", () => {
    const instalments = (n: string[]) => n.some((s) => s.includes("instalment reminders"));
    expect(instalments(moduleChangeNotes(["finance", "dev"], ["finance"]))).toBe(false);
    expect(instalments(moduleChangeNotes(["finance", "dev"], ["dev"]))).toBe(false);
    expect(instalments(moduleChangeNotes(["finance", "dev"], ["crm"]))).toBe(true);
    expect(instalments(moduleChangeNotes(["dev"], ["crm"]))).toBe(true);
  });

  it("explains what switching SyncFinance on changes", () => {
    const notes = moduleChangeNotes(["stay"], ["stay", "finance"]);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain("Import and migrate");
  });
});

describe("moduleOffMessage", () => {
  it("points an admin at Agency settings and anyone else at their admin", () => {
    expect(moduleOffMessage("SyncDev", true)).toContain("Agency settings");
    expect(moduleOffMessage("SyncDev", false)).toContain("Ask your admin");
  });
});
