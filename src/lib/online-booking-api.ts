import { bondCalendarDateKey } from "./bond-calendar-date";
import {
  calendarDateKeyFromNoticeInstant,
  extractEarliestBookableInstantFromNoticeMessage,
  isScheduleMinimumNoticeViolation,
} from "./bond-errors";
import { bondBffGetJson, BondBffError } from "./bond-json";
import type {
  BookingScheduleDto,
  BookingScheduleSettingsDto,
  DateAndTimesDto,
  PaginatedProductsResponse,
  PublicOnlineBookingPortalDto,
  PublicResourceScheduleDto,
} from "@/types/online-booking";

function orgBase(orgId: number): string[] {
  return ["v1", "organization", String(orgId)];
}

function normalizeDateAndTimes(rows: DateAndTimesDto[] | undefined): DateAndTimesDto[] {
  if (!Array.isArray(rows)) return [];
  const out: DateAndTimesDto[] = [];
  for (const row of rows) {
    const date = bondCalendarDateKey(row.date);
    if (date == null) continue;
    out.push({ ...row, date });
  }
  return out;
}

function normalizeScheduleSettings(dto: BookingScheduleSettingsDto): BookingScheduleSettingsDto {
  return {
    ...dto,
    dates: normalizeDateAndTimes(dto.dates),
  };
}

function normalizeSchedule(dto: BookingScheduleDto): BookingScheduleDto {
  const resources: PublicResourceScheduleDto[] = (dto.resources ?? []).map((row) => ({
    ...row,
    timeSlots: (row.timeSlots ?? []).map((slot) => ({
      ...slot,
      startDate: bondCalendarDateKey(slot.startDate) ?? slot.startDate,
      endDate: bondCalendarDateKey(slot.endDate) ?? slot.endDate,
    })),
  }));
  return {
    ...dto,
    dates: normalizeDateAndTimes(dto.dates),
    resources,
  };
}

export async function fetchPublicPortal(orgId: number, portalId: number): Promise<PublicOnlineBookingPortalDto> {
  const path = [...orgBase(orgId), "online-booking", "portals", String(portalId)];
  return bondBffGetJson<PublicOnlineBookingPortalDto>(path);
}

export async function fetchCategoryProducts(
  orgId: number,
  categoryId: number,
  opts: {
    page?: number;
    itemsPerPage?: number;
    facilitiesIds?: number[];
    sports?: string[];
    /** When Bond supports it: user-scoped product list (JWT). Omitted when anonymous. */
    userId?: number;
  }
): Promise<PaginatedProductsResponse> {
  const path = [...orgBase(orgId), "category", String(categoryId), "products"];
  const q = new URLSearchParams();
  if (opts.page != null) q.set("page", String(opts.page));
  if (opts.itemsPerPage != null) q.set("itemsPerPage", String(opts.itemsPerPage));
  for (const id of opts.facilitiesIds ?? []) {
    q.append("facilitiesIds", String(id));
  }
  for (const s of opts.sports ?? []) {
    q.append("sports", s);
  }
  if (opts.userId != null) q.set("userId", String(opts.userId));
  q.append("expand", "media");
  q.append("expand", "prices");
  q.append("expand", "requiredProducts");
  q.append("expand", "entitlementDiscounts");
  return bondBffGetJson<PaginatedProductsResponse>(path, q);
}

export type ScheduleQuery = {
  facilityId: number;
  productId: number;
  date?: string;
  duration?: number;
  timeIncrements?: number[];
  resourcesIds?: number[];
  /** When set, Bond applies membership / user-specific schedule rules (JWT required). */
  userId?: number;
};

/**
 * Settings only needs product + facility (+ optional user). `date` / `duration` /
 * `timeIncrements` make Bond generate a per-day slot grid (~10–16s) instead of the
 * date list (~400ms). Preferred-start times come from the slots response.
 */
export function bondScheduleSettingsQuery(q: ScheduleQuery): ScheduleQuery {
  return {
    facilityId: q.facilityId,
    productId: q.productId,
    ...(q.userId != null ? { userId: q.userId } : {}),
  };
}

/**
 * Slot fetches keep `date` + `duration` but omit `timeIncrements`. Sending portal
 * intervals (e.g. 15+30+45) makes Bond ~10–15s slower and drops on-the-hour starts.
 */
export function bondScheduleSlotsQuery(q: ScheduleQuery): ScheduleQuery {
  return {
    facilityId: q.facilityId,
    productId: q.productId,
    ...(q.date ? { date: q.date } : {}),
    ...(q.duration != null ? { duration: q.duration } : {}),
    ...(q.userId != null ? { userId: q.userId } : {}),
    ...(q.resourcesIds != null && q.resourcesIds.length > 0 ? { resourcesIds: q.resourcesIds } : {}),
  };
}

function scheduleSearchParams(q: ScheduleQuery): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("facilityId", String(q.facilityId));
  sp.set("productId", String(q.productId));
  if (q.date) sp.set("date", q.date);
  if (q.duration != null) sp.set("duration", String(q.duration));
  if (q.userId != null) sp.set("userId", String(q.userId));
  for (const n of q.timeIncrements ?? []) {
    if (Number.isFinite(n) && n > 0) sp.append("timeIncrements", String(n));
  }
  for (const id of q.resourcesIds ?? []) {
    sp.append("resourcesIds", String(id));
  }
  return sp;
}

export async function fetchBookingScheduleSettings(
  orgId: number,
  q: ScheduleQuery
): Promise<BookingScheduleSettingsDto> {
  const path = [...orgBase(orgId), "online-booking", "schedule", "settings"];
  const dto = await bondBffGetJson<BookingScheduleSettingsDto>(path, scheduleSearchParams(q));
  return normalizeScheduleSettings(dto);
}

export async function fetchBookingSchedule(orgId: number, q: ScheduleQuery): Promise<BookingScheduleDto> {
  const path = [...orgBase(orgId), "online-booking", "schedule"];
  const dto = await bondBffGetJson<BookingScheduleDto>(path, scheduleSearchParams(bondScheduleSlotsQuery(q)));
  return normalizeSchedule(dto);
}

function scheduleQuerySignature(v: ScheduleQuery): string {
  return [
    v.facilityId,
    v.productId,
    v.date ?? "",
    v.duration ?? "x",
    (v.timeIncrements ?? []).join(":"),
    (v.resourcesIds ?? []).join(":"),
    v.userId ?? "",
  ].join("|");
}

/** Bond sometimes 500s for instructor / alternate resource modes when optional query combos are invalid. */
function scheduleQueryVariants(q: ScheduleQuery): ScheduleQuery[] {
  const seen = new Set<string>();
  const out: ScheduleQuery[] = [];
  const push = (v: ScheduleQuery) => {
    const k = scheduleQuerySignature(v);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(v);
    }
  };

  push(q);
  if (q.timeIncrements != null && q.timeIncrements.length > 0) {
    push({ ...q, timeIncrements: undefined });
  }
  if (q.duration != null) {
    push({ ...q, duration: undefined });
  }
  if (q.timeIncrements != null && q.timeIncrements.length > 0 && q.duration != null) {
    push({ ...q, timeIncrements: undefined, duration: undefined });
  }
  return out;
}

async function withSchedule500Fallback<T>(
  orgId: number,
  q: ScheduleQuery,
  fetcher: (orgId: number, query: ScheduleQuery) => Promise<T>
): Promise<T> {
  const variants = scheduleQueryVariants(q);
  let last: unknown;
  for (const vq of variants) {
    try {
      return await fetcher(orgId, vq);
    } catch (e) {
      last = e;
      if (e instanceof BondBffError && e.status === 500) continue;
      throw e;
    }
  }
  throw last;
}

async function withScheduleMinimumNoticeRecovery<T>(
  orgId: number,
  q: ScheduleQuery,
  fetcher: (orgId: number, query: ScheduleQuery) => Promise<T>
): Promise<T> {
  try {
    return await fetcher(orgId, q);
  } catch (e) {
    if (!isScheduleMinimumNoticeViolation(e) || !(e instanceof BondBffError)) throw e;
    const instant = extractEarliestBookableInstantFromNoticeMessage(e.message);
    if (!instant) throw e;
    const dateKey = calendarDateKeyFromNoticeInstant(instant);
    if (q.date === dateKey) throw e;
    return fetcher(orgId, { ...q, date: dateKey });
  }
}

/** Retries once with `date` parsed from `SCHEDULE.MINIMUM_NOTICE_VIOLATION` when the first request had no / invalid day. */
export function fetchBookingScheduleSettingsRecovering(
  orgId: number,
  q: ScheduleQuery
): Promise<BookingScheduleSettingsDto> {
  return withSchedule500Fallback(orgId, bondScheduleSettingsQuery(q), (oid, vq) =>
    withScheduleMinimumNoticeRecovery(oid, vq, fetchBookingScheduleSettings)
  );
}

export function fetchBookingScheduleRecovering(orgId: number, q: ScheduleQuery): Promise<BookingScheduleDto> {
  return withSchedule500Fallback(orgId, bondScheduleSlotsQuery(q), (oid, vq) =>
    withScheduleMinimumNoticeRecovery(oid, vq, fetchBookingSchedule)
  );
}
