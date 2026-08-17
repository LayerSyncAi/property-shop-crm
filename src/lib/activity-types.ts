// Single source of truth for activity (task) `type` values and their labels.
// Keep in sync with the `activities.type` union in convex/lib/activityTypes.ts.

export type ActivityType =
  | "call"
  | "whatsapp"
  | "email"
  | "meeting"
  | "viewing"
  | "follow_up"
  | "paperwork"
  | "note";

export const ACTIVITY_TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "viewing", label: "Viewing" },
  { value: "follow_up", label: "Follow-up" },
  { value: "paperwork", label: "Paperwork" },
  { value: "note", label: "Note" },
];

const ACTIVITY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export function activityTypeLabel(type: string): string {
  return (
    ACTIVITY_TYPE_LABELS[type] ??
    type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}
