import type { ScheduleTimeSlotDto } from "@/types/online-booking";

export type PickedSlot = {
  key: string;
  resourceId: number;
  resourceName: string;
  startDate: string;
  startTime: string;
  endTime: string;
  price: number;
};

export function slotControlKey(resourceId: number, s: ScheduleTimeSlotDto): string {
  return `${resourceId}-${s.startDate}-${s.startTime}-${s.endTime}`;
}

function timeToMinutes(t: string): number {
  const m = t.slice(0, 8).match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function slotDurationMinutes(s: Pick<ScheduleTimeSlotDto, "startTime" | "endTime">): number {
  const a = timeToMinutes(s.startTime);
  const b = timeToMinutes(s.endTime);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, b - a);
}

/** Longest contiguous block length in minutes (same resource, same calendar day, back-to-back slots). */
function maxContiguousChainMinutes(slots: PickedSlot[]): number {
  if (slots.length === 0) return 0;
  const byGroup = new Map<string, PickedSlot[]>();
  for (const s of slots) {
    const g = `${s.resourceId}\0${s.startDate}`;
    const arr = byGroup.get(g) ?? [];
    arr.push(s);
    byGroup.set(g, arr);
  }
  let globalMax = 0;
  for (const group of byGroup.values()) {
    const sorted = [...group].sort((x, y) => timeToMinutes(x.startTime) - timeToMinutes(y.startTime));
    let runMins = slotDurationMinutes(sorted[0]!);
    let best = runMins;
    for (let i = 1; i < sorted.length; i++) {
      if (timeToMinutes(sorted[i].startTime) === timeToMinutes(sorted[i - 1].endTime)) {
        runMins += slotDurationMinutes(sorted[i]);
        best = Math.max(best, runMins);
      } else {
        runMins = slotDurationMinutes(sorted[i]);
      }
    }
    globalMax = Math.max(globalMax, best);
  }
  return globalMax;
}

export function validateSlotSelection(
  selected: PickedSlot[],
  rules: { maxSequentialHours: number | null; maxBookingHoursPerDay: number | null }
): { ok: boolean; message?: string } {
  const maxSeqH = rules.maxSequentialHours;
  const maxH = rules.maxBookingHoursPerDay;

  if (maxSeqH == null && maxH == null) return { ok: true };

  if (maxH != null && Number.isFinite(maxH) && maxH > 0) {
    const byDay = new Map<string, number>();
    for (const s of selected) {
      const mins = slotDurationMinutes(s);
      byDay.set(s.startDate, (byDay.get(s.startDate) ?? 0) + mins);
    }
    for (const [, mins] of byDay) {
      if (mins / 60 > maxH + 1e-6) {
        return {
          ok: false,
          message: `You can book a maximum of ${maxH} hour${maxH === 1 ? "" : "s"} in a day.`,
        };
      }
    }
  }

  if (maxSeqH != null && Number.isFinite(maxSeqH) && maxSeqH > 0) {
    const capMins = maxSeqH * 60;
    const chainMins = maxContiguousChainMinutes(selected);
    if (chainMins > capMins + 1e-6) {
      return {
        ok: false,
        message: `You can book a maximum of ${maxSeqH} hour${maxSeqH === 1 ? "" : "s"} sequentially.`,
      };
    }
  }

  return { ok: true };
}
