import type { CategorySettings } from "@/types/online-booking";
import { bookingDurationsLegacyArray } from "./category-settings";

function num(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

export type CategoryBookingRules = {
  /** Minute values for the duration picker, ordered ascending. */
  durationOptionsMinutes: number[];
  /** Preferred default from API (`defaultDuration`), else first option. */
  defaultDurationMinutes: number;
  /** If set, hide calendar dates after this many days from today (UTC midnight). */
  advanceBookingWindowDays: number | null;
  /**
   * Optional wider window for members/VIP (from `memberships[]` or explicit settings).
   * When null or not greater than `advanceBookingWindowDays`, no VIP-only dates are derived here.
   */
  memberAdvanceBookingWindowDays: number | null;
  /**
   * Optional shorter minimum notice for members/VIP (`memberships[].minimumBookingNotice` or explicit keys).
   * When null or not shorter than `minimumBookingNoticeMinutes`, guest notice applies for everyone.
   */
  memberMinimumBookingNoticeMinutes: number | null;
  /** If set, minimum minutes between “now” and bookable slot start (client-side hint; Bond still enforces). */
  minimumBookingNoticeMinutes: number | null;
  /**
   * Max contiguous booking length in hours (same resource, same day).
   * Parsed from `default.maxSequentialBookingHours`, `default.maxSequentialHours`, or
   * `default.maxSequentialBookings` when hour-specific keys are absent (many orgs store hours here).
   */
  maxSequentialHours: number | null;
  /** From `settings.default.maxBookingHours`; null = unlimited. */
  maxBookingHoursPerDay: number | null;
};

function readSettingsRecord(settings: CategorySettings | undefined): Record<string, unknown> {
  if (!settings || typeof settings !== "object") return {};
  return settings as Record<string, unknown>;
}

/**
 * Max hours per day / sequential: Bond sends `{ amount, unit }` on the portal (e.g. `maxBookingHours`,
 * `maxSequentialBookings`) or a plain number (hours) in older payloads.
 */
function hoursLimitFromSetting(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const amt = num(o.amount);
  if (amt == null || !Number.isFinite(amt) || amt <= 0) return null;
  const unit = String(o.unit ?? "hour").toLowerCase();
  if (unit === "hour" || unit === "hours") return amt;
  if (unit === "minute" || unit === "minutes") return amt / 60;
  if (unit === "day" || unit === "days") return amt * 24;
  return null;
}

/** Parses `{ unit, amount }` style duration objects (Bond category settings). */
function durationToMinutes(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const unit = String(o.unit ?? "minute").toLowerCase();
  const amt = num(o.amount);
  if (amt == null) return null;
  if (unit === "hour" || unit === "hours") return Math.round(amt * 60);
  if (unit === "day" || unit === "days") return Math.round(amt * 24 * 60);
  return Math.round(amt);
}

function parseNestedBookingDurations(s: Record<string, unknown>): {
  min: number;
  max: number;
  step: number;
  def: number | null;
} | null {
  const bd = s.bookingDurations;
  if (!bd || typeof bd !== "object" || Array.isArray(bd)) return null;
  const o = bd as Record<string, unknown>;
  const min = durationToMinutes(o.minDuration);
  const max = durationToMinutes(o.maxDuration);
  const step =
    durationToMinutes(o.durationStep) ??
    durationToMinutes(o.duration_increment) ??
    durationToMinutes(o.bookingDurationStep) ??
    null;
  const def = durationToMinutes(o.defaultDuration);
  if (min == null || max == null || step == null || step <= 0 || max < min) return null;
  return { min, max, step, def };
}

function parseDefaultSettingsBlock(s: Record<string, unknown>): {
  advanceBookingWindowDays: number | null;
  minimumBookingNoticeMinutes: number | null;
  maxSequentialHours: number | null;
  maxBookingHoursPerDay: number | null;
} {
  const d = s.default;
  if (!d || typeof d !== "object") {
    return {
      advanceBookingWindowDays: null,
      minimumBookingNoticeMinutes: null,
      maxSequentialHours: null,
      maxBookingHoursPerDay: null,
    };
  }
  const o = d as Record<string, unknown>;

  let advanceBookingWindowDays: number | null = null;
  const aw = o.advanceBookingWindow;
  if (aw && typeof aw === "object") {
    const u = String((aw as Record<string, unknown>).unit ?? "").toLowerCase();
    const amt = num((aw as Record<string, unknown>).amount);
    if (amt != null && (u === "day" || u === "days")) advanceBookingWindowDays = amt;
  }

  let minimumBookingNoticeMinutes: number | null = null;
  const mn = o.minimumBookingNotice;
  if (mn && typeof mn === "object") {
    const u = String((mn as Record<string, unknown>).unit ?? "").toLowerCase();
    const amt = num((mn as Record<string, unknown>).amount);
    if (amt != null) {
      if (u === "day" || u === "days") minimumBookingNoticeMinutes = amt * 24 * 60;
      else if (u === "hour" || u === "hours") minimumBookingNoticeMinutes = amt * 60;
      else if (u === "minute" || u === "minutes") minimumBookingNoticeMinutes = amt;
    }
  }

  const maxSequentialHours =
    hoursLimitFromSetting(o.maxSequentialBookingHours) ??
    hoursLimitFromSetting(o.maxSequentialHours) ??
    hoursLimitFromSetting(o.maxSequentialBookings);
  const maxBookingHoursPerDay = hoursLimitFromSetting(o.maxBookingHours);

  return {
    advanceBookingWindowDays,
    minimumBookingNoticeMinutes,
    maxSequentialHours:
      maxSequentialHours != null && Number.isFinite(maxSequentialHours) && maxSequentialHours > 0
        ? maxSequentialHours
        : null,
    maxBookingHoursPerDay:
      maxBookingHoursPerDay != null && Number.isFinite(maxBookingHoursPerDay) && maxBookingHoursPerDay > 0
        ? maxBookingHoursPerDay
        : null,
  };
}

/**
 * Widest member/VIP advance window in days from loose category settings (`memberships[]`, explicit keys).
 */
function parseMemberAdvanceBookingWindowDays(s: Record<string, unknown>): number | null {
  const direct =
    num(s.memberAdvanceBookingWindowDays) ??
    num(s.member_advance_booking_window_days) ??
    num(s.vipAdvanceBookingWindowDays) ??
    null;
  if (direct != null && Number.isFinite(direct) && direct > 0) return direct;

  const aw = s.memberAdvanceBookingWindow ?? s.member_advance_booking_window;
  if (aw && typeof aw === "object" && !Array.isArray(aw)) {
    const o = aw as Record<string, unknown>;
    const u = String(o.unit ?? "").toLowerCase();
    const amt = num(o.amount);
    if (amt != null && Number.isFinite(amt) && amt > 0 && (u === "day" || u === "days")) return amt;
  }

  const memberships = s.memberships;
  if (!Array.isArray(memberships)) return null;
  let maxDays: number | null = null;
  for (const item of memberships) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const nested = o.advanceBookingWindow;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const nw = nested as Record<string, unknown>;
      const u = String(nw.unit ?? "").toLowerCase();
      const amt = num(nw.amount);
      if (amt != null && Number.isFinite(amt) && amt > 0 && (u === "day" || u === "days")) {
        maxDays = maxDays == null ? amt : Math.max(maxDays, amt);
      }
    }
    const flat = num(o.advanceBookingWindowDays);
    if (flat != null && Number.isFinite(flat) && flat > 0) {
      maxDays = maxDays == null ? flat : Math.max(maxDays, flat);
    }
  }
  return maxDays;
}

function parseMemberMinimumBookingNoticeMinutes(s: Record<string, unknown>): number | null {
  const direct =
    num(s.memberMinimumBookingNoticeMinutes) ??
    num(s.member_minimum_booking_notice_minutes) ??
    num(s.vipMinimumBookingNoticeMinutes) ??
    null;
  if (direct != null && Number.isFinite(direct) && direct >= 0) return direct;

  const nested = s.memberMinimumBookingNotice ?? s.vipMinimumBookingNotice;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const o = nested as Record<string, unknown>;
    const u = String(o.unit ?? "").toLowerCase();
    const amt = num(o.amount);
    if (amt != null && Number.isFinite(amt) && amt >= 0) {
      if (u === "day" || u === "days") return amt * 24 * 60;
      if (u === "hour" || u === "hours") return amt * 60;
      if (u === "minute" || u === "minutes") return amt;
    }
  }

  const memberships = s.memberships;
  if (!Array.isArray(memberships)) return null;
  let best: number | null = null;
  for (const item of memberships) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const mn = o.minimumBookingNotice;
    if (mn && typeof mn === "object" && !Array.isArray(mn)) {
      const rec = mn as Record<string, unknown>;
      const u = String(rec.unit ?? "").toLowerCase();
      const amt = num(rec.amount);
      if (amt == null || !Number.isFinite(amt) || amt < 0) continue;
      let mins: number;
      if (u === "day" || u === "days") mins = amt * 24 * 60;
      else if (u === "hour" || u === "hours") mins = amt * 60;
      else if (u === "minute" || u === "minutes") mins = amt;
      else continue;
      best = best == null ? mins : Math.min(best, mins);
    }
  }
  return best;
}

/**
 * Reads Bond category `settings` (OpenAPI is a loose object). Prefers nested `bookingDurations`
 * `{ minDuration, maxDuration, durationStep, defaultDuration }`, then flat keys, then legacy array.
 */
export function parseCategoryBookingRules(settings: CategorySettings | undefined): CategoryBookingRules {
  const s = readSettingsRecord(settings);
  const defaults = parseDefaultSettingsBlock(s);

  let min: number | null = null;
  let max: number | null = null;
  let inc: number | null = null;
  let def: number | null = null;

  const nested = parseNestedBookingDurations(s);
  if (nested) {
    min = nested.min;
    max = nested.max;
    inc = nested.step;
    def = nested.def;
  } else {
    min =
      num(s.minDuration) ??
      num(s.min_duration) ??
      num(s.minimumDuration) ??
      null;
    max =
      num(s.maxDuration) ??
      num(s.max_duration) ??
      num(s.maximumDuration) ??
      null;
    inc =
      num(s.durationIncrement) ??
      num(s.incrementDuration) ??
      num(s.bookingDurationIncrement) ??
      num(s.duration_increment) ??
      null;
    def =
      num(s.defaultDuration) ??
      num(s.default_duration) ??
      null;
  }

  let durationOptionsMinutes: number[] = [];

  if (min != null && max != null && inc != null && inc > 0 && max >= min) {
    const stepCount = Math.floor((max - min) / inc) + 1;
    for (let i = 0; i < stepCount; i++) {
      durationOptionsMinutes.push(Math.round(min + i * inc));
    }
  }

  if (durationOptionsMinutes.length === 0) {
    durationOptionsMinutes = bookingDurationsLegacyArray(settings);
  }

  let defaultDurationMinutes = durationOptionsMinutes[0] ?? 60;
  if (def != null && durationOptionsMinutes.length > 0) {
    if (durationOptionsMinutes.includes(def)) defaultDurationMinutes = def;
    else {
      defaultDurationMinutes = durationOptionsMinutes.reduce((best, m) =>
        Math.abs(m - def!) < Math.abs(best - def!) ? m : best
      );
    }
  }

  const advanceBookingWindowDays =
    num(s.advanceBookingWindowDays) ??
    num(s.advance_booking_window_days) ??
    num(s.advanceBookingWindow) ??
    defaults.advanceBookingWindowDays;

  const minimumBookingNoticeMinutes =
    num(s.minimumBookingNoticeMinutes) ??
    num(s.minimum_booking_notice_minutes) ??
    (num(s.minimumBookingNoticeHours) != null ? num(s.minimumBookingNoticeHours)! * 60 : null) ??
    (num(s.minimum_booking_notice_hours) != null ? num(s.minimum_booking_notice_hours)! * 60 : null) ??
    defaults.minimumBookingNoticeMinutes;

  const flatSequentialHours =
    hoursLimitFromSetting(s.maxSequentialBookingHours) ??
    hoursLimitFromSetting(s.maxSequentialHours) ??
    hoursLimitFromSetting(s.maxSequentialBookings);
  const flatDayHours =
    hoursLimitFromSetting(s.maxBookingHours) ?? hoursLimitFromSetting(s.maxBookingHoursPerDay);

  const maxSequentialHours =
    defaults.maxSequentialHours ??
    (flatSequentialHours != null && Number.isFinite(flatSequentialHours) && flatSequentialHours > 0
      ? flatSequentialHours
      : null);

  const maxBookingHoursPerDay =
    defaults.maxBookingHoursPerDay ??
    (flatDayHours != null && Number.isFinite(flatDayHours) && flatDayHours > 0 ? flatDayHours : null);

  const memberAdvanceBookingWindowDays = parseMemberAdvanceBookingWindowDays(s);
  const memberMinimumBookingNoticeMinutes = parseMemberMinimumBookingNoticeMinutes(s);

  return {
    durationOptionsMinutes,
    defaultDurationMinutes,
    advanceBookingWindowDays,
    memberAdvanceBookingWindowDays,
    memberMinimumBookingNoticeMinutes,
    minimumBookingNoticeMinutes,
    maxSequentialHours,
    maxBookingHoursPerDay,
  };
}

export function formatDurationLabel(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return h === 1 ? "1 hr" : `${h} hrs`;
  }
  const h = minutes / 60;
  const label = h.toFixed(1).replace(/\.0$/, "");
  return `${label} hr`;
}

/** Compact label for price chips, e.g. `1hr`, `1.5hr`, `30min`. */
export function formatDurationPriceBadge(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 60) return `${Math.round(minutes)}min`;
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return h === 1 ? "1hr" : `${h}hrs`;
  }
  const h = minutes / 60;
  return `${h.toFixed(1).replace(/\.0$/, "")}hr`;
}

/** Drop API-returned calendar dates that exceed advance-booking window (UTC date comparison). */
export function filterDatesByAdvanceWindow<T extends { date: string }>(
  rows: T[],
  advanceBookingWindowDays: number | null
): T[] {
  if (advanceBookingWindowDays == null || !Number.isFinite(advanceBookingWindowDays) || advanceBookingWindowDays < 0) {
    return rows;
  }
  const today = new Date();
  const cap = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  cap.setUTCDate(cap.getUTCDate() + advanceBookingWindowDays);
  const capStr = cap.toISOString().slice(0, 10);
  return rows.filter((r) => r.date <= capStr);
}

/**
 * Dates returned by schedule settings that fall in the member advance window but outside the guest window.
 * Empty when member window is unset, guest window is unset/unlimited, or member ≤ guest.
 */
/**
 * Logged-in users with a wider category **member** advance window than **guest** get extra bookable dates.
 */
export function resolveEffectiveAdvanceBookingWindowDays(
  guestDays: number | null,
  memberDays: number | null,
  useMemberWindow: boolean
): number | null {
  if (!useMemberWindow || memberDays == null || !Number.isFinite(memberDays) || memberDays < 0) {
    return guestDays;
  }
  if (guestDays == null) return memberDays;
  return Math.max(guestDays, memberDays);
}

/**
 * When category defines a **shorter** member minimum notice than guest, logged-in users get more start times.
 */
export function resolveEffectiveMinimumBookingNoticeMinutes(
  guestMinutes: number | null,
  memberMinutes: number | null,
  useMemberMinimumNotice: boolean
): number | null {
  if (!useMemberMinimumNotice || memberMinutes == null || !Number.isFinite(memberMinutes) || memberMinutes < 0) {
    return guestMinutes;
  }
  if (guestMinutes == null) return memberMinutes;
  return Math.min(guestMinutes, memberMinutes);
}

export function computeVipEarlyAccessDateKeys(
  rows: { date: string }[],
  guestAdvanceBookingWindowDays: number | null,
  memberAdvanceBookingWindowDays: number | null
): string[] {
  if (
    memberAdvanceBookingWindowDays == null ||
    guestAdvanceBookingWindowDays == null ||
    !Number.isFinite(memberAdvanceBookingWindowDays) ||
    !Number.isFinite(guestAdvanceBookingWindowDays) ||
    memberAdvanceBookingWindowDays <= guestAdvanceBookingWindowDays
  ) {
    return [];
  }
  const guestFiltered = filterDatesByAdvanceWindow(rows, guestAdvanceBookingWindowDays);
  const memberFiltered = filterDatesByAdvanceWindow(rows, memberAdvanceBookingWindowDays);
  const guestIds = new Set(guestFiltered.map((r) => r.date));
  return memberFiltered.filter((r) => !guestIds.has(r.date)).map((r) => r.date);
}
