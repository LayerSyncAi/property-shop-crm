/**
 * What switching a module on or off does to an agency, in words an admin can
 * act on. Kept dependency-free so the website and the phone app show the same
 * warnings and the rules can be unit-tested.
 */
import type { ModuleKey } from "./modules";

/** Warnings for changing the agency's modules from `before` to `after`. */
export function moduleChangeNotes(before: readonly ModuleKey[], after: readonly ModuleKey[]): string[] {
  const on = (k: ModuleKey) => !before.includes(k) && after.includes(k);
  const off = (k: ModuleKey) => before.includes(k) && !after.includes(k);
  const notes: string[] = [];
  if (off("stay")) {
    notes.push(
      "With SyncStay off, rent is not charged, reminders stop, and the tenant and landlord portals close. Any month missed while it is off is not charged later."
    );
  }
  if (off("finance")) {
    notes.push(
      "With SyncFinance off, SyncStay receipts stop posting to the trust ledger. It stays behind until you switch Finance back on and bring those receipts in."
    );
  }
  if ((off("finance") || off("dev")) && !after.includes("finance") && !after.includes("dev")) {
    notes.push("With SyncFinance and SyncDev both off, instalment reminders stop and lapsed stand reservations stay held.");
  }
  if (on("finance")) {
    notes.push(
      "With SyncFinance on, new SyncStay payments post to the trust ledger and landlord statements come from Finance. Bring in earlier receipts and opening balances from Finance, Import and migrate."
    );
  }
  return notes;
}

/** Why a switched-off module will not open, for the screen shown in its place. */
export function moduleOffMessage(name: string, isAdmin: boolean): string {
  return isAdmin
    ? `${name} is switched off for your agency. You can switch it on in Agency settings.`
    : `${name} is switched off for your agency. Ask your admin to switch it on.`;
}
