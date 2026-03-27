"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatBondUserMessage } from "@/lib/bond-errors";
import {
  computeVipEarlyAccessDateKeys,
  filterDatesByAdvanceWindow,
  formatDurationLabel,
  formatDurationPriceBadge,
  parseCategoryBookingRules,
} from "@/lib/category-booking-settings";
import { formatActivityLabel } from "@/lib/booking-activity-display";
import {
  BOOKING_LOADING_TAGLINE,
  BOOKING_SCHEDULE_SETTINGS_TAGLINE,
  BOOKING_SLOTS_TAGLINE,
  pickSportsFact,
} from "@/lib/booking-loading-copy";
import {
  formatSlotCurrency,
  formatSlotPriceDisplay,
  productCatalogMinUnitPrice,
  productCatalogShowsMemberFree,
  productHasVariableSchedulePricing,
  productMembershipGated,
  slotDisplayTotalPrice,
} from "@/lib/booking-pricing";
import {
  filterStartTimesByMinimumNotice,
  snapPreferredStartToEligible,
} from "@/lib/booking-schedule-start";
import { formatPreferredStartOptionLabel, getTimesForScheduleDate } from "@/lib/schedule-settings";
import { useHydrated } from "@/hooks/useHydrated";
import {
  fetchBookingScheduleRecovering,
  fetchBookingScheduleSettingsRecovering,
  fetchCategoryProducts,
  fetchPublicPortal,
} from "@/lib/online-booking-api";
import { BondBffError } from "@/lib/bond-json";
import type { BookingScheduleDto, ExtendedProductDto, OnlineBookingView, ScheduleTimeSlotDto } from "@/types/online-booking";
import type { PackageAddonLine } from "@/lib/product-package-addons";
import { bookingAppearanceClass, resolveBookingThemeStyle, type BookingThemeUrlOverrides } from "@/lib/booking-theme";
import { clientScheduleViews, viewUiLabel } from "@/lib/booking-views";
import { resolveProductCardImageAtStep, type ProductCardImageFallbackStep } from "@/lib/product-card-image";
import { bookingOptionalAddons } from "@/lib/product-package-addons";
import { slotControlKey, validateSlotSelection, type PickedSlot } from "@/lib/slot-selection";
import {
  ActivityPickerBody,
  CategoryPickerBody,
  activityEmoji,
  FacilityPickerBody,
  IconCalendar,
  IconPin,
  ListPickerBody,
} from "./booking-picker-bodies";
import { BookingDelayedFunLoader } from "./BookingDelayedFunLoader";
import {
  IconClockDetail,
  IconLockDetail,
  IconLogIn,
  IconPassTicket,
  IconPeakTrend,
  IconPercentBadge,
} from "./booking-icons";
import { AvailableDateCalendarBody } from "./AvailableDateCalendarBody";
import { BookingSelectionPortal } from "./BookingSelectionPortal";
import { ScheduleCalendarView } from "./ScheduleCalendarView";
import { BookingAddonPanel, getEffectiveAddonSlotKeys, type AddonSlotTargeting } from "./BookingAddonPanel";
import { ProductDetailModal } from "./ProductDetailModal";
import { ModalShell } from "./ModalShell";
import {
  readBookingDevOverrides,
  readBookingUrl,
  resolveBookingState,
  writeBookingUrl,
  type BookingUrlState,
} from "./booking-url";
import { useBondAuth } from "@/components/auth/BondAuthContext";
import { LoginModal } from "@/components/auth/LoginModal";

const PRODUCTS_PAGE_SIZE = 30;

const CB_APPEARANCE_STORAGE = "cb-booking-appearance";

function IconUserCircle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c.85-2.35 3.05-4 6.5-4s5.65 1.65 6.5 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

const START_TIME_AUTO = "__auto__";

type PickerKind = "facility" | "category" | "activity" | "date" | "start" | null;

type BondEnv =
  | { ok: true; orgId: number; portalId: number; devTheme?: BookingThemeUrlOverrides }
  | { ok: false };

/** Env IDs from `NEXT_PUBLIC_*` or URL `?orgId=&portalId=` (or `org` / `portal`). */
function useBondEnv(searchParamsKey: string): BondEnv {
  return useMemo(() => {
    const sp = new URLSearchParams(searchParamsKey);
    const dev = readBookingDevOverrides(sp);
    const orgRaw = process.env.NEXT_PUBLIC_BOND_ORG_ID;
    const portalRaw = process.env.NEXT_PUBLIC_BOND_PORTAL_ID;
    const envOrg = orgRaw ? Number(orgRaw) : NaN;
    const envPortal = portalRaw ? Number(portalRaw) : NaN;
    const orgId = dev.orgId ?? envOrg;
    const portalId = dev.portalId ?? envPortal;
    if (!Number.isFinite(orgId) || !Number.isFinite(portalId)) {
      return { ok: false };
    }
    return { ok: true, orgId, portalId, devTheme: dev.theme };
  }, [searchParamsKey]);
}

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function slotLabel(slot: { startDate: string; startTime: string; endTime: string }): string {
  return `${slot.startTime.slice(0, 5)}–${slot.endTime.slice(0, 5)}`;
}

function formatBookingDateShort(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ScheduleRequestError({ error }: { error: Error }) {
  if (error instanceof BondBffError) {
    return (
      <div role="alert" className="cb-alert">
        <p>{formatBondUserMessage(error)}</p>
      </div>
    );
  }
  return (
    <p className="cb-alert cb-alert--error" role="alert">
      {error.message}
    </p>
  );
}

function urlCanonicalMatches(sp: URLSearchParams, state: BookingUrlState): boolean {
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

/** Slot DTO has price but not currency; reuse selected product’s first price currency when available. */
function ScheduleMatrix({
  schedule,
  product,
  durationMinutes,
  priceCurrency,
  membershipGated,
  selectedKeys,
  onToggleSlot,
}: {
  schedule: BookingScheduleDto;
  product: ExtendedProductDto | undefined;
  durationMinutes: number;
  priceCurrency: string | null;
  membershipGated: boolean;
  selectedKeys: ReadonlySet<string>;
  onToggleSlot: (resourceId: number, resourceName: string, slot: ScheduleTimeSlotDto) => void;
}) {
  const timeKeys = useMemo(() => {
    const set = new Set<string>();
    for (const r of schedule.resources) {
      for (const s of r.timeSlots) {
        set.add(`${s.startDate} ${s.startTime}`);
      }
    }
    return [...set].sort();
  }, [schedule.resources]);

  return (
    <div className="cb-hide-scrollbar overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--cb-border)] bg-[var(--cb-bg-table-head)]">
            <th className="p-3 font-semibold text-[var(--cb-text)]">Resource</th>
            {timeKeys.map((k) => (
              <th key={k} className="whitespace-nowrap p-3 font-semibold text-[var(--cb-text-muted)]">
                {k.slice(11, 16)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.resources.map((row) => (
            <tr key={row.resource.id} className="border-b border-[var(--cb-border)]">
              <td className="p-3 font-semibold text-[var(--cb-text)]">{row.resource.name}</td>
              {timeKeys.map((k) => {
                const slot = row.timeSlots.find((s) => `${s.startDate} ${s.startTime}` === k);
                const sk = slot ? slotControlKey(row.resource.id, slot) : "";
                const picked = sk && selectedKeys.has(sk);
                const slotTotal =
                  slot && slot.isAvailable
                    ? slotDisplayTotalPrice(slot.price, product, durationMinutes)
                    : NaN;
                return (
                  <td key={k} className="p-3">
                    {slot ? (
                      <button
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => slot.isAvailable && onToggleSlot(row.resource.id, row.resource.name, slot)}
                        className={`min-w-[3.5rem] rounded-md border px-2 py-1 text-sm font-semibold transition-colors ${
                          picked
                            ? "border-2 border-[var(--cb-primary)] bg-[var(--cb-slot-selected-bg)] text-[var(--cb-primary)]"
                            : slot.isAvailable
                              ? "border border-[var(--cb-border)] text-[var(--cb-primary)] hover:border-[var(--cb-primary)]"
                              : "cursor-not-allowed text-[var(--cb-text-faint)] line-through opacity-50"
                        }`}
                        title={slotLabel(slot)}
                      >
                        {slot.isAvailable && priceCurrency
                          ? formatSlotPriceDisplay(slotTotal, priceCurrency, { membershipGated })
                          : slot.isAvailable
                            ? String(slot.price)
                            : "—"}
                      </button>
                    ) : (
                      <span className="text-[var(--cb-border)]">·</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BookingExperience() {
  const hydrated = useHydrated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const env = useBondEnv(searchParams.toString());
  const bondAuth = useBondAuth();
  const [preferredStartTime, setPreferredStartTime] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Map<string, PickedSlot>>(new Map());
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<number>>(new Set());
  const [addonSlotTargeting, setAddonSlotTargeting] = useState<AddonSlotTargeting>({});
  const [addonsExpanded, setAddonsExpanded] = useState(false);
  const [slotBarError, setSlotBarError] = useState<string | null>(null);
  const [productInfoId, setProductInfoId] = useState<number | null>(null);
  const [picker, setPicker] = useState<PickerKind>(null);
  const [heroLoadFailed, setHeroLoadFailed] = useState<Record<string, number>>({});
  const [appearanceMode, setAppearanceMode] = useState<"system" | "light" | "dark">(() => {
    if (typeof window === "undefined") return "system";
    try {
      const v = localStorage.getItem(CB_APPEARANCE_STORAGE);
      if (v === "light" || v === "dark" || v === "system") return v;
    } catch {
      /* ignore */
    }
    return "system";
  });

  const selectedKeysSet = useMemo(() => new Set(selectedSlots.keys()), [selectedSlots]);

  const clearSlotSelection = useCallback(() => {
    setSelectedSlots(new Map());
    setSelectedAddonIds(new Set());
    setAddonSlotTargeting({});
    setAddonsExpanded(false);
    setSlotBarError(null);
  }, []);

  const portalQuery = useQuery({
    queryKey: ["bond", "portal", env.ok ? env.orgId : 0, env.ok ? env.portalId : 0],
    queryFn: () => {
      if (!env.ok) throw new Error("Bond env not configured");
      return fetchPublicPortal(env.orgId, env.portalId);
    },
    enabled: env.ok,
  });

  const portal = portalQuery.data;

  const themeStyle = useMemo(
    () => resolveBookingThemeStyle(portal ?? undefined, env.ok ? env.devTheme : undefined),
    [portal, env]
  );

  const appearanceClass = useMemo(() => {
    if (appearanceMode === "light") return "consumer-booking--light";
    if (appearanceMode === "dark") return "consumer-booking--dark";
    return bookingAppearanceClass();
  }, [appearanceMode]);

  const cycleAppearance = useCallback(() => {
    setAppearanceMode((prev) => {
      const order: ("system" | "light" | "dark")[] = ["system", "light", "dark"];
      const i = order.indexOf(prev);
      const next = order[(i + 1) % order.length]!;
      try {
        localStorage.setItem(CB_APPEARANCE_STORAGE, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const state = useMemo(() => {
    if (!portal) return null;
    return resolveBookingState(portal, readBookingUrl(searchParams));
  }, [portal, searchParams]);

  const pushState = useCallback(
    (next: BookingUrlState) => {
      router.replace(`/?${writeBookingUrl(next, searchParams)}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (!portal || !state) return;
    if (!urlCanonicalMatches(searchParams, state)) {
      pushState(state);
    }
  }, [portal, state, searchParams, pushState]);

  const productsQuery = useQuery({
    queryKey: [
      "bond",
      "products",
      env.ok ? env.orgId : 0,
      state?.categoryId,
      state?.facilityId,
      state?.activity,
      state?.productPage,
    ],
    queryFn: () => {
      if (!env.ok || !state) throw new Error("Missing org or selection");
      return fetchCategoryProducts(env.orgId, state.categoryId, {
        page: state.productPage,
        itemsPerPage: PRODUCTS_PAGE_SIZE,
        facilitiesIds: [state.facilityId],
        sports: [state.activity],
      });
    },
    enabled: env.ok && !!state,
  });

  useEffect(() => {
    if (!state || !productsQuery.data) return;
    const ids = productsQuery.data.data.map((p) => p.id);
    if (ids.length === 0) return;
    if (state.productId == null || !ids.includes(state.productId)) {
      pushState({ ...state, productId: ids[0] });
    }
  }, [productsQuery.data, state, pushState]);

  const categoryRules = useMemo(() => {
    if (!portal || !state) return null;
    const cat = portal.options.categories.find((c) => c.id === state.categoryId) ?? portal.options.defaultCategory;
    return parseCategoryBookingRules(cat.settings);
  }, [portal, state]);

  const slotRules = useMemo(
    () => ({
      maxSequentialHours: categoryRules?.maxSequentialHours ?? null,
      maxBookingHoursPerDay: categoryRules?.maxBookingHoursPerDay ?? null,
    }),
    [categoryRules]
  );

  const toggleSlot = useCallback(
    (resourceId: number, resourceName: string, s: ScheduleTimeSlotDto) => {
      const key = slotControlKey(resourceId, s);
      setSelectedSlots((prev) => {
        if (prev.has(key)) {
          setSlotBarError(null);
          const next = new Map(prev);
          next.delete(key);
          return next;
        }
        const picked: PickedSlot = {
          key,
          resourceId,
          resourceName,
          startDate: s.startDate,
          startTime: s.startTime,
          endTime: s.endTime,
          price: s.price,
        };
        const next = new Map(prev);
        next.set(key, picked);
        const v = validateSlotSelection([...next.values()], slotRules);
        if (!v.ok) {
          setSlotBarError(v.message ?? "That selection isn't allowed.");
          return prev;
        }
        setSlotBarError(null);
        return next;
      });
    },
    [slotRules]
  );

  const scheduleContext = useMemo(() => {
    if (!env.ok || !state?.productId || !portal) return null;
    let timeIncrements: number[] | undefined;
    if (portal.options.enableStartTimeSelection !== false) {
      const raw = portal.options.startTimeIntervals;
      if (Array.isArray(raw)) {
        const filtered = raw.filter((n) => typeof n === "number" && Number.isFinite(n) && n > 0);
        if (filtered.length > 0) timeIncrements = filtered;
      }
    }
    return {
      facilityId: state.facilityId,
      productId: state.productId,
      duration: state.duration ?? undefined,
      timeIncrements,
    };
  }, [env.ok, state, portal]);

  /** Schedule settings for the product open in the info modal (may differ from selected booking product). */
  const detailModalScheduleContext = useMemo(() => {
    if (!env.ok || !state || !portal || productInfoId == null) return null;
    let timeIncrements: number[] | undefined;
    if (portal.options.enableStartTimeSelection !== false) {
      const raw = portal.options.startTimeIntervals;
      if (Array.isArray(raw)) {
        const filtered = raw.filter((n) => typeof n === "number" && Number.isFinite(n) && n > 0);
        if (filtered.length > 0) timeIncrements = filtered;
      }
    }
    return {
      facilityId: state.facilityId,
      productId: productInfoId,
      duration: state.duration ?? undefined,
      timeIncrements,
    };
  }, [env.ok, state, portal, productInfoId]);

  const detailModalScheduleSettingsQuery = useQuery({
    queryKey: [
      "bond",
      "scheduleSettingsForModal",
      env.ok ? env.orgId : 0,
      detailModalScheduleContext,
      state?.date,
    ],
    queryFn: () => {
      if (!env.ok || !detailModalScheduleContext) throw new Error("Missing modal schedule context");
      return fetchBookingScheduleSettingsRecovering(env.orgId, {
        ...detailModalScheduleContext,
        date: state?.date ?? undefined,
      });
    },
    enabled: env.ok && detailModalScheduleContext != null,
  });

  const scheduleSettingsQuery = useQuery({
    queryKey: ["bond", "scheduleSettings", env.ok ? env.orgId : 0, scheduleContext, state?.date],
    queryFn: () => {
      if (!env.ok || !scheduleContext) throw new Error("Missing schedule context");
      return fetchBookingScheduleSettingsRecovering(env.orgId, {
        ...scheduleContext,
        date: state?.date ?? undefined,
      });
    },
    enabled: env.ok && !!scheduleContext,
  });

  const filteredScheduleDates = useMemo(() => {
    const rows = scheduleSettingsQuery.data?.dates ?? [];
    return filterDatesByAdvanceWindow(rows, categoryRules?.advanceBookingWindowDays ?? null);
  }, [scheduleSettingsQuery.data, categoryRules?.advanceBookingWindowDays]);

  const vipEarlyAccessDates = useMemo(() => {
    const rows = scheduleSettingsQuery.data?.dates ?? [];
    return computeVipEarlyAccessDateKeys(
      rows,
      categoryRules?.advanceBookingWindowDays ?? null,
      categoryRules?.memberAdvanceBookingWindowDays ?? null
    );
  }, [
    scheduleSettingsQuery.data,
    categoryRules?.advanceBookingWindowDays,
    categoryRules?.memberAdvanceBookingWindowDays,
  ]);

  const scheduleDateKey = state?.date ?? null;

  /** Start times allowed for the selected calendar day after minimum-notice trim. */
  const eligiblePreferredStarts = useMemo(() => {
    if (!scheduleDateKey) return [];
    const raw = getTimesForScheduleDate(filteredScheduleDates, scheduleDateKey);
    return filterStartTimesByMinimumNotice(
      raw,
      scheduleDateKey,
      categoryRules?.minimumBookingNoticeMinutes ?? null
    ).sort();
  }, [filteredScheduleDates, scheduleDateKey, categoryRules?.minimumBookingNoticeMinutes]);

  /** Nearest Bond-allowed start for the fetch (minimum notice + category increments). */
  const resolvedPreferredStartForFetch = useMemo(() => {
    if (!preferredStartTime || !scheduleDateKey) return null;
    if (eligiblePreferredStarts.length === 0) return null;
    if (eligiblePreferredStarts.includes(preferredStartTime)) return preferredStartTime;
    return snapPreferredStartToEligible(preferredStartTime, eligiblePreferredStarts);
  }, [preferredStartTime, scheduleDateKey, eligiblePreferredStarts]);

  const scheduleDateParamForSlots = useMemo(() => {
    if (!scheduleDateKey) return undefined;
    if (resolvedPreferredStartForFetch) return `${scheduleDateKey}T${resolvedPreferredStartForFetch}`;
    return scheduleDateKey;
  }, [scheduleDateKey, resolvedPreferredStartForFetch]);

  useEffect(() => {
    if (!state || !scheduleSettingsQuery.data) return;
    const dates = filteredScheduleDates.map((x) => x.date);
    if (dates.length === 0) return;
    if (!state.date || !dates.includes(state.date)) {
      pushState({ ...state, date: dates[0] });
    }
  }, [scheduleSettingsQuery.data, filteredScheduleDates, state, pushState]);

  const scheduleQuery = useQuery({
    queryKey: ["bond", "schedule", env.ok ? env.orgId : 0, scheduleContext, scheduleDateParamForSlots],
    queryFn: () => {
      if (!env.ok || !scheduleContext || !scheduleDateParamForSlots) throw new Error("Missing schedule query");
      return fetchBookingScheduleRecovering(env.orgId, { ...scheduleContext, date: scheduleDateParamForSlots });
    },
    enabled: env.ok && !!scheduleContext && !!scheduleDateParamForSlots,
  });

  const packageAddons = useMemo(() => {
    if (!productsQuery.data?.data || state?.productId == null) return [];
    const sp = productsQuery.data.data.find((p) => p.id === state.productId);
    return sp ? bookingOptionalAddons(sp) : [];
  }, [productsQuery.data, state]);

  const pickedSlotsOrdered = useMemo(() => {
    const arr = [...selectedSlots.values()];
    arr.sort((a, b) => {
      const da = a.startDate.localeCompare(b.startDate);
      if (da !== 0) return da;
      return a.startTime.localeCompare(b.startTime);
    });
    return arr;
  }, [selectedSlots]);

  /* Prune per-slot add-on targets when slot selection shrinks (no external subscription). */
  useEffect(() => {
    const slotKeys = new Set(selectedSlots.keys());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived cleanup from selectedSlots; avoids duplicating slot map logic in every toggle path
    setAddonSlotTargeting((prev) => {
      const next: AddonSlotTargeting = {};
      for (const [ks, v] of Object.entries(prev)) {
        const id = Number(ks);
        if (v.all) {
          if (slotKeys.size > 0) next[id] = v;
        } else {
          const nk = v.keys.filter((k) => slotKeys.has(k));
          if (nk.length > 0) next[id] = { all: false, keys: nk };
        }
      }
      return next;
    });
  }, [selectedSlots]);

  useEffect(() => {
    const slotKeys = new Set(selectedSlots.keys());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drop slot/hour add-ons with no remaining targeted slots
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      for (const id of [...prev]) {
        const addon = packageAddons.find((a) => a.id === id);
        if (!addon || addon.level === "reservation") continue;
        const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[id], slotKeys);
        if (eff.size === 0) next.delete(id);
      }
      return next;
    });
  }, [selectedSlots, packageAddons, addonSlotTargeting]);

  const handleAddonToggle = useCallback((addon: PackageAddonLine) => {
    setSelectedAddonIds((prev) => {
      if (prev.has(addon.id)) {
        setAddonSlotTargeting((t) => {
          const u = { ...t };
          delete u[addon.id];
          return u;
        });
        const n = new Set(prev);
        n.delete(addon.id);
        return n;
      }
      const n = new Set(prev);
      n.add(addon.id);
      if (addon.level === "slot" || addon.level === "hour") {
        setAddonSlotTargeting((t) => ({ ...t, [addon.id]: { all: true, keys: [] } }));
      }
      return n;
    });
  }, []);

  const onAddonSelectAllSlots = useCallback((addonId: number, checked: boolean, keys: string[]) => {
    setAddonSlotTargeting((t) => ({
      ...t,
      [addonId]: checked ? { all: true, keys: [] } : { all: false, keys: [...keys] },
    }));
  }, []);

  const onToggleAddonSlot = useCallback((addonId: number, slotKey: string, allKeys: string[]) => {
    setAddonSlotTargeting((t) => {
      const cur = t[addonId] ?? { all: true, keys: [] };
      const slotKeySet = new Set(allKeys);
      const eff = getEffectiveAddonSlotKeys(cur, slotKeySet);
      if (eff.has(slotKey)) eff.delete(slotKey);
      else eff.add(slotKey);
      const all = eff.size === allKeys.length && allKeys.length > 0;
      return {
        ...t,
        [addonId]: all ? { all: true, keys: [] } : { all: false, keys: [...eff] },
      };
    });
  }, []);

  const slotsRefetching =
    scheduleQuery.isFetching && !scheduleQuery.isPending && scheduleQuery.data != null;

  if (!env.ok) {
    return (
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Configuration</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_BOND_ORG_ID</code> and{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NEXT_PUBLIC_BOND_PORTAL_ID</code> in{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.local</code>, or open with{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">?orgId=…&amp;portalId=…</code> in the URL.
          Optional theme:{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            &amp;primary=%230d4774&amp;accent=%23f7b500&amp;success=%2324c875
          </code>
          .
        </p>
      </main>
    );
  }

  if (portalQuery.isPending) {
    const pendingMainClass = hydrated
      ? "consumer-booking consumer-booking--light mx-auto w-full max-w-none flex-1 px-4 py-20 sm:px-6"
      : "mx-auto w-full max-w-none flex-1 px-4 py-20 sm:px-6";
    return (
      <main
        className={pendingMainClass}
        style={hydrated ? resolveBookingThemeStyle(undefined, env.devTheme) : undefined}
        aria-busy="true"
        aria-live="polite"
      >
        <BookingDelayedFunLoader
          active
          line={BOOKING_LOADING_TAGLINE}
          subline={pickSportsFact(`portal-${env.orgId}-${env.portalId}`)}
          showFunCopy={hydrated}
          className="flex justify-center"
        />
      </main>
    );
  }

  if (portalQuery.isError) {
    const err = portalQuery.error;
    const detail =
      err instanceof BondBffError
        ? `${formatBondUserMessage(err)} (HTTP ${err.status})`
        : err instanceof Error
          ? err.message
          : "Unknown error";
    return (
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-xl font-semibold text-red-700 dark:text-red-400">Could not load portal</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{detail}</p>
        <p className="mt-4 text-sm text-zinc-500">
          Confirm <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">BOND_API_KEY</code> and IDs in{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.local</code>.
        </p>
      </main>
    );
  }

  if (!portal || !state) return null;

  const category = portal.options.categories.find((c) => c.id === state.categoryId) ?? portal.options.defaultCategory;
  const durations =
    categoryRules?.durationOptionsMinutes?.length && categoryRules.durationOptionsMinutes.length > 0
      ? categoryRules.durationOptionsMinutes
      : [60];
  /** Bond returns `times` per day from schedule/settings — first day is often truncated (minimum notice). */
  const preferredStartOptions = state.date
    ? getTimesForScheduleDate(filteredScheduleDates, state.date)
    : [];
  /** Portal can disable explicitly; otherwise show when API lists start options for the selected day. */
  const showPreferredStart =
    portal.options.enableStartTimeSelection !== false && preferredStartOptions.length > 0;
  const selectedProduct = productsQuery.data?.data.find((p) => p.id === state.productId);
  const membershipGated = productMembershipGated(selectedProduct);
  const slotPriceCurrency = selectedProduct?.prices[0]?.currency ?? null;
  const ADDONS_PAGE = 10;
  const packageAddonsVisible = addonsExpanded ? packageAddons : packageAddons.slice(0, ADDONS_PAGE);
  const showAddonPanel =
    state.productId != null && packageAddons.length > 0 && selectedSlots.size > 0;
  const anyVariableProductPricing = Boolean(
    productsQuery.data?.data.some((p) => productHasVariableSchedulePricing(p))
  );

  const setFacility = (facilityId: number) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushState({ ...state, facilityId, productId: null, productPage: 1 });
  };
  const setCategory = (categoryId: number) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushState({ ...state, categoryId, productId: null, productPage: 1 });
  };
  const setActivity = (activity: string) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushState({ ...state, activity, productId: null, productPage: 1 });
  };
  const setProduct = (productId: number) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushState({ ...state, productId });
  };
  const portalViews = clientScheduleViews(portal.options.views);
  const setScheduleView = (view: OnlineBookingView) => {
    clearSlotSelection();
    if (view === "calendar" || view === "matrix") pushState({ ...state, view });
  };
  const setDate = (date: string) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushState({ ...state, date });
  };
  const setDuration = (duration: number) => {
    clearSlotSelection();
    pushState({ ...state, duration });
  };

  const meta = productsQuery.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.totalItems / meta.itemsPerPage)) : 1;
  const productListTotal = productsQuery.data?.meta?.totalItems;

  const facilityName =
    portal.options.facilities.find((f) => f.id === state.facilityId)?.name ?? "Facility";
  const categoryName = category.name ?? "Category";

  return (
    <main
      className={`consumer-booking mx-auto min-h-screen w-full max-w-none flex-1 px-4 pb-32 sm:px-6 lg:px-12 xl:px-16 ${appearanceClass}`}
      style={themeStyle}
    >
      <header className="cb-header-sticky cb-header-fullbleed flex h-16 shrink-0 items-center justify-center border-t-4 border-t-[var(--cb-primary)] bg-[var(--cb-bg-header)]">
        <h1 className="text-lg font-semibold text-[var(--cb-primary)] sm:text-xl">Book Your Session</h1>
        <p className="sr-only">{portal.name}</p>
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:right-4">
          <button
            type="button"
            className="cb-appearance-cycle"
            onClick={cycleAppearance}
            aria-label={`Theme: ${appearanceMode === "system" ? "auto" : appearanceMode}. Click to change.`}
            title={`Appearance: ${appearanceMode}`}
          >
            {appearanceMode === "light" ? "☀" : appearanceMode === "dark" ? "☾" : "A"}
          </button>
          {bondAuth.session.status === "authenticated" ? (
            <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-1">
              <span
                className="hidden max-w-[120px] truncate text-[0.65rem] text-[var(--cb-text-muted)] sm:inline"
                title={bondAuth.session.email}
              >
                {bondAuth.session.email ?? "Signed in"}
              </span>
              <button
                type="button"
                className="cb-header-signin"
                onClick={() => void bondAuth.logout()}
                aria-label="Sign out"
              >
                <span className="px-1 text-xs font-semibold">Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="cb-header-signin"
              onClick={() => bondAuth.setLoginOpen(true)}
              aria-label="Sign in"
            >
              <IconUserCircle />
            </button>
          )}
        </div>
      </header>

      <div className="cb-booking-nav-band -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="cb-breadcrumb-bar cb-breadcrumb-bar--fit" aria-label="Booking context">
          <button type="button" className="cb-breadcrumb-trigger" onClick={() => setPicker("facility")}>
            <IconPin className="size-3.5 shrink-0 text-[var(--cb-primary)]" />
            <span className="truncate">{facilityName}</span>
            <span className="cb-faint text-[0.65rem]" aria-hidden>
              ▾
            </span>
          </button>
          <span className="cb-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <button type="button" className="cb-breadcrumb-trigger" onClick={() => setPicker("category")}>
            <IconCalendar className="size-3.5 shrink-0 text-[var(--cb-text-muted)]" />
            <span className="truncate">{categoryName}</span>
            <span className="cb-faint text-[0.65rem]" aria-hidden>
              ▾
            </span>
          </button>
          <span className="cb-breadcrumb-sep" aria-hidden>
            ›
          </span>
          <button
            type="button"
            className="cb-breadcrumb-trigger cb-breadcrumb-trigger--current"
            onClick={() => setPicker("activity")}
          >
            <span className="shrink-0 text-base leading-none" aria-hidden>
              {activityEmoji(state.activity)}
            </span>
            <span className="truncate capitalize">{formatActivityLabel(state.activity)}</span>
            <span className="cb-faint text-[0.65rem]" aria-hidden>
              ▾
            </span>
          </button>
        </div>
      </div>
      <p className="sr-only">
        {facilityName}, {categoryName}, {state.activity}
      </p>

      <div className="mt-6 flex flex-col gap-12">
        <div className="flex flex-col gap-3">
        <section aria-labelledby="products-heading" className="text-left">
          <h2 id="products-heading" className="cb-section-title">
            Select a service
            {productListTotal != null && productListTotal > 0 ? (
              <span className="cb-section-title-count"> ({productListTotal})</span>
            ) : null}
          </h2>
          {productsQuery.isPending ? (
            <BookingDelayedFunLoader
              active
              line={BOOKING_LOADING_TAGLINE}
              subline={pickSportsFact(`products-${state.activity}-${state.productPage}`)}
              showFunCopy={hydrated}
              className="mt-4"
            />
          ) : null}
          {productsQuery.isError && (
            <p className="cb-alert cb-alert--error mt-2 text-sm">
              {productsQuery.error instanceof BondBffError
                ? formatBondUserMessage(productsQuery.error)
                : productsQuery.error instanceof Error
                  ? productsQuery.error.message
                  : "Failed to load products"}
            </p>
          )}
          {productsQuery.data && productsQuery.data.data.length === 0 && (
            <p className="cb-muted mt-2 text-sm">No products for this filter.</p>
          )}
          <div className="cb-services-rail cb-hide-scrollbar mt-4">
            {productsQuery.data?.data.map((p) => {
              const selected = state.productId === p.id;
              const heroCacheKey = `${p.id}__${state.activity}`;
              const heroFailStep = Math.min(2, heroLoadFailed[heroCacheKey] ?? 0) as ProductCardImageFallbackStep;
              const ent = p.entitlementDiscounts;
              const hasMemberBenefit = Array.isArray(ent) && ent.length > 0;
              const durBadge = formatDurationPriceBadge(state.duration ?? 60);
              const memberFreeChip = productCatalogShowsMemberFree(p);
              const catalogMin = productCatalogMinUnitPrice(p);
              return (
                <div
                  key={p.id}
                  className={`cb-product-card ${selected ? "cb-product-card--selected" : ""}`}
                >
                  <button
                    type="button"
                    className="cb-product-card-main"
                    onClick={() => setProduct(p.id)}
                    aria-current={selected ? "true" : undefined}
                  >
                    <div className="cb-product-card-media">
                      {/* eslint-disable-next-line @next/next/no-img-element -- remote Unsplash / org URLs; optimize when CDN is fixed */}
                      <img
                        src={resolveProductCardImageAtStep(p, state.activity, heroFailStep)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setHeroLoadFailed((prev) => {
                            const cur = Math.min(2, prev[heroCacheKey] ?? 0);
                            if (cur >= 2) return prev;
                            return { ...prev, [heroCacheKey]: cur + 1 };
                          })
                        }
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
                        aria-hidden
                      />
                      <div
                        className={`cb-product-chip cb-product-chip--price ${memberFreeChip ? "cb-product-chip--member-free" : ""}`}
                      >
                        <span className="cb-product-chip-price-row">
                          {memberFreeChip ? (
                            <span className="cb-product-chip-price-amount">Free for members</span>
                          ) : catalogMin ? (
                            <>
                              <span className="cb-product-chip-price-amount">
                                {formatSlotCurrency(catalogMin.min, catalogMin.currency)}
                              </span>
                              <span className="cb-product-chip-price-sep">/</span>
                              <span className="cb-product-chip-price-dur">{durBadge}</span>
                            </>
                          ) : (
                            <span className="cb-product-chip-price-amount">—</span>
                          )}
                          {productHasVariableSchedulePricing(p) ? (
                            <IconPeakTrend className="cb-product-chip-peak" aria-hidden />
                          ) : null}
                        </span>
                      </div>
                      <div className="cb-product-tag-row">
                        {hasMemberBenefit ? (
                          <span className="cb-product-tag">
                            <IconPercentBadge className="shrink-0 opacity-95" />
                            Member benefits
                          </span>
                        ) : null}
                        {p.isPunchPass ? (
                          <span className="cb-product-tag">
                            <IconPassTicket className="shrink-0 opacity-95" />
                            Pass
                          </span>
                        ) : null}
                        {productMembershipGated(p) ? (
                          <span className="cb-product-tag">
                            <IconLockDetail className="size-3.5 shrink-0 opacity-95" />
                            Members only
                          </span>
                        ) : null}
                        {bookingOptionalAddons(p).length > 0 ? (
                          <span className="cb-product-tag cb-product-tag--addon">Optional add-ons</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="cb-product-card-footer">
                      <span className="cb-product-card-title">{p.name}</span>
                    </div>
                  </button>
                  <div className="cb-product-corner">
                    <div className="cb-product-corner-fold" aria-hidden />
                    <button
                      type="button"
                      className="cb-product-info-btn"
                      aria-label={`More about ${p.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProductInfoId(p.id);
                      }}
                    >
                      <span className="cb-product-info-glyph">i</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {anyVariableProductPricing ? (
            <p className="cb-peak-legend cb-muted mt-3 text-left text-sm">
              <IconPeakTrend className="cb-peak-legend-icon" aria-hidden />
              Peak / off-peak pricing may apply to some time slots.
            </p>
          ) : null}
          {meta && totalPages > 1 && (
            <div className="cb-muted mt-4 flex items-center justify-between gap-4 text-sm">
              <button
                type="button"
                className="cb-btn-ghost"
                disabled={state.productPage <= 1}
                onClick={() => pushState({ ...state, productPage: state.productPage - 1, productId: null })}
              >
                Previous
              </button>
              <span>
                Page {state.productPage} of {totalPages}
              </span>
              <button
                type="button"
                className="cb-btn-ghost"
                disabled={state.productPage >= totalPages}
                onClick={() => pushState({ ...state, productPage: state.productPage + 1, productId: null })}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {state.productId != null ? (
          <div className="cb-signin-hint" role="note">
            <span className="cb-signin-hint-icon" aria-hidden>
              <IconLogIn className="h-5 w-5 shrink-0 text-[var(--cb-primary)]" />
            </span>
            <p className="cb-signin-hint-text">
              <button
                type="button"
                className="cb-signin-hint-cta"
                onClick={() => bondAuth.setLoginOpen(true)}
              >
                Sign in now
              </button>{" "}
              to see membership benefits, updated pricing, early access and more!
            </p>
          </div>
        ) : null}
        </div>

        {state.productId != null && (
          <div className="cb-schedule-when-band -mx-4 px-4 py-5 sm:mx-0 sm:rounded-xl sm:px-5">
            <section className="text-left" aria-label="Date, duration, and preferred start time">
              <h3 id="pick-date-heading" className="cb-schedule-step-title cb-schedule-step-title--first">
                Select a date
              </h3>
              {filteredScheduleDates.length > 0 ? (
                <div className="cb-date-strip-row mt-3">
                  <div className="cb-date-strip-cluster">
                    <button
                      type="button"
                      className="cb-cal-open-btn"
                      aria-label="Open calendar to pick an available date"
                      onClick={() => setPicker("date")}
                    >
                      <IconCalendar className="size-7 shrink-0" />
                    </button>
                    <div
                      className="cb-date-strip cb-hide-scrollbar"
                      role="tablist"
                      aria-labelledby="pick-date-heading"
                    >
                      {filteredScheduleDates.map((d) => (
                        <button
                          key={d.date}
                          type="button"
                          role="tab"
                          aria-selected={state.date === d.date}
                          className={`cb-date-chip ${state.date === d.date ? "cb-date-chip--active" : ""}`}
                          onClick={() => setDate(d.date)}
                        >
                          {formatBookingDateShort(d.date)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <h3 id="pick-duration-heading" className="cb-schedule-step-title">
                Select duration
              </h3>
              <div className="cb-duration-strip-row mt-3">
                <div
                  className="cb-date-strip cb-hide-scrollbar"
                  role="tablist"
                  aria-labelledby="pick-duration-heading"
                >
                  {durations.map((m) => {
                    const active = (state.duration ?? durations[0] ?? 60) === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={`cb-date-chip cb-duration-chip ${active ? "cb-date-chip--active" : ""}`}
                        onClick={() => setDuration(m)}
                      >
                        {formatDurationLabel(m)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {showPreferredStart ? (
                <>
                  <h3 id="pick-start-heading" className="cb-schedule-step-title">
                    Preferred start time{" "}
                    <span className="cb-schedule-step-optional">(optional)</span>
                  </h3>
                  <button
                    type="button"
                    className="cb-preferred-start-field mt-3 w-full max-w-full self-start sm:w-auto sm:max-w-md"
                    aria-haspopup="dialog"
                    aria-expanded={picker === "start"}
                    aria-labelledby="pick-start-heading"
                    onClick={() => setPicker("start")}
                  >
                    <IconClockDetail className="cb-preferred-start-field-icon h-5 w-5 shrink-0 text-[var(--cb-primary)]" />
                    <span className="cb-preferred-start-field-value min-w-0 flex-1 truncate text-left">
                      {preferredStartTime == null
                        ? "Any time"
                        : formatPreferredStartOptionLabel(preferredStartTime)}
                    </span>
                    <span className="cb-faint shrink-0 text-[0.65rem]" aria-hidden>
                      ▾
                    </span>
                  </button>
                </>
              ) : null}
            </section>
          </div>
        )}

        {state.productId != null && portalViews.length > 1 && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="cb-eyebrow">View</span>
            <div className="cb-segment" role="group" aria-label="Schedule layout">
              {portalViews.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setScheduleView(v)}
                  aria-pressed={state.view === v}
                >
                  {viewUiLabel(v)}
                </button>
              ))}
            </div>
          </div>
        )}

        <section aria-labelledby="schedule-heading" className="text-left">
          <div className="cb-schedule-heading-row">
            <h2 id="schedule-heading" className="cb-section-title cb-section-title--inline">
              Available times
            </h2>
          </div>
          {slotBarError && state.productId != null ? (
            <p className="cb-slot-limit-alert" role="alert">
              {slotBarError}
            </p>
          ) : null}
          {scheduleSettingsQuery.isPending && !scheduleQuery.isPending ? (
            <BookingDelayedFunLoader
              active
              line={BOOKING_SCHEDULE_SETTINGS_TAGLINE}
              showFunCopy={hydrated}
              className="mt-3"
            />
          ) : null}
          {scheduleSettingsQuery.isError && scheduleSettingsQuery.error instanceof Error && (
            <ScheduleRequestError error={scheduleSettingsQuery.error} />
          )}

          {scheduleQuery.isPending ? (
            <BookingDelayedFunLoader
              active
              line={BOOKING_SLOTS_TAGLINE}
              subline={pickSportsFact(`slots-${state.date}-${state.productId}`)}
              showFunCopy={hydrated}
              delayMs={0}
              className="mt-3"
            />
          ) : null}
          {scheduleQuery.isError && scheduleQuery.error instanceof Error && (
            <ScheduleRequestError error={scheduleQuery.error} />
          )}

          {slotsRefetching ? (
            <p className="cb-slots-refetch-status" role="status">
              <span className="cb-slots-refetch-spinner" aria-hidden />
              <span>{BOOKING_SLOTS_TAGLINE}</span>
            </p>
          ) : null}

          {scheduleQuery.data && state.view === "matrix" && (
            <div className="cb-hide-scrollbar mt-4 overflow-x-auto rounded-xl border border-[var(--cb-border)] bg-[var(--cb-bg-surface)] shadow-[var(--cb-shadow-card)]">
              <ScheduleMatrix
                schedule={scheduleQuery.data}
                product={selectedProduct}
                durationMinutes={state.duration ?? durations[0] ?? 60}
                priceCurrency={slotPriceCurrency}
                membershipGated={membershipGated}
                selectedKeys={selectedKeysSet}
                onToggleSlot={toggleSlot}
              />
            </div>
          )}

          {scheduleQuery.data && state.view === "calendar" && (
            <div className="mt-6">
              <ScheduleCalendarView
                schedule={scheduleQuery.data}
                product={selectedProduct}
                durationMinutes={state.duration ?? durations[0] ?? 60}
                priceCurrency={slotPriceCurrency}
                selectedKeys={selectedKeysSet}
                onToggleSlot={toggleSlot}
              />
            </div>
          )}

          {showAddonPanel ? (
            <BookingAddonPanel
              visibleAddons={packageAddonsVisible}
              hasMoreAddons={packageAddons.length > ADDONS_PAGE}
              addonsExpanded={addonsExpanded}
              onToggleExpand={() => setAddonsExpanded((x) => !x)}
              moreCount={packageAddons.length - ADDONS_PAGE}
              selectedAddonIds={selectedAddonIds}
              onToggleAddon={handleAddonToggle}
              addonSlotTargeting={addonSlotTargeting}
              onAddonSelectAllSlots={onAddonSelectAllSlots}
              onToggleAddonSlot={onToggleAddonSlot}
              pickedSlots={pickedSlotsOrdered}
              formatPrice={formatPrice}
            />
          ) : null}
        </section>
      </div>

      {portal && state && (
        <>
          <ModalShell
            open={picker === "facility"}
            title="Select facility"
            titleIcon={<IconPin className="h-6 w-6" />}
            onClose={() => setPicker(null)}
          >
            <FacilityPickerBody
              facilities={portal.options.facilities}
              selectedId={state.facilityId}
              onSelect={setFacility}
              onClose={() => setPicker(null)}
            />
          </ModalShell>
          <ModalShell
            open={picker === "category"}
            title="What would you like to book?"
            titleIcon={<IconCalendar className="h-6 w-6" />}
            onClose={() => setPicker(null)}
          >
            <CategoryPickerBody
              categories={portal.options.categories}
              selectedId={state.categoryId}
              onSelect={setCategory}
              onClose={() => setPicker(null)}
            />
          </ModalShell>
          <ModalShell open={picker === "activity"} title="Select Sport" onClose={() => setPicker(null)}>
            <ActivityPickerBody
              activities={portal.options.activities}
              selected={state.activity}
              onSelect={setActivity}
              onClose={() => setPicker(null)}
            />
          </ModalShell>
          <ModalShell
            open={picker === "date"}
            title="Select date"
            hideTitle
            ariaLabel="Choose an available date"
            panelClassName="cb-modal-panel--datepicker"
            closeLayout="datepicker"
            onClose={() => setPicker(null)}
          >
            <AvailableDateCalendarBody
              availableDates={filteredScheduleDates.map((d) => d.date)}
              vipEarlyAccessDates={vipEarlyAccessDates}
              selectedDate={state.date}
              onSelect={(v) => setDate(v)}
              onClose={() => setPicker(null)}
            />
          </ModalShell>
          <ModalShell open={picker === "start"} title="Preferred start time" onClose={() => setPicker(null)}>
            <ListPickerBody
              items={[
                { value: START_TIME_AUTO, label: "Any time" },
                ...eligiblePreferredStarts.map((t) => ({
                  value: t,
                  label: formatPreferredStartOptionLabel(t),
                })),
              ]}
              selected={preferredStartTime ?? START_TIME_AUTO}
              onSelect={(v) => {
                clearSlotSelection();
                if (v === START_TIME_AUTO) {
                  setPreferredStartTime(null);
                  return;
                }
                const snapped = snapPreferredStartToEligible(v, eligiblePreferredStarts);
                setPreferredStartTime(snapped);
              }}
              onClose={() => setPicker(null)}
            />
          </ModalShell>
        </>
      )}

      {state.productId != null ? (
        <BookingSelectionPortal
          slotCount={selectedSlots.size}
          error={slotBarError}
          onClear={clearSlotSelection}
          themeStyle={themeStyle}
        />
      ) : null}

      <LoginModal />

      <ProductDetailModal
        open={productInfoId != null}
        product={productsQuery.data?.data.find((p) => p.id === productInfoId) ?? null}
        activity={state.activity}
        facilityName={facilityName}
        durationMinutes={state.duration ?? durations[0] ?? 60}
        membershipGated={productMembershipGated(productsQuery.data?.data.find((p) => p.id === productInfoId))}
        scheduleResources={detailModalScheduleSettingsQuery.data?.resources}
        scheduleResourcesLoading={detailModalScheduleSettingsQuery.isPending}
        onClose={() => setProductInfoId(null)}
      />

    </main>
  );
}
