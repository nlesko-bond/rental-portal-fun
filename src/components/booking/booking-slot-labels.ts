import type { PickedSlot } from "@/lib/slot-selection";

/** e.g. "7:00 PM – 8:00 PM" for consumer-facing slot rows */
export function formatPickedSlotTimeRange(slot: Pick<PickedSlot, "startTime" | "endTime">): string {
  const fmt = (t: string) => {
    const h = Number(t.slice(0, 2));
    const m = Number(t.slice(3, 5));
    if (!Number.isFinite(h) || !Number.isFinite(m)) return t.slice(0, 5);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };
  return `${fmt(slot.startTime)} – ${fmt(slot.endTime)}`;
}
