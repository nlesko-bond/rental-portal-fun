import type { PickedSlot } from "@/lib/slot-selection";

/**
 * Minimal slot shape for merging with the current selection when enforcing category
 * max-hours / max-sequential rules against **existing** bookings from
 * `GET .../online-booking/user/{userId}/booking-information`.
 */
export type BookedSlice = Pick<PickedSlot, "resourceId" | "startDate" | "endDate" | "startTime" | "endTime">;

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim().length > 0) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

/** Pull YYYY-MM-DD and HH:MM:SS from common Bond / ISO shapes. */
function normalizeBookedRecord(r: Record<string, unknown>, syntheticResource: number): BookedSlice | null {
  let startDate =
    str(r.startDate) ??
    str(r.date) ??
    str(r.bookingDate) ??
    (typeof r.start === "string" ? r.start.slice(0, 10) : null);
  let endDate = str(r.endDate) ?? startDate;
  let startTime =
    str(r.startTime) ??
    (typeof r.start === "string" && r.start.length >= 19 ? r.start.slice(11, 19) : null);
  let endTime =
    str(r.endTime) ??
    (typeof r.end === "string" && r.end.length >= 19 ? r.end.slice(11, 19) : null);

  if (startDate == null && typeof r.start === "string") {
    const m = r.start.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/);
    if (m) {
      startDate = m[1]!;
      startTime = startTime ?? m[2]!;
    }
  }
  if (endDate == null && typeof r.end === "string") {
    const m = r.end.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/);
    if (m) {
      endDate = m[1]!;
      endTime = endTime ?? m[2]!;
    }
  }

  if (startTime == null) startTime = "00:00:00";
  if (endTime == null) endTime = startTime;
  if (startDate == null || endDate == null) return null;

  const resourceId =
    num(r.resourceId) ??
    num(r.resourceID) ??
    num(r.facilityResourceId) ??
    num(r.facilityResourceID) ??
    num(r.spaceId) ??
    syntheticResource;

  return {
    resourceId,
    startDate,
    endDate,
    startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
    endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
  };
}

function slicesFromArray(arr: unknown[], keyOffset: number): BookedSlice[] {
  const out: BookedSlice[] = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const nested =
      o.slot && typeof o.slot === "object"
        ? { ...(o.slot as Record<string, unknown>), ...o }
        : o.reservation && typeof o.reservation === "object"
          ? { ...(o.reservation as Record<string, unknown>), ...o }
          : o;
    const slice = normalizeBookedRecord(nested, -1000 - keyOffset - i);
    if (slice) out.push(slice);
  }
  return out;
}

/**
 * Best-effort extraction — Bond payload shapes vary; unknown fields are ignored.
 */
export function bookedSlicesFromUserBookingInformation(raw: unknown): BookedSlice[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const buckets: unknown[] = [];
  for (const k of ["slots", "bookedSlots", "bookings", "reservations", "data", "items"]) {
    const v = o[k];
    if (Array.isArray(v)) buckets.push(...v);
  }
  if (buckets.length === 0) return [];
  const parsed = slicesFromArray(buckets, 0);
  const seen = new Set<string>();
  return parsed.filter((s) => {
    const key = `${s.resourceId}|${s.startDate}|${s.startTime}|${s.endDate}|${s.endTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
