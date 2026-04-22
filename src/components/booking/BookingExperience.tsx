"use client";

import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { formatBondUserMessage } from "@/lib/bond-errors";
import { buildBookingDisplayLinesForCart } from "@/lib/session-booking-display-lines";
import { categoryRequiresApproval } from "@/lib/category-approval";
import {
  computeVipEarlyAccessDateKeys,
  filterDatesByAdvanceWindow,
  formatDurationLabel,
  formatDurationPriceBadge,
  parseCategoryBookingRules,
  resolveEffectiveAdvanceBookingWindowDays,
  resolveEffectiveMinimumBookingNoticeMinutes,
} from "@/lib/category-booking-settings";
import { formatActivityLabel } from "@/lib/booking-activity-display";
import { pickSportsFact } from "@/lib/booking-loading-copy";
import {
  cashUnitPriceForBondFallback,
  formatSlotCurrency,
  productCatalogMinUnitPrice,
  productCatalogShowsMemberFree,
  productHasVariableSchedulePricing,
  productMembershipGated,
} from "@/lib/booking-pricing";
import { applyEntitlementDiscountsToUnitPrice } from "@/lib/entitlement-discount";
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
import {
  fetchCurrentBondUser,
  fetchUserBookingInformation,
  fetchUserRequiredProducts,
} from "@/lib/online-booking-user-api";
import { bookedSlicesFromUserBookingInformation } from "@/lib/booking-information-slices";
import {
  membershipRequiredForProductFromResponse,
  userNeedsMembershipFromRequiredResponse,
} from "@/lib/required-products-eligibility";
import { bookingPartyMembersFromProfile } from "@/lib/booking-party-options";
import { BondBffError } from "@/lib/bond-json";
import type { OnlineBookingView, OrganizationCartDto, ScheduleTimeSlotDto } from "@/types/online-booking";
import type { PackageAddonLine } from "@/lib/product-package-addons";
import { CB_BOOKING_APPEARANCE_EVENT, CB_BOOKING_APPEARANCE_KEY } from "@/lib/booking-appearance";
import { bookingAppearanceClass, resolveBookingThemeStyle, type BookingThemeUrlOverrides } from "@/lib/booking-theme";
import { clientScheduleViews } from "@/lib/booking-views";
import { resolveProductCardImageAtStep, type ProductCardImageFallbackStep } from "@/lib/product-card-image";
import { bookingOptionalAddons } from "@/lib/product-package-addons";
import { parseProductFormIds } from "@/lib/product-form-ids";
import { countSessionCartLineItems } from "@/lib/cart-purchase-lines";
import {
  allBondFlatLineIndices,
  bondRemovableCartItemIdsForIndices,
  bondRootCartItemIdForRemoval,
} from "@/lib/bond-cart-removal";
import {
  closeCart,
  closeOrganizationCartsBestEffort,
  getOrganizationCart,
  removeCartItemWithIllegalPriceFallback,
  removeCartItemsSequentiallyWithFallback,
} from "@/lib/bond-cart-api";
import { flattenBondCartItemNodes } from "@/lib/checkout-bag-totals";
import { flatLineIndexSegmentsForMergedBookings } from "@/lib/session-cart-grouping";
import {
  coerceCartFromApi,
  loadSessionCartSnapshots,
  positiveBondCartId,
  saveSessionCartSnapshots,
  type SessionCartSnapshot,
  type SessionReservationGroup,
} from "@/lib/session-cart-snapshot";
import {
  pickedSlotConflictsWithBookedSlices,
  slotControlKey,
  validateSlotSelection,
  type PickedSlot,
} from "@/lib/slot-selection";
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
import { ScheduleMatrix } from "./ScheduleMatrix";
import { getEffectiveAddonSlotKeys } from "@/lib/addon-slot-targeting";
import { BookingAddonPanel, type AddonSlotTargeting } from "./BookingAddonPanel";
import { ProductDetailModal } from "./ProductDetailModal";
import { ModalShell } from "./ModalShell";
import { readBookingDevOverrides } from "./booking-url";
import { useBookingUrlState } from "./hooks/useBookingUrlState";
import { useBondAuth } from "@/components/auth/BondAuthContext";
import { BookingForDrawer } from "@/components/auth/BookingForDrawer";
import { LoginModal } from "@/components/auth/LoginModal";
import { BookingCheckoutDrawer, type CheckoutStep } from "./BookingCheckoutDrawer";
import { WelcomeToast } from "@/components/ui/WelcomeToast";

const PRODUCTS_PAGE_SIZE = 30;

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

function bookingHeaderInitials(label: string, email?: string | null): string {
  const t = label.trim();
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  if (parts.length === 1 && parts[0]!.length >= 2) return parts[0]!.slice(0, 2).toUpperCase();
  if (email && email.includes("@")) return email.slice(0, 2).toUpperCase();
  return "?";
}

function formatBookingDateShort(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ScheduleRequestError({ error }: { error: Error }) {
  const t = useTranslations("errors");
  if (error instanceof BondBffError) {
    return (
      <div role="alert" className="cb-alert">
        <p>{formatBondUserMessage(error, t)}</p>
      </div>
    );
  }
  return (
    <p className="cb-alert cb-alert--error" role="alert">
      {error.message}
    </p>
  );
}

export function BookingExperience() {
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const env = useBondEnv(searchParams.toString());
  /** Stable org id for hooks that need `env.orgId` without a complex dependency expression. */
  const resolvedBondOrgId = env.ok ? env.orgId : null;
  const bondAuth = useBondAuth();
  const tb = useTranslations("booking");
  const te = useTranslations("errors");
  const tc = useTranslations("common");
  const sportsFacts = useMemo(() => {
    const raw = tb.raw("sportsFacts");
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [tb]);
  const bondUserId =
    bondAuth.session.status === "authenticated" && bondAuth.session.bondUserId != null
      ? bondAuth.session.bondUserId
      : undefined;

  const bondProfileQuery = useQuery({
    queryKey: ["bond", "userProfile", env.ok ? env.orgId : 0, "expand:family+address"],
    queryFn: () => {
      if (!env.ok) throw new Error("Bond env not configured");
      return fetchCurrentBondUser(env.orgId, ["family", "address"]);
    },
    enabled: env.ok && bondAuth.session.status === "authenticated",
  });

  const profileRootUserId = useMemo(() => {
    const d = bondProfileQuery.data;
    if (!d || typeof d !== "object") return undefined;
    const id = (d as Record<string, unknown>).id;
    return typeof id === "number" && Number.isFinite(id) ? id : undefined;
  }, [bondProfileQuery.data]);

  /** Session JWT may omit `custom:userId`; `GET …/user` always returns numeric `id`. */
  const bondUserIdResolved = bondUserId ?? profileRootUserId;
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
      const v = localStorage.getItem(CB_BOOKING_APPEARANCE_KEY);
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

  const [bookingTargetUserId, setBookingTargetUserId] = useState<number | null>(null);
  const [bookingForModalOpen, setBookingForModalOpen] = useState(false);

  const partyMembers = useMemo(
    () => bookingPartyMembersFromProfile(bondProfileQuery.data),
    [bondProfileQuery.data]
  );

  const effectiveBookingUserId = bookingTargetUserId ?? bondUserIdResolved ?? undefined;

  const bookingForMember = useMemo(
    () =>
      effectiveBookingUserId != null ? partyMembers.find((m) => m.id === effectiveBookingUserId) : undefined,
    [partyMembers, effectiveBookingUserId]
  );
  const bookingForLabel = bookingForMember?.label ?? tb("you");
  const bookingForBadge = bookingForMember?.badgeLabel;

  useEffect(() => {
    if (bondUserIdResolved == null) {
      setBookingTargetUserId(null);
      return;
    }
    if (bookingTargetUserId === null) {
      setBookingTargetUserId(bondUserIdResolved);
    }
  }, [bondUserIdResolved, bookingTargetUserId]);

  const [welcomeToastOpen, setWelcomeToastOpen] = useState(false);
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
  /** `checkout` = build booking; `bag` = view session carts from cart FAB. */
  const [checkoutDrawerMode, setCheckoutDrawerMode] = useState<"checkout" | "bag">("checkout");
  /** Show “Go to cart” on sync only after Back from payment — not while adding a new booking with items already in the tab cart. */
  const [syncStepGoToCartEnabled, setSyncStepGoToCartEnabled] = useState(false);
  /** One-shot step when switching from bag → checkout (e.g. open at payment). Cleared by the drawer. */
  const [navigateToCheckoutStep, setNavigateToCheckoutStep] = useState<CheckoutStep | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  /** Stable — inline functions here retrigger BookingCheckoutDrawer’s open effect and reset step to addons. */
  const clearNavigateToCheckoutStep = useCallback(() => {
    setNavigateToCheckoutStep(null);
  }, []);
  /** After a successful add, go straight to payment in the same drawer (bag remains available from the cart FAB). */
  const onCheckoutAddedToCart = useCallback(() => {
    setCheckoutBusy(false);
    setCheckoutDrawerMode("checkout");
    setNavigateToCheckoutStep("payment");
  }, []);

  const pruneSatisfiedAddonProductIds = useCallback((ids: number[]) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of ids) {
        if (next.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);
  /** Checkout drawer locks “booking for” after the addons step so switching users doesn’t invalidate membership/forms. */
  const [lockBookingForParticipant, setLockBookingForParticipant] = useState(false);
  /** Successful `POST .../online-booking/create` carts (persisted in sessionStorage for this tab). */
  const [sessionCartRows, setSessionCartRows] = useState<SessionCartSnapshot[]>([]);
  const sessionCartRowsRef = useRef<SessionCartSnapshot[]>([]);
  sessionCartRowsRef.current = sessionCartRows;
  /**
   * First persist effect run happens in the same commit as the rehydrate effect, while state can still be the
   * initial `[]`, so it would overwrite sessionStorage with an empty cart. Skip that write; persist after load.
   */
  const skipNextSessionCartPersistRef = useRef(true);
  const cartLineItemCount = useMemo(() => countSessionCartLineItems(sessionCartRows), [sessionCartRows]);

  /** Append the next reservation to the same Bond cart when the session already has a priced cart. */
  /** First successful cart id in this tab — stable merge target so later adds don’t follow the wrong Bond cart. */
  const mergeCartId = useMemo(() => {
    for (let i = 0; i < sessionCartRows.length; i++) {
      const id = sessionCartRows[i]?.cart?.id;
      if (typeof id === "number" && Number.isFinite(id) && id > 0) return id;
    }
    return undefined;
  }, [sessionCartRows]);

  /**
   * Slots from completed checkouts in this tab (cart cleared before schedule refetch reflects the booking).
   * Merged with `sessionCartRows` so the grid stays non-selectable immediately after “Done”.
   */
  const [vendedSlotKeys, setVendedSlotKeys] = useState<string[]>([]);

  /** Slot keys already added to the tab cart — block re-selection and show “in cart” on the grid. */
  const reservedSlotKeysInCart = useMemo(() => {
    const s = new Set<string>();
    for (const k of vendedSlotKeys) {
      if (typeof k === "string" && k.length > 0) s.add(k);
    }
    for (const row of sessionCartRows) {
      for (const k of row.reservedSlotKeys ?? []) {
        if (typeof k === "string" && k.length > 0) s.add(k);
      }
    }
    return s;
  }, [sessionCartRows, vendedSlotKeys]);

  const welcomeTickPrev = useRef(0);
  const [pendingWelcome, setPendingWelcome] = useState(false);

  useEffect(() => {
    if (bondAuth.welcomeToastTick > welcomeTickPrev.current) {
      welcomeTickPrev.current = bondAuth.welcomeToastTick;
      setPendingWelcome(true);
    }
  }, [bondAuth.welcomeToastTick]);

  /** Open family drawer as soon as we have a logged-in user after login (before profile finishes). */
  useEffect(() => {
    if (!pendingWelcome || bondUserIdResolved == null) return;
    setBookingForModalOpen(true);
  }, [pendingWelcome, bondUserIdResolved]);

  useEffect(() => {
    if (!pendingWelcome) return;
    if (!bondProfileQuery.isSuccess || bondUserIdResolved == null) return;
    setPendingWelcome(false);
    setWelcomeToastOpen(true);
    if (partyMembers.length <= 1) {
      setBookingForModalOpen(false);
    }
  }, [pendingWelcome, bondProfileQuery.isSuccess, bondUserIdResolved, partyMembers.length]);

  const welcomeToastTitle = useMemo(() => {
    const first = typeof bondProfileQuery.data?.firstName === "string" ? bondProfileQuery.data.firstName : "";
    const last = typeof bondProfileQuery.data?.lastName === "string" ? bondProfileQuery.data.lastName : "";
    const name = [first, last].filter(Boolean).join(" ");
    if (name.length > 0) return tb("welcomeBackName", { name });
    if (bondAuth.session.status === "authenticated" && bondAuth.session.email) {
      return tb("welcomeBackEmailUser", { name: bondAuth.session.email.split("@")[0] ?? "" });
    }
    return tb("welcomeBack");
  }, [bondProfileQuery.data, bondAuth.session, tb]);

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
        localStorage.setItem(CB_BOOKING_APPEARANCE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
    /** Defer so listeners (e.g. LoginModal useBookingAppearanceClass) don’t setState during this update. */
    queueMicrotask(() => {
      try {
        window.dispatchEvent(new CustomEvent(CB_BOOKING_APPEARANCE_EVENT));
      } catch {
        /* ignore */
      }
    });
  }, []);

  const { state, pushBookingState } = useBookingUrlState(portal, searchParams, router);

  const productsQuery = useQuery({
    queryKey: [
      "bond",
      "products",
      env.ok ? env.orgId : 0,
      state?.categoryId,
      state?.facilityId,
      state?.activity,
      state?.productPage,
      effectiveBookingUserId ?? 0,
    ],
    queryFn: () => {
      if (!env.ok || !state) throw new Error("Missing org or selection");
      return fetchCategoryProducts(env.orgId, state.categoryId, {
        page: state.productPage,
        itemsPerPage: PRODUCTS_PAGE_SIZE,
        facilitiesIds: [state.facilityId],
        sports: [state.activity],
        ...(effectiveBookingUserId != null ? { userId: effectiveBookingUserId } : {}),
      });
    },
    enabled: env.ok && !!state,
  });

  useEffect(() => {
    if (!state || !productsQuery.data) return;
    const ids = productsQuery.data.data.map((p) => p.id);
    if (ids.length === 0) return;
    if (state.productId == null || !ids.includes(state.productId)) {
      pushBookingState({ ...state, productId: ids[0] });
    }
  }, [productsQuery.data, state, pushBookingState]);

  const categoryRules = useMemo(() => {
    if (!portal || !state) return null;
    const cat = portal.options.categories.find((c) => c.id === state.categoryId) ?? portal.options.defaultCategory;
    return parseCategoryBookingRules(cat.settings);
  }, [portal, state]);

  /** Category `memberships[]` / VIP advance window: wider than guest — applied when logged in (Bond still enforces server-side). */
  const useMemberAdvanceBookingWindow = useMemo(() => {
    if (bondAuth.session.status !== "authenticated" || categoryRules == null) return false;
    const g = categoryRules.advanceBookingWindowDays;
    const m = categoryRules.memberAdvanceBookingWindowDays;
    if (m == null || !Number.isFinite(m) || m < 0) return false;
    if (g == null || !Number.isFinite(g)) return true;
    return m > g;
  }, [bondAuth.session.status, categoryRules]);

  /** Shorter member minimum notice than guest — more same-day / near-term starts when logged in. */
  const useMemberMinimumBookingNotice = useMemo(() => {
    if (bondAuth.session.status !== "authenticated" || categoryRules == null) return false;
    const g = categoryRules.minimumBookingNoticeMinutes;
    const m = categoryRules.memberMinimumBookingNoticeMinutes;
    if (m == null || !Number.isFinite(m) || m < 0) return false;
    if (g == null || !Number.isFinite(g)) return false;
    return m < g;
  }, [bondAuth.session.status, categoryRules]);

  const effectiveAdvanceBookingWindowDays = useMemo(
    () =>
      resolveEffectiveAdvanceBookingWindowDays(
        categoryRules?.advanceBookingWindowDays ?? null,
        categoryRules?.memberAdvanceBookingWindowDays ?? null,
        useMemberAdvanceBookingWindow
      ),
    [categoryRules, useMemberAdvanceBookingWindow]
  );

  const effectiveMinimumBookingNoticeMinutes = useMemo(
    () =>
      resolveEffectiveMinimumBookingNoticeMinutes(
        categoryRules?.minimumBookingNoticeMinutes ?? null,
        categoryRules?.memberMinimumBookingNoticeMinutes ?? null,
        useMemberMinimumBookingNotice
      ),
    [categoryRules, useMemberMinimumBookingNotice]
  );

  const slotRules = useMemo(
    () => ({
      maxSequentialHours: categoryRules?.maxSequentialHours ?? null,
      maxBookingHoursPerDay: categoryRules?.maxBookingHoursPerDay ?? null,
    }),
    [categoryRules]
  );

  const selectedProductForHooks = useMemo(
    () => (state?.productId != null ? productsQuery.data?.data.find((p) => p.id === state.productId) : undefined),
    [productsQuery.data, state?.productId]
  );

  const memberRequiredProductQueries = useQueries({
    queries: partyMembers.map((m) => ({
      queryKey: ["bond", "memberRequiredProducts", env.ok ? env.orgId : 0, state?.productId ?? 0, m.id],
      queryFn: () => {
        if (!env.ok || state?.productId == null) throw new Error("Missing org or product");
        return fetchUserRequiredProducts(env.orgId, state.productId, m.id);
      },
      enabled:
        env.ok &&
        state?.productId != null &&
        bondAuth.session.status === "authenticated" &&
        partyMembers.length > 0,
      staleTime: 60_000,
    })),
  });

  const partyMembersForBookingFor = useMemo(() => {
    if (partyMembers.length === 0) return partyMembers;
    return partyMembers.map((m, i) => {
      const q = memberRequiredProductQueries[i];
      if (!q?.isSuccess || q.data === undefined) {
        return { ...m, needsMembershipForProduct: false, hasQualifyingMembershipForProduct: false };
      }
      const gated = membershipRequiredForProductFromResponse(q.data);
      if (!gated) {
        return { ...m, needsMembershipForProduct: false, hasQualifyingMembershipForProduct: false };
      }
      const needs = userNeedsMembershipFromRequiredResponse(q.data);
      return {
        ...m,
        needsMembershipForProduct: needs,
        hasQualifyingMembershipForProduct: !needs,
      };
    });
  }, [partyMembers, memberRequiredProductQueries]);

  const memberRequiredQueryForSelected = useMemo(() => {
    if (effectiveBookingUserId == null) return null;
    const idx = partyMembers.findIndex((m) => m.id === effectiveBookingUserId);
    if (idx < 0) return null;
    return memberRequiredProductQueries[idx];
  }, [effectiveBookingUserId, partyMembers, memberRequiredProductQueries]);

  const catalogMembershipGated = useMemo(
    () => productMembershipGated(selectedProductForHooks),
    [selectedProductForHooks]
  );

  /** Slot/matrix: member-tier pricing label only while the participant may still need to buy required membership. */
  const effectiveMembershipGated = useMemo(() => {
    if (!catalogMembershipGated) return false;
    if (bondAuth.session.status !== "authenticated") return true;
    if (effectiveBookingUserId == null) return true;
    const q = memberRequiredQueryForSelected;
    if (q == null) return true;
    if (q.isPending) return false;
    if (!q.isSuccess || q.data === undefined) return catalogMembershipGated;
    return userNeedsMembershipFromRequiredResponse(q.data);
  }, [
    catalogMembershipGated,
    bondAuth.session.status,
    effectiveBookingUserId,
    memberRequiredQueryForSelected,
  ]);

  /**
   * Checkout: when the selected participant’s GET …/required says they still owe a membership, we run the membership step.
   * When false (they already satisfy required products), skip forcing membership into the cart.
   */
  const participantNeedsMembershipForCheckout = useMemo(() => {
    if (bondAuth.session.status !== "authenticated") return true;
    if (effectiveBookingUserId == null) return true;
    const q = memberRequiredQueryForSelected;
    if (q == null) return true;
    if (q.isPending) return true;
    if (!q.isSuccess || q.data === undefined) return true;
    return userNeedsMembershipFromRequiredResponse(q.data);
  }, [bondAuth.session.status, effectiveBookingUserId, memberRequiredQueryForSelected]);

  /**
   * Apply catalog `entitlementDiscounts` to schedule **display** prices when the product lists them.
   * Bond `POST …/create` still uses {@link PickedSlot.scheduleUnitPrice} / cash tier via `slotPriceForBondApi`.
   */
  const entitlementAdjust = useMemo(() => {
    if (bondAuth.session.status !== "authenticated") return (u: number) => u;
    const p = selectedProductForHooks;
    if (!p) return (u: number) => u;
    const ent = p.entitlementDiscounts;
    if (!Array.isArray(ent) || ent.length === 0) return (u: number) => u;
    return (u: number) => applyEntitlementDiscountsToUnitPrice(u, ent);
  }, [bondAuth.session.status, selectedProductForHooks]);

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
    const base = {
      facilityId: state.facilityId,
      productId: state.productId,
      duration: state.duration ?? undefined,
      timeIncrements,
    };
    return effectiveBookingUserId != null ? { ...base, userId: effectiveBookingUserId } : base;
  }, [env.ok, state, portal, effectiveBookingUserId]);

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
    const base = {
      facilityId: state.facilityId,
      productId: productInfoId,
      duration: state.duration ?? undefined,
      timeIncrements,
    };
    return effectiveBookingUserId != null ? { ...base, userId: effectiveBookingUserId } : base;
  }, [env.ok, state, portal, productInfoId, effectiveBookingUserId]);

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
    return filterDatesByAdvanceWindow(rows, effectiveAdvanceBookingWindowDays);
  }, [scheduleSettingsQuery.data, effectiveAdvanceBookingWindowDays]);

  const bookingInfoDateRange = useMemo(() => {
    const dates = filteredScheduleDates.map((x) => x.date).sort();
    if (dates.length === 0) return null;
    return { startDate: dates[0]!, endDate: dates[dates.length - 1]! };
  }, [filteredScheduleDates]);

  const bookingInfoQuery = useQuery({
    queryKey: [
      "bond",
      "userBookingInformation",
      env.ok ? env.orgId : 0,
      effectiveBookingUserId ?? 0,
      state?.facilityId,
      state?.categoryId,
      bookingInfoDateRange?.startDate,
      bookingInfoDateRange?.endDate,
    ],
    queryFn: () => {
      if (!env.ok || effectiveBookingUserId == null || !state || !bookingInfoDateRange) {
        throw new Error("Missing booking-information context");
      }
      return fetchUserBookingInformation(env.orgId, effectiveBookingUserId, {
        startDate: bookingInfoDateRange.startDate,
        endDate: bookingInfoDateRange.endDate,
        categoryId: state.categoryId,
        facilityId: state.facilityId,
      });
    },
    enabled:
      env.ok &&
      effectiveBookingUserId != null &&
      state != null &&
      bookingInfoDateRange != null &&
      bondAuth.session.status === "authenticated",
  });
  void bookingInfoQuery.data;

  /** Existing reservations for the selected participant (same window as booking-information fetch). */
  const existingBookedSlices = useMemo(
    () =>
      bondAuth.session.status === "authenticated" && bookingInfoQuery.data
        ? bookedSlicesFromUserBookingInformation(bookingInfoQuery.data)
        : [],
    [bondAuth.session.status, bookingInfoQuery.data]
  );

  /** Cart / vended keys plus existing reservations — non-selectable on the schedule grid. */
  const scheduleGridBlockedSlotKeys = useMemo(() => {
    const s = new Set<string>(reservedSlotKeysInCart);
    for (const slice of existingBookedSlices) {
      if (slice.resourceId > 0) {
        s.add(`${slice.resourceId}-${slice.startDate}-${slice.startTime}-${slice.endTime}`);
      }
    }
    return s;
  }, [reservedSlotKeysInCart, existingBookedSlices]);

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
      effectiveMinimumBookingNoticeMinutes
    ).sort();
  }, [filteredScheduleDates, scheduleDateKey, effectiveMinimumBookingNoticeMinutes]);

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
      pushBookingState({ ...state, date: dates[0] });
    }
  }, [scheduleSettingsQuery.data, filteredScheduleDates, state, pushBookingState]);

  const scheduleQuery = useQuery({
    queryKey: ["bond", "schedule", env.ok ? env.orgId : 0, scheduleContext, scheduleDateParamForSlots],
    queryFn: () => {
      if (!env.ok || !scheduleContext || !scheduleDateParamForSlots) throw new Error("Missing schedule query");
      return fetchBookingScheduleRecovering(env.orgId, { ...scheduleContext, date: scheduleDateParamForSlots });
    },
    enabled: env.ok && !!scheduleContext && !!scheduleDateParamForSlots,
  });

  const toggleSlot = useCallback(
    (resourceId: number, resourceName: string, s: ScheduleTimeSlotDto) => {
      const key = slotControlKey(resourceId, s);
      if (scheduleGridBlockedSlotKeys.has(key)) return;
      setSelectedSlots((prev) => {
        if (prev.has(key)) {
          setSlotBarError(null);
          const next = new Map(prev);
          next.delete(key);
          return next;
        }
        const spaceId =
          Array.isArray(s.spacesIds) && s.spacesIds.length > 0 && typeof s.spacesIds[0] === "number"
            ? s.spacesIds[0]!
            : resourceId;
        const productRow = productsQuery.data?.data.find((p) => p.id === state?.productId);
        const catalogListUnit = cashUnitPriceForBondFallback(productRow);
        const rawUnit =
          typeof s.price === "number" && Number.isFinite(s.price) ? s.price : 0;
        /** If schedule sends 0 but catalog has a list unit, keep storage aligned with Bond cash price for create. */
        const scheduleUnitStored =
          rawUnit > 0 ? rawUnit : catalogListUnit != null && catalogListUnit > 0 ? catalogListUnit : rawUnit;
        const picked: PickedSlot = {
          key,
          resourceId,
          resourceName,
          startDate: s.startDate,
          endDate: s.endDate,
          startTime: s.startTime,
          endTime: s.endTime,
          scheduleUnitPrice: scheduleUnitStored,
          price: entitlementAdjust(scheduleUnitStored),
          spaceId,
          timezone: typeof s.timezone === "string" && s.timezone.length > 0 ? s.timezone : "UTC",
        };
        const next = new Map(prev);
        next.set(key, picked);
        if (pickedSlotConflictsWithBookedSlices(picked, existingBookedSlices)) {
          setSlotBarError(tb("slotAlreadyBookedForParticipant", { who: bookingForLabel }));
          return prev;
        }
        const v = validateSlotSelection([...next.values()], slotRules, {
          existing: existingBookedSlices,
          customerLabel: bookingForLabel,
          t: tb,
        });
        if (!v.ok) {
          setSlotBarError(v.message ?? tb("slotNotAllowed"));
          return prev;
        }
        setSlotBarError(null);
        return next;
      });
    },
    [
      slotRules,
      entitlementAdjust,
      scheduleGridBlockedSlotKeys,
      productsQuery.data,
      state?.productId,
      tb,
      existingBookedSlices,
      bookingForLabel,
    ]
  );

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

  const scheduleTimezoneLabel = useMemo(() => {
    if (pickedSlotsOrdered.length > 0) {
      const tz = pickedSlotsOrdered[0]?.timezone;
      if (typeof tz === "string" && tz.trim().length > 0) {
        return tz.replace(/_/g, " ");
      }
    }
    const firstSlot = scheduleQuery.data?.resources?.[0]?.timeSlots?.[0];
    if (firstSlot && typeof firstSlot.timezone === "string" && firstSlot.timezone.trim().length > 0) {
      return firstSlot.timezone.replace(/_/g, " ");
    }
    return null;
  }, [pickedSlotsOrdered, scheduleQuery.data]);

  /** After "Book now" while logged out, open checkout drawer once login succeeds. */
  const [resumeCheckoutAfterAuth, setResumeCheckoutAfterAuth] = useState(false);

  const productQuestionnaireIds = useMemo(() => {
    const p = productsQuery.data?.data.find((x) => x.id === state?.productId);
    return parseProductFormIds(p);
  }, [productsQuery.data, state?.productId]);

  useEffect(() => {
    setSessionCartRows(loadSessionCartSnapshots());
  }, []);

  useEffect(() => {
    if (skipNextSessionCartPersistRef.current) {
      skipNextSessionCartPersistRef.current = false;
      return;
    }
    saveSessionCartSnapshots(sessionCartRows);
  }, [sessionCartRows]);

  /** Immediately after Bond `finalizeCart` succeeds: clear session cart and slots so confirmation is not stacked on the cart. */
  const finalizeBondBookingSuccess = useCallback((finalizedSlotKeys: string[]) => {
    if (finalizedSlotKeys.length > 0) {
      setVendedSlotKeys((prev) => [...new Set([...prev, ...finalizedSlotKeys])]);
    }
    setSessionCartRows([]);
    saveSessionCartSnapshots([]);
    setSyncStepGoToCartEnabled(false);
    clearSlotSelection();
    void queryClient.invalidateQueries({ queryKey: ["bond", "schedule"] });
    void queryClient.invalidateQueries({ queryKey: ["bond", "userBookingInformation"] });
  }, [clearSlotSelection, queryClient]);

  /** Drop tab cart UI + sessionStorage (shared computers; session expired; post–sign-out safety). */
  const wipeLocalBookingCartState = useCallback(() => {
    skipNextSessionCartPersistRef.current = true;
    setSessionCartRows([]);
    saveSessionCartSnapshots([]);
    setCheckoutDrawerOpen(false);
    setCheckoutDrawerMode("checkout");
    setNavigateToCheckoutStep(null);
    setSyncStepGoToCartEnabled(false);
    setLockBookingForParticipant(false);
    clearSlotSelection();
    setVendedSlotKeys([]);
  }, [clearSlotSelection]);

  const signOutFromPortal = useCallback(async () => {
    if (env.ok) {
      const orgId = env.orgId;
      const ids: number[] = [];
      const seen = new Set<number>();
      for (const row of sessionCartRowsRef.current) {
        const cid = positiveBondCartId(row.cart);
        if (cid != null && cid > 0 && !seen.has(cid)) {
          seen.add(cid);
          ids.push(cid);
        }
      }
      if (ids.length > 0) {
        await closeOrganizationCartsBestEffort(orgId, ids);
      }
    }
    wipeLocalBookingCartState();
    await bondAuth.logout();
  }, [env, bondAuth, wipeLocalBookingCartState]);

  useEffect(() => {
    if (bondAuth.session.status !== "anonymous") return;
    const storedLen = loadSessionCartSnapshots().length;
    if (sessionCartRows.length === 0 && storedLen === 0) return;
    wipeLocalBookingCartState();
  }, [bondAuth.session.status, sessionCartRows.length, wipeLocalBookingCartState]);

  const onBookNow = useCallback(() => {
    if (bondAuth.session.status !== "authenticated" || bondUserIdResolved == null) {
      setResumeCheckoutAfterAuth(true);
      bondAuth.setLoginOpen(true);
      return;
    }
    if (pickedSlotsOrdered.length === 0) return;
    setNavigateToCheckoutStep(null);
    setCheckoutDrawerMode("checkout");
    setSyncStepGoToCartEnabled(false);
    setCheckoutDrawerOpen(true);
  }, [bondAuth, bondUserIdResolved, pickedSlotsOrdered.length]);

  useEffect(() => {
    if (
      resumeCheckoutAfterAuth &&
      bondAuth.session.status === "authenticated" &&
      bondUserIdResolved != null &&
      pickedSlotsOrdered.length > 0
    ) {
      setResumeCheckoutAfterAuth(false);
      setNavigateToCheckoutStep(null);
      setCheckoutDrawerMode("checkout");
      setSyncStepGoToCartEnabled(false);
      setCheckoutDrawerOpen(true);
    }
  }, [resumeCheckoutAfterAuth, bondAuth.session.status, bondUserIdResolved, pickedSlotsOrdered.length]);

  useEffect(() => {
    if (bondAuth.loginOpen) return;
    if (bondAuth.session.status === "loading") return;
    if (bondAuth.session.status === "anonymous") {
      setResumeCheckoutAfterAuth(false);
    }
  }, [bondAuth.loginOpen, bondAuth.session.status]);

  const onOpenCartBag = useCallback(() => {
    if (sessionCartRows.length === 0) return;
    setNavigateToCheckoutStep(null);
    setCheckoutDrawerMode("bag");
    setCheckoutDrawerOpen(true);
  }, [sessionCartRows.length]);

  /** When opening the bag drawer, refresh each Bond cart from `getCart` so lines/totals match the server. */
  const bagDrawerOpenedForRefreshRef = useRef(false);
  useEffect(() => {
    const showBag = checkoutDrawerOpen && checkoutDrawerMode === "bag";
    if (!showBag) {
      bagDrawerOpenedForRefreshRef.current = false;
      return;
    }
    if (bagDrawerOpenedForRefreshRef.current) return;
    bagDrawerOpenedForRefreshRef.current = true;
    if (resolvedBondOrgId == null) return;
    const orgId = resolvedBondOrgId;
    const ids = new Set<number>();
    for (const row of sessionCartRowsRef.current) {
      const id = positiveBondCartId(row.cart);
      if (id != null) ids.add(id);
    }
    void (async () => {
      for (const cid of ids) {
        try {
          const fresh = await getOrganizationCart(orgId, cid);
          const coerced = coerceCartFromApi(fresh);
          setSessionCartRows((prev) =>
            prev.map((row) => (positiveBondCartId(row.cart) === cid ? { ...row, cart: coerced } : row))
          );
        } catch {
          /* keep cached cart */
        }
      }
    })();
  }, [checkoutDrawerOpen, checkoutDrawerMode, resolvedBondOrgId]);

  /* Prune per-slot add-on targets when slot selection shrinks (no external subscription). */
  useEffect(() => {
    const slotKeys = new Set(selectedSlots.keys());
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
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      return next;
    });
  }, [selectedSlots]);

  useEffect(() => {
    const slotKeys = new Set(selectedSlots.keys());
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      for (const id of [...prev]) {
        const addon = packageAddons.find((a) => a.id === id);
        if (!addon || addon.level === "reservation") continue;
        const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[id], slotKeys);
        if (eff.size === 0) next.delete(id);
      }
      if (next.size === prev.size && [...next].every((id) => prev.has(id))) return prev;
      return next;
    });
  }, [selectedSlots, packageAddons, addonSlotTargeting]);

  const handleAddonToggle = useCallback((addon: PackageAddonLine) => {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(addon.id)) next.delete(addon.id);
      else next.add(addon.id);
      return next;
    });
  }, []);

  /** Slot/hour add-ons need default targeting; keep in sync without nested setState in the toggle handler. */
  useEffect(() => {
    setAddonSlotTargeting((t) => {
      const next = { ...t };
      for (const id of selectedAddonIds) {
        const addon = packageAddons.find((a) => a.id === id);
        if (!addon || addon.level === "reservation") continue;
        if (next[id] == null) next[id] = { all: true, keys: [] };
      }
      for (const key of Object.keys(next)) {
        const numId = Number(key);
        if (!selectedAddonIds.has(numId)) delete next[numId];
      }
      if (JSON.stringify(next) === JSON.stringify(t)) return t;
      return next;
    });
  }, [selectedAddonIds, packageAddons]);

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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{tb("configurationTitle")}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {tb("envMissingLine1", {
            orgKey: tb("envMissingOrg"),
            portalKey: tb("envMissingPortal"),
            envFile: tb("envFile"),
          })}{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{tb("envMissingLine2")}</code>.
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
          line={tb("loadingPortal")}
          subline={pickSportsFact(`portal-${env.orgId}-${env.portalId}`, sportsFacts)}
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
        ? `${formatBondUserMessage(err, te)} (HTTP ${err.status})`
        : err instanceof Error
          ? err.message
          : te("unknownError");
    return (
      <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-xl font-semibold text-red-700 dark:text-red-400">{tb("portalLoadFailed")}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{detail}</p>
        <p className="mt-4 text-sm text-zinc-500">
          {tb("confirmApiKey", { key: tb("bondApiKey"), envFile: tb("envFile") })}
        </p>
      </main>
    );
  }

  if (!portal || !state) return null;

  const category = portal.options.categories.find((c) => c.id === state.categoryId) ?? portal.options.defaultCategory;
  const categoryApprovalRequired = categoryRequiresApproval(category);
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
  const slotPriceCurrency = selectedProduct?.prices[0]?.currency ?? null;
  const ADDONS_PAGE = 10;
  const packageAddonsVisible = addonsExpanded ? packageAddons : packageAddons.slice(0, ADDONS_PAGE);
  const showAddonPanel =
    state.productId != null && packageAddons.length > 0 && selectedSlots.size > 0;
  const setFacility = (facilityId: number) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushBookingState({ ...state, facilityId, productId: null, productPage: 1 });
  };
  const setCategory = (categoryId: number) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushBookingState({ ...state, categoryId, productId: null, productPage: 1 });
  };
  const setActivity = (activity: string) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushBookingState({ ...state, activity, productId: null, productPage: 1 });
  };
  const setProduct = (productId: number) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushBookingState({ ...state, productId });
  };
  const portalViews = clientScheduleViews(portal.options.views);
  const setScheduleView = (view: OnlineBookingView) => {
    clearSlotSelection();
    if (view === "calendar" || view === "matrix") pushBookingState({ ...state, view });
  };
  const setDate = (date: string) => {
    setPreferredStartTime(null);
    clearSlotSelection();
    pushBookingState({ ...state, date });
  };
  const setDuration = (duration: number) => {
    clearSlotSelection();
    pushBookingState({ ...state, duration });
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
      <header className="cb-header-sticky cb-header-fullbleed cb-header-booking grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-t-4 border-t-[var(--cb-primary)] bg-[var(--cb-bg-header)] px-2 sm:px-3">
        <div className="flex items-center gap-2 justify-self-start">
          <button
            type="button"
            className="cb-appearance-cycle"
            onClick={cycleAppearance}
            aria-label={
              appearanceMode === "system"
                ? tb("themeAuto")
                : appearanceMode === "light"
                  ? tb("themeLight")
                  : tb("themeDark")
            }
            title={tb("appearance", { mode: appearanceMode })}
          >
            {appearanceMode === "light" ? "☀" : appearanceMode === "dark" ? "☾" : "A"}
          </button>
          <a
            href="/docs/CONSUMER_FLOW_DIAGRAM.html"
            target="_blank"
            rel="noopener noreferrer"
            className="cb-appearance-cycle"
            aria-label="Open consumer flow diagram"
            title="Consumer flow diagram"
          >
            📄
          </a>
        </div>
        <div className="flex min-w-0 flex-col items-center justify-center px-1 text-center">
          {bondAuth.session.status === "authenticated" ? (
            <button
              type="button"
              className={`cb-header-booking-for-trigger group max-w-[min(100vw-8rem,22rem)]${lockBookingForParticipant ? " opacity-55" : ""}`}
              onClick={() => setBookingForModalOpen(true)}
              disabled={lockBookingForParticipant}
              title={lockBookingForParticipant ? tb("participantLockedTitle") : undefined}
              aria-haspopup="dialog"
              aria-expanded={bookingForModalOpen}
            >
              <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--cb-text-muted)]">
                {tb("bookingFor")}
              </span>
              <span className="mt-0.5 flex items-center justify-center gap-1">
                <span className="truncate text-base font-bold text-[var(--cb-primary)] sm:text-lg">{bookingForLabel}</span>
                <span className="shrink-0 text-[var(--cb-primary)]" aria-hidden>
                  ▾
                </span>
              </span>
            </button>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-[var(--cb-primary)] sm:text-xl">{tb("bookYourSession")}</h1>
              <p className="sr-only">{portal.name}</p>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 justify-self-end">
          {bondAuth.session.status === "authenticated" ? (
            <>
              <div
                className="cb-header-user-avatar"
                title={bondAuth.session.email ?? bookingForLabel}
                aria-hidden
              >
                {bookingHeaderInitials(bookingForLabel, bondAuth.session.email)}
              </div>
              <button
                type="button"
                className="cb-header-signin"
                onClick={() => void signOutFromPortal()}
                aria-label={tb("signOut")}
              >
                <span className="px-1 text-xs font-semibold">{tb("signOutShort")}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="cb-header-signin"
              onClick={() => bondAuth.setLoginOpen(true)}
              aria-label={tb("signInAria")}
            >
              <IconUserCircle />
            </button>
          )}
        </div>
        {bondAuth.session.status === "authenticated" ? <p className="sr-only">{portal.name}</p> : null}
      </header>

      <div className="cb-booking-nav-band -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="cb-breadcrumb-bar cb-breadcrumb-bar--fit" aria-label={tb("breadcrumbLabel")}>
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
            {tb("selectService")}
            {productListTotal != null && productListTotal > 0 ? (
              <span className="cb-section-title-count"> ({productListTotal})</span>
            ) : null}
          </h2>
          {productsQuery.isPending ? (
            <BookingDelayedFunLoader
              active
              line={tb("loadingPortal")}
              subline={pickSportsFact(`products-${state.activity}-${state.productPage}`, sportsFacts)}
              showFunCopy={hydrated}
              className="mt-4"
            />
          ) : null}
          {productsQuery.isError && (
            <p className="cb-alert cb-alert--error mt-2 text-sm">
              {productsQuery.error instanceof BondBffError
                ? formatBondUserMessage(productsQuery.error, te)
                : productsQuery.error instanceof Error
                  ? productsQuery.error.message
                  : te("failedLoadProducts")}
            </p>
          )}
          {productsQuery.data && productsQuery.data.data.length === 0 && (
            <p className="cb-muted mt-2 text-sm">{tb("noProductsFilter")}</p>
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
                            <span className="cb-product-chip-price-amount">{tb("freeForMembers")}</span>
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
                            {tb("memberBenefits")}
                          </span>
                        ) : null}
                        {p.isPunchPass ? (
                          <span className="cb-product-tag">
                            <IconPassTicket className="shrink-0 opacity-95" />
                            {tb("passTag")}
                          </span>
                        ) : null}
                        {productMembershipGated(p) ? (
                          <span className="cb-product-tag">
                            <IconLockDetail className="size-3.5 shrink-0 opacity-95" />
                            {tb("membersOnly")}
                          </span>
                        ) : null}
                        {bookingOptionalAddons(p).length > 0 ? (
                          <span className="cb-product-tag cb-product-tag--addon">{tb("optionalAddonsTag")}</span>
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
                      aria-label={tb("moreAboutProduct", { name: p.name })}
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
          {meta && totalPages > 1 && (
            <div className="cb-muted mt-4 flex items-center justify-between gap-4 text-sm">
              <button
                type="button"
                className="cb-btn-ghost"
                disabled={state.productPage <= 1}
                onClick={() => pushBookingState({ ...state, productPage: state.productPage - 1, productId: null })}
              >
                {tc("previous")}
              </button>
              <span>
                {tc("pageOf", { page: state.productPage, total: totalPages })}
              </span>
              <button
                type="button"
                className="cb-btn-ghost"
                disabled={state.productPage >= totalPages}
                onClick={() => pushBookingState({ ...state, productPage: state.productPage + 1, productId: null })}
              >
                {tc("next")}
              </button>
            </div>
          )}
        </section>

        {bondAuth.session.status === "anonymous" ? (
          <div className="cb-signin-hint mt-2" role="note">
            <span className="cb-signin-hint-icon" aria-hidden>
              <IconLogIn className="h-5 w-5 shrink-0 text-[var(--cb-primary)]" />
            </span>
            <p className="cb-signin-hint-text">
              <button type="button" className="cb-signin-hint-cta" onClick={() => bondAuth.setLoginOpen(true)}>
                {tb("signInNow")}
              </button>{" "}
              {tb("signInHintTail")}
            </p>
          </div>
        ) : null}

        </div>

        <div
          className={
            state.productId != null
              ? /* Schedule split 1068px — align with globals: .cb-booking-schedule-shell-left sticky + .cb-schedule-when-wide-grid */
                "flex flex-col gap-6 min-[1068px]:grid min-[1068px]:grid-cols-2 min-[1068px]:gap-8 min-[1068px]:items-start"
              : undefined
          }
        >
          {state.productId != null && (
            <div className="cb-booking-schedule-shell-left flex min-w-0 flex-col gap-4">
              <div className="cb-schedule-when-band -mx-4 px-4 py-5 sm:mx-0 sm:rounded-xl sm:px-5">
                <section className="text-left" aria-label={tb("whenSectionLabel")}>
              {/* min-[1068px]: calendar left; duration (wrap) + preferred start on the right — matches split grid breakpoint */}
              <div className="cb-schedule-when-wide hidden min-[1068px]:block">
                {filteredScheduleDates.length > 0 ? (
                  <div className="cb-schedule-when-wide-grid">
                    <div className="cb-schedule-when-wide-cal">
                      <h3 id="pick-date-heading-wide" className="cb-schedule-step-title cb-schedule-step-title--first">
                        {tb("selectDate")}
                      </h3>
                      <div className="cb-schedule-inline-cal mt-3 max-w-[calc(100vw-2rem)] sm:max-w-[20rem]">
                        <AvailableDateCalendarBody
                          availableDates={filteredScheduleDates.map((d) => d.date)}
                          vipEarlyAccessDates={vipEarlyAccessDates}
                          selectedDate={state.date}
                          onSelect={(d) => setDate(d)}
                          onClose={() => {}}
                          closeOnSelect={false}
                          className="cb-dp-root--inline"
                          signedIn={bondAuth.session.status === "authenticated"}
                        />
                      </div>
                    </div>
                    <div className="cb-schedule-when-wide-timing">
                      <h3 id="pick-duration-heading-wide" className="cb-schedule-step-title">
                        {tb("selectDuration")}
                      </h3>
                      <div
                        className="cb-duration-chips-wrap mt-2 flex flex-wrap gap-2"
                        role="tablist"
                        aria-labelledby="pick-duration-heading-wide"
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
                      {showPreferredStart ? (
                        <>
                          <h3
                            id="pick-start-heading-wide"
                            className="cb-schedule-step-title mt-6"
                          >
                            {tb("preferredStartTitle")}{" "}
                            <span className="cb-schedule-step-optional">{tb("optional")}</span>
                          </h3>
                          <button
                            type="button"
                            className="cb-preferred-start-field mt-2 w-full max-w-md"
                            aria-haspopup="dialog"
                            aria-expanded={picker === "start"}
                            aria-labelledby="pick-start-heading-wide"
                            onClick={() => setPicker("start")}
                          >
                            <IconClockDetail className="cb-preferred-start-field-icon h-5 w-5 shrink-0 text-[var(--cb-primary)]" />
                            <span className="cb-preferred-start-field-value min-w-0 flex-1 truncate text-left">
                              {preferredStartTime == null
                                ? tb("anyTime")
                                : formatPreferredStartOptionLabel(preferredStartTime)}
                            </span>
                            <span className="cb-faint shrink-0 text-[0.65rem]" aria-hidden>
                              ▾
                            </span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Below split breakpoint: single column — pills + calendar button only; full grid opens in modal (no inline calendar). */}
              <div className="cb-schedule-when-stacked flex flex-col gap-0 min-[1068px]:hidden">
                <h3 id="pick-date-heading" className="cb-schedule-step-title cb-schedule-step-title--first">
                  {tb("selectDate")}
                </h3>
                {filteredScheduleDates.length > 0 ? (
                  <div className="cb-date-strip-row mt-3">
                    <div className="cb-date-strip-cluster">
                      <button
                        type="button"
                        className="cb-cal-open-btn"
                        aria-label={tb("openCalendarPickDate")}
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
                  {tb("selectDuration")}
                </h3>
                <div
                  className="cb-duration-chips-wrap mt-3 flex flex-wrap gap-2"
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

                {showPreferredStart ? (
                  <>
                    <h3 id="pick-start-heading" className="cb-schedule-step-title">
                      {tb("preferredStartTitle")}{" "}
                      <span className="cb-schedule-step-optional">{tb("optional")}</span>
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
                          ? tb("anyTime")
                          : formatPreferredStartOptionLabel(preferredStartTime)}
                      </span>
                      <span className="cb-faint shrink-0 text-[0.65rem]" aria-hidden>
                        ▾
                      </span>
                    </button>
                  </>
                ) : null}
              </div>
            </section>
              </div>
            </div>
          )}

          <div className={state.productId != null ? "min-w-0 flex flex-col gap-4" : undefined}>
        <div className={state.productId != null ? "cb-schedule-available-times-shell" : undefined}>
        <section aria-labelledby="schedule-heading" className="text-left">
          <div className="cb-schedule-heading-row">
            <h2
              id="schedule-heading"
              className="cb-section-title cb-section-title--inline"
              aria-describedby={
                scheduleTimezoneLabel && state.productId != null ? "schedule-timezone-note" : undefined
              }
            >
              {tb("availableTimes")}
            </h2>
            {state.productId != null && portalViews.length > 1 ? (
              <div className="cb-segment shrink-0" role="group" aria-label={tb("listOrTimeline")}>
                {portalViews.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setScheduleView(v)}
                    aria-pressed={state.view === v}
                  >
                    {v === "matrix" ? tb("viewTimeline") : tb("viewList")}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {scheduleTimezoneLabel && state.productId != null ? (
            <p id="schedule-timezone-note" className="cb-muted mt-1.5 text-xs">
              {tb("timesInTimezone", { tz: scheduleTimezoneLabel })}
            </p>
          ) : null}
          {slotBarError && state.productId != null ? (
            <p className="cb-slot-limit-alert" role="alert">
              {slotBarError}
            </p>
          ) : null}
          {scheduleSettingsQuery.isPending && !scheduleQuery.isPending ? (
            <BookingDelayedFunLoader
              active
              line={tb("loadingScheduleSettings")}
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
              line={tb("loadingSlots")}
              subline={pickSportsFact(`slots-${state.date}-${state.productId}`, sportsFacts)}
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
              <span>{tb("loadingSlots")}</span>
            </p>
          ) : null}

          {scheduleQuery.data && state.view === "matrix" && (
            <div className="cb-matrix-wrap cb-matrix-wrap--in-shell mt-4">
              <ScheduleMatrix
                schedule={scheduleQuery.data}
                product={selectedProduct}
                durationMinutes={state.duration ?? durations[0] ?? 60}
                priceCurrency={slotPriceCurrency}
                membershipGated={effectiveMembershipGated}
                selectedKeys={selectedKeysSet}
                reservedSlotKeys={scheduleGridBlockedSlotKeys}
                onToggleSlot={toggleSlot}
                adjustSlotUnitPrice={entitlementAdjust}
                autoScrollKey={state.date ?? ""}
                preferredStartResolved={resolvedPreferredStartForFetch}
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
                membershipGated={effectiveMembershipGated}
                selectedKeys={selectedKeysSet}
                reservedSlotKeys={scheduleGridBlockedSlotKeys}
                onToggleSlot={toggleSlot}
                adjustSlotUnitPrice={entitlementAdjust}
              />
            </div>
          )}

        </section>
        </div>
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
          </div>
        </div>
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
            title={tb("whatToBook")}
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
          <ModalShell open={picker === "activity"} title={tb("selectSport")} onClose={() => setPicker(null)}>
            <ActivityPickerBody
              activities={portal.options.activities}
              selected={state.activity}
              onSelect={setActivity}
              onClose={() => setPicker(null)}
            />
          </ModalShell>
          <ModalShell
            open={picker === "date"}
            title={tb("selectDateTitle")}
            hideTitle
            ariaLabel={tb("chooseAvailableDateAria")}
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
              signedIn={bondAuth.session.status === "authenticated"}
            />
          </ModalShell>
          <ModalShell open={picker === "start"} title={tb("preferredStartTitle")} onClose={() => setPicker(null)}>
            <ListPickerBody
              items={[
                { value: START_TIME_AUTO, label: tb("anyTime") },
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

      {state?.productId != null || sessionCartRows.length > 0 ? (
        <BookingSelectionPortal
          slotCount={selectedSlots.size}
          cartSessionCount={sessionCartRows.length}
          cartLineItemCount={cartLineItemCount}
          error={slotBarError}
          onClear={clearSlotSelection}
          themeStyle={themeStyle}
          appearanceClass={appearanceClass}
          overlayOpen={bondAuth.loginOpen || picker != null || checkoutDrawerOpen}
          onOpenCart={sessionCartRows.length > 0 ? onOpenCartBag : undefined}
          onBook={onBookNow}
          bookBusy={checkoutBusy}
          bookDisabled={pickedSlotsOrdered.length === 0}
        />
      ) : null}

      <LoginModal />

      <WelcomeToast
        open={welcomeToastOpen}
        title={welcomeToastTitle}
        subtitle={tb("welcomeSignedIn")}
        duration={3000}
        onDismiss={() => setWelcomeToastOpen(false)}
      />

      {env.ok &&
      state &&
      effectiveBookingUserId != null &&
      (checkoutDrawerOpen || state.productId != null || sessionCartRows.length > 0) ? (
        <BookingCheckoutDrawer
          open={checkoutDrawerOpen}
          onClose={() => {
            setCheckoutDrawerOpen(false);
            setCheckoutBusy(false);
            setCheckoutDrawerMode("checkout");
            setNavigateToCheckoutStep(null);
            setSyncStepGoToCartEnabled(false);
            setLockBookingForParticipant(false);
            if (state?.productId != null && typeof document !== "undefined") {
              queueMicrotask(() => {
                const el =
                  document.getElementById("pick-date-heading-wide") ??
                  document.getElementById("pick-date-heading");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }
          }}
          orgId={env.orgId}
          portalId={env.portalId}
          facilityId={state.facilityId}
          categoryId={state.categoryId}
          productId={state.productId ?? 0}
          productName={selectedProduct?.name ?? tb("serviceDefault")}
          activity={state.activity}
          product={selectedProduct}
          userId={effectiveBookingUserId}
          pickedSlots={pickedSlotsOrdered}
          selectedAddonIds={selectedAddonIds}
          questionnaireIds={productQuestionnaireIds}
          onSubmittingChange={setCheckoutBusy}
          mode={checkoutDrawerMode}
          bagSnapshots={sessionCartRows}
          onRemoveBagLine={async ({ index, cartFlatLineIndices, remove }) => {
            const row = sessionCartRowsRef.current[index];
            if (row == null) return;
            const cid = positiveBondCartId(row.cart);
            if (cid == null || !env.ok) {
              setSessionCartRows((prev) => prev.filter((_, i) => i !== index));
              return;
            }

            const settleAfterDeletes = async (updated: OrganizationCartDto | null) => {
              let coerced = updated ? coerceCartFromApi(updated) : null;
              if (coerced == null) {
                try {
                  coerced = coerceCartFromApi(await getOrganizationCart(env.orgId, cid));
                } catch {
                  coerced = null;
                }
              }
              const items = coerced?.cartItems;
              const stillHasLines =
                Array.isArray(items) &&
                items.length > 0 &&
                flattenBondCartItemNodes(items).length > 0;
              if (!stillHasLines || coerced == null) {
                setSessionCartRows((prev) => prev.filter((_, i) => i !== index));
                return;
              }
              const segs = flatLineIndexSegmentsForMergedBookings(coerced);
              const bondHasItems = Array.isArray(coerced.cartItems) && coerced.cartItems.length > 0;
              setSessionCartRows((prev) =>
                prev.map((r, i) =>
                  i === index
                    ? {
                        ...r,
                        cart: coerced!,
                        ...(bondHasItems ? { displayLines: undefined } : {}),
                        ...(segs == null || segs.length <= 1 ? { reservationGroups: undefined } : {}),
                      }
                    : r
                )
              );
            };

            try {
              if (remove.kind === "line") {
                const updated = await removeCartItemWithIllegalPriceFallback(
                  env.orgId,
                  cid,
                  remove.cartItemId,
                  row.cart,
                  cartFlatLineIndices
                );
                await settleAfterDeletes(updated);
                return;
              }
              const indices =
                cartFlatLineIndices != null && cartFlatLineIndices.length > 0
                  ? cartFlatLineIndices
                  : allBondFlatLineIndices(row.cart);
              const ids = bondRemovableCartItemIdsForIndices(row.cart, indices);
              if (ids.length === 0) {
                const fallback = bondRootCartItemIdForRemoval(row.cart, cartFlatLineIndices);
                if (fallback == null) {
                  await closeCart(env.orgId, cid);
                  setSessionCartRows((prev) => prev.filter((_, i) => i !== index));
                  return;
                }
                const updated = await removeCartItemWithIllegalPriceFallback(
                  env.orgId,
                  cid,
                  fallback,
                  row.cart,
                  cartFlatLineIndices
                );
                await settleAfterDeletes(updated);
                return;
              }
              const updated = await removeCartItemsSequentiallyWithFallback(
                env.orgId,
                cid,
                ids,
                cartFlatLineIndices,
                () => getOrganizationCart(env.orgId, cid)
              );
              await settleAfterDeletes(updated);
            } catch {
              return;
            }
          }}
          onSuccess={(cart) => {
            const name = selectedProduct?.name ?? tb("serviceDefault");
            const normalizedCart = coerceCartFromApi(cart);
            const mergedBondId = positiveBondCartId(normalizedCart);
            const raw = memberRequiredQueryForSelected?.data;
            const participantHasQualifyingMembership =
              raw != null &&
              membershipRequiredForProductFromResponse(raw) &&
              !userNeedsMembershipFromRequiredResponse(raw);
            const newSlotKeys = pickedSlotsOrdered.map((s) => s.key);
            /** Prefer Bond `cartItems` for bag/payment lines; client `displayLines` only match the last add’s slots and hide merged bookings. */
            const bondCartItems = normalizedCart.cartItems;
            const useBondLineItems =
              Array.isArray(bondCartItems) && bondCartItems.length > 0;
            const displayLines = useBondLineItems
              ? undefined
              : buildBookingDisplayLinesForCart({
                  productName: name,
                  slots: pickedSlotsOrdered,
                  cart: normalizedCart,
                  product: selectedProduct,
                  bookingForLabel,
                });
            flushSync(() => {
              setSessionCartRows((prev) => {
                const mergeReservationGroups = (
                  siblings: SessionCartSnapshot[],
                  currentLabel: string,
                  currentSlotKeys: string[]
                ): SessionReservationGroup[] | undefined => {
                  const groupsFromPrior: SessionReservationGroup[] = [];
                  for (const row of siblings) {
                    if (row.reservationGroups != null && row.reservationGroups.length > 0) {
                      for (const g of row.reservationGroups) {
                        groupsFromPrior.push({
                          bookingForLabel: g.bookingForLabel,
                          slotKeys: [...g.slotKeys],
                        });
                      }
                    } else {
                      groupsFromPrior.push({
                        bookingForLabel: row.bookingForLabel?.trim() || "Booking",
                        slotKeys: [...(row.reservedSlotKeys ?? [])],
                      });
                    }
                  }
                  const all: SessionReservationGroup[] = [
                    ...groupsFromPrior,
                    {
                      bookingForLabel: currentLabel.trim() || "Booking",
                      slotKeys: [...currentSlotKeys],
                    },
                  ];
                  return all.length > 1 ? all : undefined;
                };

                if (mergedBondId != null) {
                  const mergedKeys = new Set<string>(newSlotKeys);
                  const siblings: SessionCartSnapshot[] = [];
                  const rest = prev.filter((row) => {
                    const rid = positiveBondCartId(row.cart);
                    if (rid === mergedBondId) {
                      siblings.push(row);
                      for (const k of row.reservedSlotKeys ?? []) mergedKeys.add(k);
                      return false;
                    }
                    return true;
                  });
                  const reservationGroups = mergeReservationGroups(siblings, bookingForLabel, newSlotKeys);
                  return [
                    ...rest,
                    {
                      cart: normalizedCart,
                      productName: name,
                      bookingForLabel,
                      approvalRequired: categoryApprovalRequired,
                      reservedSlotKeys: [...mergedKeys],
                      participantHasQualifyingMembership,
                      ...(displayLines != null ? { displayLines } : {}),
                      ...(reservationGroups != null ? { reservationGroups } : {}),
                    },
                  ];
                }
                return [
                  ...prev,
                  {
                    cart: normalizedCart,
                    productName: name,
                    bookingForLabel,
                    approvalRequired: categoryApprovalRequired,
                    reservedSlotKeys: newSlotKeys,
                    participantHasQualifyingMembership,
                    ...(displayLines != null ? { displayLines } : {}),
                  },
                ];
              });
            });
            clearSlotSelection();
            const refreshCartId = mergedBondId;
            if (env.ok && refreshCartId != null) {
              const orgIdForRefresh = env.orgId;
              void (async () => {
                try {
                  const fresh = await getOrganizationCart(orgIdForRefresh, refreshCartId);
                  const coerced = coerceCartFromApi(fresh);
                  setSessionCartRows((prev) =>
                    prev.map((row) =>
                      positiveBondCartId(row.cart) === refreshCartId ? { ...row, cart: coerced } : row
                    )
                  );
                } catch {
                  /* keep create response */
                }
              })();
            }
          }}
          onAddedToCart={onCheckoutAddedToCart}
          onBookAnotherRental={() => {
            setCheckoutDrawerOpen(false);
            setNavigateToCheckoutStep(null);
            setCheckoutDrawerMode("checkout");
            setSyncStepGoToCartEnabled(false);
          }}
          onBackFromPayment={() => {
            setNavigateToCheckoutStep("syncCart");
            setCheckoutDrawerMode("checkout");
            setSyncStepGoToCartEnabled(true);
          }}
          onRequestBagCheckout={() => {
            setNavigateToCheckoutStep("payment");
            setCheckoutDrawerMode("checkout");
          }}
          onGoToCart={() => {
            setNavigateToCheckoutStep(null);
            setCheckoutDrawerMode("bag");
            setSyncStepGoToCartEnabled(false);
          }}
          showGoToCartOnSyncStep={syncStepGoToCartEnabled}
          onBookingConfirmedDismiss={() => {
            setSessionCartRows((prev) => (prev.length === 0 ? prev : []));
          }}
          navigateToCheckoutStep={navigateToCheckoutStep}
          onClearNavigateToCheckoutStep={clearNavigateToCheckoutStep}
          onFinalizeBookingSuccess={finalizeBondBookingSuccess}
          packageAddons={packageAddons}
          addonsExpanded={addonsExpanded}
          onToggleExpandAddons={() => setAddonsExpanded((x) => !x)}
          addonSlotTargeting={addonSlotTargeting}
          onToggleAddon={handleAddonToggle}
          onAddonSelectAllSlots={onAddonSelectAllSlots}
          onToggleAddonSlot={onToggleAddonSlot}
          formatPrice={formatPrice}
          bookingForLabel={bookingForLabel}
          bookingForBadge={bookingForBadge}
          appearanceClass={appearanceClass}
          bondProfile={bondProfileQuery.data}
          primaryAccountUserId={bondUserIdResolved ?? 0}
          approvalRequired={categoryApprovalRequired}
          orgDisplayName={portal?.name}
          mergeCartId={mergeCartId}
          productCatalogPending={Boolean(state?.productId && productsQuery.isPending)}
          requiredMembershipAlreadySatisfied={!participantNeedsMembershipForCheckout}
          onParticipantLockChange={setLockBookingForParticipant}
          onPruneSatisfiedAddonProductIds={pruneSatisfiedAddonProductIds}
          onBookingForClick={
            lockBookingForParticipant ? undefined : () => setBookingForModalOpen(true)
          }
        />
      ) : null}

      <BookingForDrawer
        open={bookingForModalOpen}
        onClose={() => setBookingForModalOpen(false)}
        members={partyMembersForBookingFor}
        value={bookingTargetUserId ?? bondUserIdResolved ?? null}
        onConfirm={(userId) => setBookingTargetUserId(userId)}
        profileLoading={bondAuth.session.status === "authenticated" && bondProfileQuery.isPending}
      />

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
