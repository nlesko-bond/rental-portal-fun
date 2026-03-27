import {
  calendarDateKeyFromNoticeInstant,
  extractEarliestBookableInstantFromNoticeMessage,
  isScheduleMinimumNoticeViolation,
} from "./bond-errors";
import { bondBffGetJson, BondBffError } from "./bond-json";
import type {
  BookingScheduleDto,
  BookingScheduleSettingsDto,
  PaginatedProductsResponse,
  PublicOnlineBookingPortalDto,
} from "@/types/online-booking";

function orgBase(orgId: number): string[] {
  return ["v1", "organization", String(orgId)];
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
  return bondBffGetJson<BookingScheduleSettingsDto>(path, scheduleSearchParams(q));
}

export async function fetchBookingSchedule(orgId: number, q: ScheduleQuery): Promise<BookingScheduleDto> {
  const path = [...orgBase(orgId), "online-booking", "schedule"];
  return bondBffGetJson<BookingScheduleDto>(path, scheduleSearchParams(q));
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
  return withSchedule500Fallback(orgId, q, (oid, vq) =>
    withScheduleMinimumNoticeRecovery(oid, vq, fetchBookingScheduleSettings)
  );
}

export function fetchBookingScheduleRecovering(orgId: number, q: ScheduleQuery): Promise<BookingScheduleDto> {
  return withSchedule500Fallback(orgId, q, (oid, vq) =>
    withScheduleMinimumNoticeRecovery(oid, vq, fetchBookingSchedule)
  );
}
