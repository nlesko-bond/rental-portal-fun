import { formatPickedSlotTimeRange } from "@/components/booking/booking-slot-labels";
import type { PickedSlot } from "@/lib/slot-selection";

function timeToSec(t: string): number {
  const m = t.trim().split(".")[0]!.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

function sortKey(a: PickedSlot): string {
  return `${a.startDate}\0${a.resourceId}\0${a.startTime}`;
}

/**
 * Groups consecutive slots on the same resource/date (back-to-back) for a single confirm line
 * (e.g. 8:00–10:00 across four 30-min slots).
 */
export function groupContiguousPickedSlotsForConfirm(slots: PickedSlot[]): PickedSlot[][] {
  if (slots.length === 0) return [];
  const sorted = [...slots].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const groups: PickedSlot[][] = [];
  let cur: PickedSlot[] = [sorted[0]!];
  for (let i = 1; i < sorted.length; i++) {
    const prev = cur[cur.length - 1]!;
    const s = sorted[i]!;
    const contiguous =
      prev.resourceId === s.resourceId &&
      prev.startDate === s.startDate &&
      timeToSec(prev.endTime) === timeToSec(s.startTime);
    if (contiguous) {
      cur.push(s);
    } else {
      groups.push(cur);
      cur = [s];
    }
  }
  groups.push(cur);
  return groups;
}

export function spanLabelForSlotGroup(group: PickedSlot[]): string {
  if (group.length === 0) return "";
  const first = group[0]!;
  const last = group[group.length - 1]!;
  return formatPickedSlotTimeRange({ startTime: first.startTime, endTime: last.endTime });
}
