/**
 * Client-side alignment of preferred start times with minimum booking notice.
 * Bond still enforces server-side; this reduces bad requests and matches UX expectations.
 */

function parseHhMmSsToMsFromDate(dateKey: string, hhmmss: string): number {
  const m = hhmmss.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return Number.NaN;
  const d = new Date(`${dateKey}T${m[1]}:${m[2]}:${m[3]}`);
  return d.getTime();
}

function todayDateKeyLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/**
 * Keeps only start times whose local start instant is at least `noticeMinutes` after now
 * when `dateKey` is today; otherwise returns all `times` unchanged.
 */
export function filterStartTimesByMinimumNotice(
  times: string[],
  dateKey: string,
  noticeMinutes: number | null
): string[] {
  if (times.length === 0) return [];
  if (noticeMinutes == null || !Number.isFinite(noticeMinutes) || noticeMinutes <= 0) {
    return [...times];
  }
  if (dateKey !== todayDateKeyLocal()) {
    return [...times];
  }
  const deadline = Date.now() + noticeMinutes * 60_000;
  return times.filter((t) => {
    const ms = parseHhMmSsToMsFromDate(dateKey, t);
    return Number.isFinite(ms) && ms >= deadline;
  });
}

/**
 * Picks the earliest eligible option that is still >= `chosen` (lexicographic HH:mm:ss works),
 * else the last eligible option before `chosen`, else first eligible.
 */
export function snapPreferredStartToEligible(
  chosen: string,
  eligibleSorted: string[]
): string | null {
  if (eligibleSorted.length === 0) return null;
  const atOrAfter = eligibleSorted.find((t) => t >= chosen);
  if (atOrAfter) return atOrAfter;
  const before = [...eligibleSorted].filter((t) => t < chosen);
  return before.length > 0 ? before[before.length - 1]! : eligibleSorted[0]!;
}
