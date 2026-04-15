import { parseSlotControlKey, type PickedSlot } from "@/lib/slot-selection";

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

/** One line under a cart row: weekday + date · start–end time (from a {@link slotControlKey} string). */
export function formatSlotControlKeyLabel(key: string): string | null {
  const p = parseSlotControlKey(key);
  if (!p) return null;
  const d = new Date(`${p.startDate}T12:00:00`);
  const dayPart = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timePart = formatPickedSlotTimeRange(p);
  return `${dayPart} · ${timePart}`;
}

/** Long date only, e.g. `Dec 25, 2028` — for Figma-style cart meta rows. */
export function formatSlotKeyLongDate(key: string): string | null {
  const p = parseSlotControlKey(key);
  if (!p) return null;
  const d = new Date(`${p.startDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Time range only, e.g. `8:00 AM – 9:00 AM`. */
export function formatSlotKeyTimeRangePretty(key: string): string | null {
  const p = parseSlotControlKey(key);
  if (!p) return null;
  return formatPickedSlotTimeRange({
    startTime: p.startTime.slice(0, 8),
    endTime: p.endTime.slice(0, 8),
  });
}

/** Join multiple slot keys (e.g. one reservation’s segments) for cart / receipt meta. */
export function formatSlotKeysScheduleSummary(keys: readonly string[]): string {
  const parts = keys.map((k) => formatSlotControlKeyLabel(k)).filter((x): x is string => x != null);
  return parts.length > 0 ? parts.join(" · ") : "";
}
