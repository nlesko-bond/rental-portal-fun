import type { OnlineBookingView, PublicOnlineBookingPortalDto } from "@/types/online-booking";
import { parseCategoryBookingRules } from "@/lib/category-booking-settings";
import { clientScheduleViews, mapPortalViewToClientView, parseClientViewFromUrl } from "@/lib/booking-views";

export type BookingUrlState = {
  facilityId: number;
  categoryId: number;
  activity: string;
  productId: number | null;
  date: string | null;
  duration: number | null;
  view: OnlineBookingView;
  productPage: number;
};

function parseIntParam(sp: URLSearchParams, key: string): number | null {
  const v = sp.get(key);
  if (v == null || v === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

/** Preserved on `writeBookingUrl` so dev can switch org/portal/theme without losing booking picks. */
export const BOOKING_URL_DEV_PARAM_KEYS = [
  "portalId",
  "portal",
  "orgId",
  "org",
  "primary",
  "accent",
  "secondary",
  "success",
  "surface",
  "tertiary",
  "orgName",
  "logoUrl",
  "seedPunches",
] as const;

function parseHexColorParam(raw: string | null): string | undefined {
  if (raw == null || raw === "") return undefined;
  const s = raw.trim();
  if (/^#[0-9A-Fa-f]{3}$/.test(s)) return s;
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^#[0-9A-Fa-f]{8}$/.test(s)) return s;
  return undefined;
}

export type BookingDevUrlOverrides = {
  orgId?: number;
  portalId?: number;
  theme?: {
    primary?: string;
    accent?: string;
    success?: string;
    surface?: string;
  };
  branding?: {
    orgName?: string;
    logoUrl?: string;
  };
};

function parseStringParam(raw: string | null, maxLen: number): string | undefined {
  if (raw == null) return undefined;
  const s = raw.trim();
  if (s.length === 0 || s.length > maxLen) return undefined;
  return s;
}

const MAX_ORG_NAME_LEN = 64;
const MAX_LOGO_URL_LEN = 2_048;

function parseLogoUrlParam(raw: string | null): string | undefined {
  const s = parseStringParam(raw, MAX_LOGO_URL_LEN);
  if (s == null) return undefined;
  if (!/^https?:\/\//i.test(s) && !s.startsWith("/")) return undefined;
  return s;
}

/**
 * Optional URL overrides for local testing / demo:
 * `?orgId=155&portalId=42&primary=%230d4774&accent=%23f7b500&surface=%23f0f4f7
 *   &orgName=Sonic+Squad&logoUrl=https%3A%2F%2F…%2Flogo.png&seedPunches=10`
 * Hex colors should be `%23`-encoded; `secondary` is an alias for `accent`,
 * `tertiary` is an alias for `surface`. `seedPunches` credits the selected punch-pass
 * product after login (demo wallet).
 */
export function readBookingDevOverrides(searchParams: URLSearchParams): BookingDevUrlOverrides {
  const orgId = parseIntParam(searchParams, "orgId") ?? parseIntParam(searchParams, "org") ?? undefined;
  const portalId =
    parseIntParam(searchParams, "portalId") ?? parseIntParam(searchParams, "portal") ?? undefined;
  const primary = parseHexColorParam(searchParams.get("primary"));
  const accent =
    parseHexColorParam(searchParams.get("accent")) ?? parseHexColorParam(searchParams.get("secondary"));
  const success = parseHexColorParam(searchParams.get("success"));
  const surface =
    parseHexColorParam(searchParams.get("surface")) ?? parseHexColorParam(searchParams.get("tertiary"));
  const theme =
    primary != null || accent != null || success != null || surface != null
      ? {
          ...(primary != null ? { primary } : {}),
          ...(accent != null ? { accent } : {}),
          ...(success != null ? { success } : {}),
          ...(surface != null ? { surface } : {}),
        }
      : undefined;
  const orgName = parseStringParam(searchParams.get("orgName"), MAX_ORG_NAME_LEN);
  const logoUrl = parseLogoUrlParam(searchParams.get("logoUrl"));
  const branding =
    orgName != null || logoUrl != null
      ? {
          ...(orgName != null ? { orgName } : {}),
          ...(logoUrl != null ? { logoUrl } : {}),
        }
      : undefined;
  return { orgId, portalId, theme, branding };
}

export function readBookingUrl(searchParams: URLSearchParams): Partial<BookingUrlState> {
  return {
    facilityId: parseIntParam(searchParams, "facility") ?? undefined,
    categoryId: parseIntParam(searchParams, "category") ?? undefined,
    activity: searchParams.get("activity") ?? undefined,
    productId: parseIntParam(searchParams, "product"),
    date: searchParams.get("date"),
    duration: parseIntParam(searchParams, "duration"),
    view: parseClientViewFromUrl(searchParams.get("view")),
    productPage: parseIntParam(searchParams, "page") ?? undefined,
  };
}

export function writeBookingUrl(state: BookingUrlState, preserveDevParams?: URLSearchParams | null): string {
  const q = new URLSearchParams();
  q.set("facility", String(state.facilityId));
  q.set("category", String(state.categoryId));
  q.set("activity", state.activity);
  if (state.productId != null) q.set("product", String(state.productId));
  if (state.date) q.set("date", state.date);
  if (state.duration != null) q.set("duration", String(state.duration));
  q.set("view", state.view);
  if (state.productPage > 1) q.set("page", String(state.productPage));
  if (preserveDevParams) {
    for (const key of BOOKING_URL_DEV_PARAM_KEYS) {
      const v = preserveDevParams.get(key);
      if (v != null && v !== "") q.set(key, v);
    }
  }
  return q.toString();
}

export function resolveBookingState(
  portal: PublicOnlineBookingPortalDto,
  fromUrl: Partial<BookingUrlState>
): BookingUrlState {
  const { options: o } = portal;
  const views = clientScheduleViews(o.views);
  const facilityIds = new Set(o.facilities.map((f) => f.id));
  let facilityId = fromUrl.facilityId;
  if (facilityId == null || !facilityIds.has(facilityId)) {
    facilityId = o.defaultFacility.id;
  }

  const categoryIds = new Set(o.categories.map((c) => c.id));
  let categoryId = fromUrl.categoryId;
  if (categoryId == null || !categoryIds.has(categoryId)) {
    categoryId = o.defaultCategory.id;
  }

  const category = o.categories.find((c) => c.id === categoryId) ?? o.defaultCategory;
  const rules = parseCategoryBookingRules(category.settings);
  const durations = rules.durationOptionsMinutes;

  let activity = fromUrl.activity;
  if (!activity || !o.activities.includes(activity)) {
    activity = o.defaultActivity;
  }

  const defaultFromApi = mapPortalViewToClientView(o.defaultView);
  let view: OnlineBookingView;
  if (fromUrl.view != null && views.includes(fromUrl.view)) {
    view = fromUrl.view;
  } else if (views.includes(defaultFromApi)) {
    view = defaultFromApi;
  } else {
    view = views[0] ?? "calendar";
  }

  let duration = fromUrl.duration;
  if (duration == null || !durations.includes(duration)) {
    duration = rules.defaultDurationMinutes;
  }

  const productPage = fromUrl.productPage != null && fromUrl.productPage >= 1 ? fromUrl.productPage : 1;

  return {
    facilityId,
    categoryId,
    activity,
    productId: fromUrl.productId ?? null,
    date: fromUrl.date ?? null,
    duration,
    view,
    productPage,
  };
}

/** True when the URL already reflects canonical `state` (dev params ignored). */
export function urlCanonicalMatches(sp: URLSearchParams, state: BookingUrlState): boolean {
  const g = (k: string, expected: string) => (sp.get(k) ?? "") === expected;
  if (!g("facility", String(state.facilityId))) return false;
  if (!g("category", String(state.categoryId))) return false;
  if (!g("activity", state.activity)) return false;
  if (!g("view", state.view)) return false;
  if (state.productId != null) {
    if (!g("product", String(state.productId))) return false;
  } else if (sp.get("product")) return false;
  if (state.date) {
    if (!g("date", state.date)) return false;
  } else if (sp.get("date")) return false;
  if (state.duration != null) {
    if (!g("duration", String(state.duration))) return false;
  } else if (sp.get("duration")) return false;
  const p = sp.get("page");
  if (state.productPage > 1) {
    if (p !== String(state.productPage)) return false;
  } else if (p) return false;
  return true;
}
