/**
 * iCalendar (.ics) generator — the companion to `convex/lib/calendar.ts`.
 *
 * Kept out of the `convex/` tree because it depends on `ical-generator`, which
 * the Convex bundler cannot bundle. It only ever runs server-side in the
 * Next.js .ics download endpoint; the shared event model is imported from the
 * Convex-side module so both halves stay in sync.
 */
import ical, { ICalCalendarMethod } from "ical-generator";
import { type CalendarEvent, resolveRange } from "../../convex/lib/calendar";

/**
 * Build a valid iCalendar (.ics) document for the event.
 * Returns the serialized .ics string.
 */
export function generateIcsContent(event: CalendarEvent): string {
  const { start, end } = resolveRange(event);

  const calendar = ical({ method: ICalCalendarMethod.PUBLISH });
  calendar.createEvent({
    start,
    end,
    summary: event.title,
    description: event.description,
    location: event.location,
    url: event.url,
  });

  return calendar.toString();
}
