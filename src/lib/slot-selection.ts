import type { ScheduleTimeSlotDto } from "@/types/online-booking";

export type PickedSlot = {
  key: string;
  resourceId: number;
  resourceName: string;
  startDate: string;
  /** Same as startDate for single-day bookings; from schedule slot DTO */
  endDate: string;
  startTime: string;
  endTime: string;
  /** Display / UI unit price (may include entitlement discounts — can be $0 for members). */
  price: number;
  /**
   * Schedule line unit price from the booking API **before** client-side entitlement adjustment.
   * Bond `POST …/online-booking/create` must receive this; sending $0 from member discounts triggers errors.
   */
  scheduleUnitPrice?: number;
  /** Bond `POST .../online-booking/create` segment `spaceId` — prefer `spacesIds[0]` from schedule */
  spaceId: number;
  timezone: string;
};

/**
 * Unit price Bond expects on each slot in `POST …/online-booking/create`.
 * Prefer positive {@link PickedSlot.scheduleUnitPrice} / {@link PickedSlot.price}.
 * When GET schedule returns **0** for a member-eligible user, Bond still expects the **cash** unit here —
 * pass {@link fallbackCatalogUnitPrice} (e.g. catalog minimum) so we never send `price: 0` unless Bond truly allows free booking.
 */
export function slotPriceForBondApi(s: PickedSlot, fallbackCatalogUnitPrice?: number | null): number {
  const fb =
    typeof fallbackCatalogUnitPrice === "number" &&
    Number.isFinite(fallbackCatalogUnitPrice) &&
    fallbackCatalogUnitPrice > 0
      ? fallbackCatalogUnitPrice
      : null;

  if (typeof s.scheduleUnitPrice === "number" && Number.isFinite(s.scheduleUnitPrice) && s.scheduleUnitPrice > 0) {
    return s.scheduleUnitPrice;
  }
  if (typeof s.price === "number" && Number.isFinite(s.price) && s.price > 0) {
    return s.price;
  }
  if (fb != null) return fb;
  if (typeof s.scheduleUnitPrice === "number" && Number.isFinite(s.scheduleUnitPrice)) {
    return s.scheduleUnitPrice;
  }
  if (typeof s.price === "number" && Number.isFinite(s.price)) {
    return s.price;
  }
  return 0;
}

export function slotControlKey(resourceId: number, s: ScheduleTimeSlotDto): string {
  return `${resourceId}-${s.startDate}-${s.startTime}-${s.endTime}`;
}

/**
 * Inverse of {@link slotControlKey} when the schedule used ISO `YYYY-MM-DD` dates and `HH:MM:SS` times.
 * Returns null if the key shape does not match (e.g. legacy or server-generated ids).
 */
export function parseSlotControlKey(key: string): {
  resourceId: number;
  startDate: string;
  startTime: string;
  endTime: string;
} | null {
  const m = key.match(/^(\d+)-(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})-(\d{2}:\d{2}:\d{2})$/);
  if (!m) return null;
  return {
    resourceId: Number(m[1]),
    startDate: m[2]!,
    startTime: m[3]!,
    endTime: m[4]!,
  };
}

function timeToMinutes(t: string): number {
  const m = t.slice(0, 8).match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Unix seconds at `YYYY-MM-DD`00:00:00 UTC for that calendar day (Bond schedule dates are plain dates). */
function utcMidnightSeconds(isoDate: string): number | null {
  const [y, mo, d] = isoDate.split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  return Math.floor(Date.UTC(y, mo - 1, d) / 1000);
}

function wallClockToUnixSeconds(isoDate: string, time: string): number | null {
  const base = utcMidnightSeconds(isoDate);
  if (base == null) return null;
  const m = time.trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] != null ? Number(m[3]) : 0;
  if (![h, min, sec].every((n) => Number.isFinite(n))) return null;
  return base + h * 3600 + min * 60 + sec;
}

/**
 * Length of the slot in minutes using **startDate/startTime → endDate/endTime**.
 * Same-calendar-day slots behave like the old time-only diff; midnight-crossing rows (e.g. 23:00 → next day 00:00) are correct.
 */
export function slotDurationMinutes(
  s: Pick<ScheduleTimeSlotDto, "startDate" | "endDate" | "startTime" | "endTime">
): number {
  const a = wallClockToUnixSeconds(s.startDate, s.startTime);
  const b = wallClockToUnixSeconds(s.endDate, s.endTime);
  if (a == null || b == null) return 0;
  return Math.max(0, (b - a) / 60);
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

export type SlotSelectionValidateOpts = {
  /** Existing bookings for the participant (e.g. from booking-information API). */
  existing?: Array<Pick<PickedSlot, "resourceId" | "startDate" | "endDate" | "startTime" | "endTime">>;
  /** Shown in i18n messages (first name or “You”). */
  customerLabel?: string;
  t?: (key: string, values?: Record<string, string | number>) => string;
};

export function validateSlotSelection(
  selected: PickedSlot[],
  rules: { maxSequentialHours: number | null; maxBookingHoursPerDay: number | null },
  opts?: SlotSelectionValidateOpts
): { ok: boolean; message?: string } {
  const maxSeqH = rules.maxSequentialHours;
  const maxH = rules.maxBookingHoursPerDay;
  const existing = opts?.existing?.length ? opts.existing : [];
  const combined: PickedSlot[] =
    existing.length > 0
      ? [
          ...existing.map(
            (e) =>
              ({
                ...e,
                key: `existing-${e.resourceId}-${e.startDate}-${e.startTime}`,
                resourceName: "",
                price: 0,
                spaceId: e.resourceId,
                timezone: "UTC",
              }) as PickedSlot
          ),
          ...selected,
        ]
      : selected;

  if (maxSeqH == null && maxH == null) return { ok: true };

  const who = opts?.customerLabel?.trim() || "You";

  if (maxH != null && Number.isFinite(maxH) && maxH > 0) {
    const byDay = new Map<string, number>();
    for (const s of combined) {
      const mins = slotDurationMinutes(s);
      byDay.set(s.startDate, (byDay.get(s.startDate) ?? 0) + mins);
    }
    for (const [, mins] of byDay) {
      if (mins / 60 > maxH + 1e-6) {
        if (opts?.t) {
          return {
            ok: false,
            message: opts.t("slotValidationMaxPerDay", { maxHours: maxH, who }),
          };
        }
        return {
          ok: false,
          message: `You can book a maximum of ${maxH} hour${maxH === 1 ? "" : "s"} in a day.`,
        };
      }
    }
  }

  if (maxSeqH != null && Number.isFinite(maxSeqH) && maxSeqH > 0) {
    const capMins = maxSeqH * 60;
    const chainMins = maxContiguousChainMinutes(combined);
    if (chainMins > capMins + 1e-6) {
      if (opts?.t) {
        return {
          ok: false,
          message: opts.t("slotValidationMaxSequential", {
            maxHours: maxSeqH,
            who,
          }),
        };
      }
      return {
        ok: false,
        message: `You can book a maximum of ${maxSeqH} hour${maxSeqH === 1 ? "" : "s"} sequentially.`,
      };
    }
  }

  return { ok: true };
}
