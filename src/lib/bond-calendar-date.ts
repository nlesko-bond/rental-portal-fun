const ISO_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})/;

/**
 * Civil calendar day Bond uses on schedule settings, slots, and the `date` query
 * (`YYYY-MM-DD`). Strips ISO datetimes Bond sometimes emits on `Date` OpenAPI fields.
 */
export function bondCalendarDateKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const m = raw.trim().match(ISO_DATE_PREFIX);
  return m?.[1] ?? null;
}

/**
 * Today's civil date in `timeZone` (IANA), or the runtime local zone when omitted.
 * Do not use `Date#toISOString` — that is UTC and shifts the calendar day after local evening.
 */
export function calendarDateKeyNow(timeZone?: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  if (timeZone != null && timeZone.length > 0) {
    opts.timeZone = timeZone;
  }
  return new Intl.DateTimeFormat("en-CA", opts).format(new Date());
}

/** Short weekday + date for slot tiles when Bond's `startDate` is not the selected day. */
export function formatBondSlotDayLabel(dateKey: string): string {
  const key = bondCalendarDateKey(dateKey) ?? dateKey;
  const d = new Date(`${key}T12:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
