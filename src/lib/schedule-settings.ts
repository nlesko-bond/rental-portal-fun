import type { DateAndTimesDto } from "@/types/online-booking";

/**
 * `GET .../online-booking/schedule/settings` returns `dates[]` where each row is:
 * `{ date: "YYYY-MM-DD", times?: ["HH:mm:ss", ...] }`.
 * The first bookable day often has a **partial** `times` list (minimum notice trims earlier starts);
 * later days may list every slot increment (e.g. :00 and :30 across midnight).
 */
export function getTimesForScheduleDate(rows: DateAndTimesDto[], dateKey: string): string[] {
  const row = rows.find((r) => r.date === dateKey);
  if (!row?.times?.length) return [];
  return row.times.filter((t): t is string => typeof t === "string" && /^\d{2}:\d{2}:\d{2}$/.test(t));
}

const HH_MM_SS = /^(\d{2}):(\d{2}):(\d{2})$/;

/** Display label for preferred-start `<select>`; value sent to Bond stays `HH:mm:ss`. */
export function formatPreferredStartOptionLabel(hhmmss: string): string {
  const m = hhmmss.match(HH_MM_SS);
  if (!m) return hhmmss.slice(0, 5);
  let h = Number(m[1]);
  const min = m[2];
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ap}`;
}
