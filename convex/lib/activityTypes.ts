import { v } from "convex/values";

/**
 * The canonical list of activity (task) `type` values, defined once and reused
 * by the schema and every mutation that accepts a type.
 *
 * Mirrored for the frontend in src/lib/activity-types.ts, which owns the
 * display labels and icons.
 *
 * "follow_up" and "paperwork" were added so task reports can break work down
 * the way agencies actually talk about it (calls, viewings, follow-ups,
 * paperwork) rather than lumping both under "note".
 */
export const activityTypeValidator = v.union(
  v.literal("call"),
  v.literal("whatsapp"),
  v.literal("email"),
  v.literal("meeting"),
  v.literal("viewing"),
  v.literal("follow_up"),
  v.literal("paperwork"),
  v.literal("note")
);

export type ActivityTypeValue = typeof activityTypeValidator.type;
