"use client";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CbBusyInline } from "@/components/booking/primitives/CbBusyInline";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { ModalShell } from "@/components/booking/ModalShell";
import { formatConsumerBookingErrorUnknown } from "@/lib/bond-errors";
import { BondBffError } from "@/lib/bond-json";
import { finalizeCart, getOrganizationCart } from "@/lib/bond-cart-api";
import {
  buildSquadCInvoicePortalUrl,
  parseFinalizeCartResponse,
  type FinalizeSuccessDisplay,
} from "@/lib/bond-finalize-response";
import { consumerReservationsUrl } from "@/lib/bond-consumer-web";
import {
  computeConsumerPaymentProcessingFee,
  fetchConsumerPaymentOptions,
  flattenConsumerPaymentChoices,
} from "@/lib/bond-payment-api";
import {
  fetchCheckoutQuestionnaires,
  fetchPublicQuestionnaireById,
  fetchUserRequiredProducts,
  postOnlineBookingCreate,
} from "@/lib/online-booking-user-api";
import { buildOnlineBookingCreateBody, splitAddonPayloadForCreate } from "@/lib/online-booking-create-body";
import { formatBookingPriceOrFree, productMembershipGated } from "@/lib/booking-pricing";
import {
  bookingContactSnapshot,
  findProfilePersonById,
  participantDemographicsLine,
  profilePhotoUrlFromUser,
} from "@/lib/booking-profile-contact";
import {
  isFormQuestionsSatisfied,
  mergeQuestionnaireQuestions,
  type NormalizedQuestion,
} from "@/lib/questionnaire-parse";
import {
  formatProfileDateYmd,
  labelSuggestsGender,
  matchGenderToSelectValue,
} from "@/lib/questionnaire-prefill";
import { MembershipRequiredPanel } from "@/components/booking/MembershipRequiredModal";
import {
  collectProductAndNestedIds,
  collectSatisfiedRequiredProductIds,
  isMembershipRequiredProduct,
  parseExtendedRequiredProductsList,
  partitionMembershipVsOtherRequired,
  primaryListPrice,
  unitPriceForRequiredProductInTree,
  type ExtendedRequiredProductNode,
} from "@/lib/required-products-extended";
import { parseRequiredProductsResponse, type RequiredProductRow } from "@/lib/required-products-parse";
import { getEffectiveAddonSlotKeys } from "@/lib/addon-slot-targeting";
import { formatScheduleSummaryForBooking } from "@/lib/session-booking-display-lines";
import { formatPickedSlotLongDate, formatPickedSlotTimeRange } from "@/components/booking/booking-slot-labels";
import { formatDurationPriceBadge } from "@/lib/category-booking-settings";
import { CbInfoHint } from "@/components/booking/primitives/CbInfoHint";
import { CbCheckoutTotalRow } from "@/components/booking/primitives/CbCheckoutTotalRow";
import { BookingAddonPanel, type AddonSlotTargeting } from "./BookingAddonPanel";
import { CheckoutQuestionnairePanels } from "./CheckoutQuestionnairePanels";
import type { ExtendedProductDto, OrganizationCartDto } from "@/types/online-booking";
import type { PackageAddonLine } from "@/lib/product-package-addons";
import { resolveAddonDisplayPrice } from "@/lib/product-package-addons";
import type { BondUserDto } from "@/lib/bond-user-types";
import { slotDurationMinutes, type PickedSlot } from "@/lib/slot-selection";
import {
  aggregateBagCartLineBuckets,
  aggregateBagSnapshots,
  aggregateBagSnapshotsByLabel,
  BOND_KIND_LINE_MIN,
  bondCartPayableTotalForFinalize,
  cartApprovalSubtotal,
  cartChargeableMinimum,
  cartChargeableTotal,
  cartHasApprovalSplit,
  estimateAmountDue,
} from "@/lib/checkout-bag-totals";
import {
  describeEntitlementsForDisplay,
  reverseEntitlementDiscountsToUnitPrice,
} from "@/lib/entitlement-discount";
import type { SessionCartDisplayLine, SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import { positiveBondCartId } from "@/lib/session-cart-snapshot";
import {
  bagApprovalPolicy,
  countSessionCartLineItems,
  expandSnapshotForPurchaseList,
  type BagApprovalPolicy,
  type CartPurchaseDisplayLine,
} from "@/lib/cart-purchase-lines";
import type { BagRemovePolicy } from "@/lib/bond-cart-removal";
import { CheckoutItemCard } from "@/components/booking/CheckoutItemCard";
import {
  checkoutCardsFromSnapshot,
  type CheckoutCardModel,
} from "@/lib/checkout-card-model";

const CURRENCY_CENTS = 100;
const CURRENCY_INPUT_DECIMALS = 2;
const CURRENCY_INPUT_STEP = "0.01";

function bagCartMetaRowsUl(
  bagMetaRows: NonNullable<CartPurchaseDisplayLine["bagMetaRows"]>,
  tx: (key: string) => string
) {
  return (
    <ul className="cb-cart-bag-meta-rows">
      {bagMetaRows.participant ? (
        <li className="cb-cart-bag-meta-row">
          <span className="cb-cart-bag-meta-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 19c1.5-3 4-5 6-5s4.5 2 6 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="cb-cart-bag-meta-text">{bagMetaRows.participant}</span>
        </li>
      ) : null}
      {bagMetaRows.resource ? (
        <li className="cb-cart-bag-meta-row">
          <span className="cb-cart-bag-meta-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="cb-cart-bag-meta-text">{bagMetaRows.resource}</span>
        </li>
      ) : null}
      {bagMetaRows.dateLine ? (
        <li className="cb-cart-bag-meta-row">
          <span className="cb-cart-bag-meta-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="cb-cart-bag-meta-text">
            {bagMetaRows.dateLine}
            {bagMetaRows.timeLine ? ` · ${bagMetaRows.timeLine}` : ""}
          </span>
        </li>
      ) : bagMetaRows.timeLine ? (
        <li className="cb-cart-bag-meta-row">
          <span className="cb-cart-bag-meta-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="cb-cart-bag-meta-text">{bagMetaRows.timeLine}</span>
        </li>
      ) : null}
    </ul>
  );
}

function resolveFinalizeCartId(
  snapshots: SessionCartSnapshot[],
  last: OrganizationCartDto | null,
  merge?: number
): number | null {
  for (const row of snapshots) {
    const id = positiveBondCartId(row.cart);
    if (id != null) return id;
  }
  if (last && typeof last.id === "number" && Number.isFinite(last.id) && last.id > 0) return last.id;
  if (merge != null && merge > 0) return merge;
  return null;
}

function membershipRequiredFromExtendedTree(
  productId: number,
  extended: ExtendedRequiredProductNode[]
): boolean {
  function walk(nodes: ExtendedRequiredProductNode[]): ExtendedRequiredProductNode | undefined {
    for (const n of nodes) {
      if (n.id === productId) return n;
      if (n.requiredProducts?.length) {
        const x = walk(n.requiredProducts);
        if (x) return x;
      }
    }
  }
  const node = walk(extended);
  return node != null && isMembershipRequiredProduct(node);
}

/** True when this required line is submitted for venue approval vs. paid at checkout (memberships = false). */
function snapshotRowExpectsVenueApproval(
  r: RequiredProductRow,
  extended: ExtendedRequiredProductNode[]
): boolean {
  if (membershipRequiredFromExtendedTree(r.id, extended)) return false;
  if (extended.length === 0) {
    const t = r.productType?.toLowerCase() ?? "";
    if (t.includes("member") || t.includes("subscription")) return false;
  }
  return true;
}

function groupHeadingForBooking(
  label: string,
  sectionIndex: number,
  sectionCount: number,
  tx: (key: string, values?: Record<string, string | number>) => string
): string {
  const trimmed = label.trim();
  const base =
    trimmed.length === 0 ? tx("groupBookingDefault") : tx("groupBookingForLabel", { name: trimmed });
  if (sectionCount <= 1) return base;
  return tx("groupSectionPrefix", { index: sectionIndex + 1, base });
}

export type CheckoutStep =
  | "addons"
  | "membership"
  | "forms"
  | "syncCart"
  | "addedToCart"
  | "payment";

type FlowFlags = { hasAddonsStep: boolean; hasMembershipStep: boolean; hasFormsStep: boolean };

function lastInteractiveCheckoutStep(flow: FlowFlags): CheckoutStep | "close" {
  if (flow.hasFormsStep) return "forms";
  if (flow.hasMembershipStep) return "membership";
  if (flow.hasAddonsStep) return "addons";
  return "close";
}

function previousStepInCheckoutFlow(step: CheckoutStep, flow: FlowFlags): CheckoutStep | "close" {
  if (step === "payment") return lastInteractiveCheckoutStep(flow);
  if (step === "addedToCart") return "syncCart";
  if (step === "syncCart") {
    if (flow.hasFormsStep) return "forms";
    if (flow.hasMembershipStep) return "membership";
    if (flow.hasAddonsStep) return "addons";
    return "close";
  }
  if (step === "forms") {
    if (flow.hasMembershipStep) return "membership";
    if (flow.hasAddonsStep) return "addons";
    return "close";
  }
  if (step === "membership") {
    if (flow.hasAddonsStep) return "addons";
    return "close";
  }
  if (step === "addons") return "close";
  return "close";
}

const ADDONS_PAGE = 10;

type Props = {
  open: boolean;
  onClose: () => void;
  orgId: number;
  portalId: number;
  facilityId: number;
  categoryId: number;
  productId: number;
  productName: string;
  /** Portal activity string for create segments (Bond enum) */
  activity: string;
  product: ExtendedProductDto | undefined;
  userId: number;
  pickedSlots: PickedSlot[];
  selectedAddonIds: ReadonlySet<number>;
  addonQuantities?: ReadonlyMap<number, number>;
  onSetAddonQty?: (addonId: number, qty: number) => void;
  /** Per-slot qty for slot/hour-level add-ons; required for inline qty controls in the booking summary. */
  addonSlotQuantities?: ReadonlyMap<number, ReadonlyMap<string, number>>;
  onSetAddonSlotQty?: (addonId: number, slotKey: string, qty: number) => void;
  questionnaireIds: number[];
  onSuccess: (cart: OrganizationCartDto) => void;
  onSubmittingChange?: (pending: boolean) => void;
  /** Optional add-ons from product.packages */
  packageAddons: PackageAddonLine[];
  /**
   * While category products are still loading, keep the add-ons step in the flow so we don’t skip optional extras
   * when `packageAddons` is briefly empty.
   */
  productCatalogPending?: boolean;
  addonsExpanded: boolean;
  onToggleExpandAddons: () => void;
  addonSlotTargeting: AddonSlotTargeting;
  onToggleAddon: (addon: PackageAddonLine) => void;
  onAddonSelectAllSlots: (addonId: number, checked: boolean, keys: string[]) => void;
  onToggleAddonSlot: (addonId: number, slotKey: string, allKeys: string[]) => void;
  formatPrice: (amount: number, currency: string) => string;
  bookingForLabel: string;
  bookingForBadge?: string;
  /** Matches main page light/dark so drawer tokens follow forced light mode */
  appearanceClass?: string;
  /** Logged-in account profile (`GET .../user?expand=family`) for prefill + fallbacks */
  bondProfile?: BondUserDto;
  /** Primary (logged-in) Bond user id — used when the booking target has no email/phone/etc. */
  primaryAccountUserId: number;
  /** `checkout` = add-ons → … → create; `bag` = browse session carts (FAB) without building a new booking. */
  mode?: "checkout" | "bag";
  /** When `mode === "bag"`, rows to show (from parent session state). */
  bagSnapshots?: SessionCartSnapshot[];
  /**
   * Remove one bag line (`line`) or a whole reservation subsection (`subsection` — rental + its add-ons).
   * Required membership lines do not receive `bagRemove` in the UI.
   */
  onRemoveBagLine?: (ctx: {
    index: number;
    cartFlatLineIndices?: number[];
    remove: BagRemovePolicy;
  }) => void | Promise<void>;
  /** Portal category `settings.approvalRequired` — checkout step shows Submit request vs Pay now. */
  approvalRequired?: boolean;
  /**
   * Called as soon as `finalizeCart` succeeds — parent should clear session cart, slot selection,
   * and refresh schedule so the drawer can show confirmation without cart lines underneath.
   */
  onFinalizeBookingSuccess?: (finalizedSlotKeys: string[]) => void;
  /** Shown in user-facing eligibility errors (e.g. product reserved for specific clients). */
  orgDisplayName?: string;
  /** Opens family picker so the user can switch who the booking is for (re-fetches required products). */
  onBookingForClick?: () => void;
  /** When set, `POST …/create` includes `cartId` so Bond appends to an existing cart (e.g. after “Add another booking”). */
  mergeCartId?: number;
  /** After a successful add (or approval-only handoff), parent can switch to bag instead of an “Added to cart” step. */
  onAddedToCart?: () => void;
  /** “Book another rental” on post–add-to-cart (close handoff, keep cart; parent usually closes drawer). */
  onBookAnotherRental?: () => void;
  /** From payment, go back to bag (parent sets `mode` to `"bag"`). */
  onBackFromPayment?: () => void;
  /** Bag footer: continue to payment inside checkout flow. */
  onRequestBagCheckout?: () => void;
  /** From “Review & add to cart” when the tab already has saved cart rows — open bag view without closing the drawer. */
  onGoToCart?: () => void;
  /**
   * When true, sync step shows “Go to cart” (e.g. user returned here via Back from payment). Hidden on a fresh
   * “add another booking” flow so primary actions stay Back + Add to cart only.
   */
  showGoToCartOnSyncStep?: boolean;
  /** After the user dismisses the post-payment confirmation — parent may clear any leftover session cart (safety net). */
  onBookingConfirmedDismiss?: () => void;
  /** When opening checkout at a specific step (e.g. `payment` after bag “Checkout”). Cleared after apply. */
  navigateToCheckoutStep?: CheckoutStep | null;
  onClearNavigateToCheckoutStep?: () => void;
  /**
   * When true, the booking-for user already satisfies required membership (per GET …/required) — do not force
   * the membership step or add a membership line for them.
   */
  requiredMembershipAlreadySatisfied?: boolean;
  /** After addons, lock “booking for” so membership/forms aren’t invalidated by switching participants. */
  onParticipantLockChange?: (locked: boolean) => void;
  /** Remove optional add-on selections Bond marks as already satisfied (`required: false`). */
  onPruneSatisfiedAddonProductIds?: (productIds: number[]) => void;
  /** Booking-review (syncCart) — remove a draft slot by its key. */
  onRemoveSlot?: (slotKey: string) => void;
  /** Booking-review (syncCart) — remove a reservation-level add-on by its product id. */
  onRemoveReservationAddon?: (addonId: number) => void;
};

/** Outlined info-circle for the totals-box callouts (deposit + approval notes). */
function TotalsBoxNoteInfoIcon() {
  return (
    <svg
      className="cb-co-totals-box-note-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function PaymentPlaceholderField({
  label,
  placeholder,
  required,
  icon,
}: {
  label: string;
  placeholder: string;
  required?: boolean;
  icon?: "card";
}) {
  return (
    <label className="cb-payment-method-modal-field">
      <span className="cb-payment-method-modal-label">
        {label}
        {required ? <span className="cb-payment-method-modal-required"> *</span> : null}
      </span>
      <span className="cb-payment-method-modal-input">
        {icon === "card" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        ) : null}
        <span>{placeholder}</span>
      </span>
    </label>
  );
}

export function BookingCheckoutDrawer({
  open,
  onClose,
  orgId,
  portalId,
  facilityId,
  categoryId,
  productId,
  productName,
  activity,
  product,
  userId,
  pickedSlots,
  selectedAddonIds,
  addonQuantities,
  onSetAddonQty,
  addonSlotQuantities,
  onSetAddonSlotQty,
  questionnaireIds,
  onSuccess,
  onSubmittingChange,
  packageAddons,
  productCatalogPending = false,
  addonsExpanded,
  onToggleExpandAddons,
  addonSlotTargeting,
  onToggleAddon,
  onAddonSelectAllSlots,
  onToggleAddonSlot,
  formatPrice,
  bookingForLabel,
  bookingForBadge,
  appearanceClass = "",
  bondProfile,
  primaryAccountUserId,
  mode = "checkout",
  bagSnapshots = [],
  onRemoveBagLine,
  approvalRequired = false,
  onFinalizeBookingSuccess,
  orgDisplayName,
  onBookingForClick,
  mergeCartId,
  onAddedToCart,
  onBookAnotherRental,
  onBackFromPayment,
  onRequestBagCheckout,
  onGoToCart,
  showGoToCartOnSyncStep = false,
  onBookingConfirmedDismiss,
  navigateToCheckoutStep,
  onClearNavigateToCheckoutStep,
  requiredMembershipAlreadySatisfied = false,
  onParticipantLockChange,
  onPruneSatisfiedAddonProductIds,
  onRemoveSlot,
  onRemoveReservationAddon,
}: Props) {
  const tx = useTranslations("checkout");
  const tAddons = useTranslations("addons");
  const te = useTranslations("errors");
  const tc = useTranslations("common");
  const tb = useTranslations("booking");
  const [step, setStep] = useState<CheckoutStep>(() =>
    packageAddons.length > 0 ? "addons" : "membership"
  );
  const [requiredSelected, setRequiredSelected] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // extrasCollapsed removed — drawer addon step uses BookingAddonPanel directly (matches portal)
  const [lastCart, setLastCart] = useState<OrganizationCartDto | null>(null);
  /** When category requires approval: user skipped API on "Add to cart"; create runs on payment "Submit request". */
  const [approvalDeferred, setApprovalDeferred] = useState(false);
  /** After `POST …/create` succeeds, show confirmation + summary before jumping to payment (Figma-style handoff). */
  /** After `finalizeCart` succeeds — show confirmation (invoice / reservation) before parent clears session. */
  const [finalizeSuccess, setFinalizeSuccess] = useState<FinalizeSuccessDisplay | null>(null);
  /** Which submit button triggered the in-flight mutation — "full" or "deposit". */
  const [submitKind, setSubmitKind] = useState<"full" | "deposit" | null>(null);
  const [customAmountInput, setCustomAmountInput] = useState<string>("");
  const [paymentModal, setPaymentModal] = useState<"card" | "bank" | null>(null);
  /** `submit` = venue approval flow (no invoice row); `pay` = paid / standard finalize. */
  const [finalizeCheckoutKind, setFinalizeCheckoutKind] = useState<"pay" | "submit" | null>(null);
  const finalizeCheckoutKindRef = useRef<"pay" | "submit">("pay");
  const bagPolicyCheckoutRef = useRef<BagApprovalPolicy>("all_pay");
  const [finalizeCopyFlash, setFinalizeCopyFlash] = useState<"invoice" | "reservations" | null>(null);
  /** Snapshot at finalize so dismiss still has slot keys if parent clears bag state early. */
  const finalizeReservedSlotKeysRef = useRef<string[]>([]);
  /** Membership OR-options from `GET .../products/.../required` (OpenAPI `ExtendedRequiredProductDto[]`). */
  const [selectedMembershipRootId, setSelectedMembershipRootId] = useState<number | null>(null);
  const [membershipSelectionResolved, setMembershipSelectionResolved] = useState(false);
  /** Selected Bond payment instrument id (consumer payment options API). */
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  /** Keys of bag dcard items currently being removed (shows spinner, disables all delete buttons). */
  const [removingBagKeys, setRemovingBagKeys] = useState<ReadonlySet<string>>(new Set());
  const selectedPaymentMethodIdRef = useRef<string | null>(null);
  selectedPaymentMethodIdRef.current = selectedPaymentMethodId;
  /** Latest cart total for `POST …/finalize` (`amountToPay`) — mutation runs before later hooks otherwise. */
  const estimatedAmountDueRef = useRef<number | null>(null);
  const checkoutModeRef = useRef(mode);
  checkoutModeRef.current = mode;
  const drawerWasOpen = useRef(false);
  /** After `navigateToCheckoutStep` applies, skip the next full checkout reset (parent clears navigate in the same tick). */
  const skipNextCheckoutResetRef = useRef(false);
  /** Synced after `firstCheckoutStep` is computed — open-reset effect reads this so step matches forms/syncCart when needed. */
  const firstCheckoutStepRef = useRef<CheckoutStep>("addons");
  /** Track which product the current `answers` belong to — only clear when product changes or after finalize. */
  const answersProductIdRef = useRef<number>(productId);
  /** Set after finalize succeeds so next re-open clears answers even for the same product. */
  const answersStaleAfterFinalizeRef = useRef(false);
  /** Must not be a hook dependency — unstable parent lambdas retriggered the effect every render and reset step to addons. */
  const onClearNavigateRef = useRef(onClearNavigateToCheckoutStep);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const approvalRequiredPropRef = useRef(approvalRequired);
  approvalRequiredPropRef.current = approvalRequired;

  const currency = product?.prices[0]?.currency ?? "USD";

  const paymentOptionsQuery = useQuery({
    queryKey: ["bond", "consumer-payment-options", orgId, primaryAccountUserId],
    queryFn: () => fetchConsumerPaymentOptions(orgId, primaryAccountUserId),
    enabled:
      open &&
      orgId > 0 &&
      primaryAccountUserId > 0 &&
      (mode === "bag" || (mode === "checkout" && step === "payment")),
  });

  const paymentChoices = useMemo(
    () => flattenConsumerPaymentChoices(paymentOptionsQuery.data ?? []),
    [paymentOptionsQuery.data]
  );
  const paymentChoicesRef = useRef(paymentChoices);
  paymentChoicesRef.current = paymentChoices;

  useEffect(() => {
    if (!open) return;
    if (paymentChoices.length === 0) return;
    if (mode === "bag" || (mode === "checkout" && step === "payment")) {
      setSelectedPaymentMethodId((prev) => {
        if (prev != null && paymentChoices.some((p) => p.id === prev)) return prev;
        return paymentChoices[0]!.id;
      });
    }
  }, [open, step, mode, paymentChoices]);

  useEffect(() => {
    if (!open) return;
    if (mode === "bag") return;
    if (navigateToCheckoutStep != null) {
      setStep(navigateToCheckoutStep);
      skipNextCheckoutResetRef.current = true;
      onClearNavigateRef.current?.();
      return;
    }
    if (skipNextCheckoutResetRef.current) {
      skipNextCheckoutResetRef.current = false;
      return;
    }
    setStep(firstCheckoutStepRef.current);
    // Only wipe answers when the product changed or after a completed booking — preserve them across close/edit-slots
    if (answersProductIdRef.current !== productId || answersStaleAfterFinalizeRef.current) {
      setAnswers({});
      answersProductIdRef.current = productId;
      answersStaleAfterFinalizeRef.current = false;
    }
    setRequiredSelected(new Set());
    setLastCart(null);
    setApprovalDeferred(false);
    setSelectedMembershipRootId(null);
    setMembershipSelectionResolved(false);
    setSelectedPaymentMethodId(null);
    setFinalizeSuccess(null);
    setFinalizeCheckoutKind(null);
  }, [open, productId, mode, navigateToCheckoutStep]);

  /** Switching “booking for” re-fetches required products; clear membership selection for the new person. */
  const bookingForUserIdRef = useRef(userId);
  useEffect(() => {
    if (bookingForUserIdRef.current === userId) return;
    bookingForUserIdRef.current = userId;
    if (!open || mode !== "checkout") return;
    setMembershipSelectionResolved(false);
    setSelectedMembershipRootId(null);
    setRequiredSelected(new Set());
  }, [userId, open, mode]);

  useEffect(() => {
    if (open && !drawerWasOpen.current) {
      // extrasCollapsed removed
    }
    drawerWasOpen.current = open;
  }, [open, selectedAddonIds, packageAddons]);

  /**
   * `GET …/products/{productId}/required` for the **booking-for** user — Bond omits SKUs they already hold
   * (e.g. active membership). Gating / entitlements on slots use product + schedule; per-user advance windows
   * come from category + schedule APIs elsewhere, not re-derived here.
   */
  const requiredQuery = useQuery({
    queryKey: ["bond", "requiredProducts", orgId, productId, userId],
    queryFn: () => fetchUserRequiredProducts(orgId, productId, userId),
    enabled:
      mode === "checkout" &&
      open &&
      step !== "payment" &&
      (step === "addons" || step === "membership" || step === "forms"),
  });

  const extendedRequiredList = useMemo(
    () => parseExtendedRequiredProductsList(requiredQuery.data),
    [requiredQuery.data]
  );

  /** GET …/required marks satisfied SKUs `required: false` — we strip them from checkout UI but Bond create still needs them on `requiredProducts` (with `userId`). */
  const requiredProductLineItemsForBond = useMemo(() => {
    const satisfied = collectSatisfiedRequiredProductIds(extendedRequiredList);
    const ids = new Set<number>([...requiredSelected, ...satisfied]);
    return [...ids].map((productId) => {
      const unit = unitPriceForRequiredProductInTree(extendedRequiredList, productId);
      return {
        productId,
        ...(unit !== undefined && Number.isFinite(unit) ? { unitPrice: unit } : {}),
      };
    });
  }, [requiredSelected, extendedRequiredList]);

  const requiredIdsForBond = useMemo(
    () => requiredProductLineItemsForBond.map((x) => x.productId),
    [requiredProductLineItemsForBond]
  );

  const { membershipOptions, otherRequired } = useMemo(() => {
    if (extendedRequiredList.length > 0) {
      const p = partitionMembershipVsOtherRequired(extendedRequiredList);
      const keep = (n: ExtendedRequiredProductNode) => n.required !== false;
      return {
        membershipOptions: p.membershipOptions.filter(keep),
        otherRequired: p.otherRequired.filter(keep),
      };
    }
    const legacy = parseRequiredProductsResponse(requiredQuery.data);
    const toNode = (r: RequiredProductRow): ExtendedRequiredProductNode => ({
      id: r.id,
      name: r.name,
      productType: r.productType,
      required: r.required,
      prices:
        r.displayPrice != null
          ? [
              {
                price: r.displayPrice.amount,
                currency: r.displayPrice.currency,
                name: r.displayPrice.label,
              },
            ]
          : undefined,
    });
    const membershipFromLegacy: ExtendedRequiredProductNode[] = [];
    const otherFromLegacy: ExtendedRequiredProductNode[] = [];
    for (const r of legacy) {
      if (r.required === false) continue;
      const n = toNode(r);
      if (isMembershipRequiredProduct(n)) membershipFromLegacy.push(n);
      else otherFromLegacy.push(n);
    }
    return {
      membershipOptions: membershipFromLegacy,
      otherRequired: otherFromLegacy,
    };
  }, [extendedRequiredList, requiredQuery.data]);

  const hasAddonsStep =
    packageAddons.length > 0 ||
    otherRequired.length > 0 ||
    (productCatalogPending && productId > 0);

  const pruneSatisfiedAddonsRef = useRef(onPruneSatisfiedAddonProductIds);

  /** Bond marks satisfied SKUs with `required: false` — drop them from checkout selections. */
  useEffect(() => {
    if (!requiredQuery.isSuccess || requiredQuery.data === undefined) return;
    const extended = parseExtendedRequiredProductsList(requiredQuery.data);
    const satisfied = collectSatisfiedRequiredProductIds(extended);
    if (satisfied.size === 0) return;
    setRequiredSelected((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of satisfied) {
        if (next.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    pruneSatisfiedAddonsRef.current?.([...satisfied]);
  }, [requiredQuery.isSuccess, requiredQuery.data]);

  /** Membership SKUs to show in checkout — empty when the participant already holds required membership. */
  const membershipOptionsForStep = useMemo(
    () => (requiredMembershipAlreadySatisfied ? [] : membershipOptions),
    [requiredMembershipAlreadySatisfied, membershipOptions]
  );

  const membershipRequirementsLoading = useMemo(
    () =>
      productMembershipGated(product) &&
      !requiredMembershipAlreadySatisfied &&
      requiredQuery.isPending,
    [product, requiredMembershipAlreadySatisfied, requiredQuery.isPending]
  );

  /**
   * Include a membership leg while GET …/required is in flight (no add-ons step) so we don’t jump to forms/summary
   * before membership SKUs are known. Also covers gated products explicitly.
   */
  const hasMembershipStep =
    membershipOptionsForStep.length > 0 ||
    membershipRequirementsLoading ||
    (!hasAddonsStep && requiredQuery.isPending);

  useEffect(() => {
    if (requiredMembershipAlreadySatisfied) {
      setMembershipSelectionResolved(true);
    }
  }, [requiredMembershipAlreadySatisfied]);

  /** If eligibility flips while on the membership step, advance — options list is empty. */
  useEffect(() => {
    if (!open || mode !== "checkout") return;
    if (!requiredMembershipAlreadySatisfied) return;
    if (step !== "membership") return;
    setStep(questionnaireIds.length > 0 ? "forms" : "syncCart");
  }, [open, mode, requiredMembershipAlreadySatisfied, step, questionnaireIds.length]);

  /** `/required` arrived late after user skipped ahead — force membership before persisting the cart. */
  useEffect(() => {
    if (!open || mode !== "checkout") return;
    if (requiredQuery.isPending) return;
    if (membershipOptionsForStep.length === 0) return;
    if (membershipSelectionResolved) return;
    if (step !== "forms" && step !== "syncCart") return;
    setStep("membership");
  }, [
    open,
    mode,
    requiredQuery.isPending,
    membershipOptionsForStep.length,
    membershipSelectionResolved,
    step,
  ]);

  /** Flat list for payment / approval synthetic lines (nested required product ids + catalog prices when Bond sends them). */
  const allRequiredFlat: RequiredProductRow[] = useMemo(() => {
    const out: RequiredProductRow[] = [];
    function walk(nodes: ExtendedRequiredProductNode[]) {
      for (const n of nodes) {
        if (n.required === false) continue;
        const pl = primaryListPrice(n);
        out.push({
          id: n.id,
          name: n.name,
          productType: n.productType,
          displayPrice: pl
            ? { amount: pl.amount, currency: pl.currency, label: pl.label }
            : undefined,
        });
        if (n.requiredProducts && n.requiredProducts.length > 0) walk(n.requiredProducts);
      }
    }
    walk(extendedRequiredList);
    if (out.length > 0) return out;
    return parseRequiredProductsResponse(requiredQuery.data).filter((r) => r.required !== false);
  }, [extendedRequiredList, requiredQuery.data]);

  /** Membership SKUs from the currently selected plan — included in synthetic totals before Continue. */
  const selectedMembershipNestedIds = useMemo(() => {
    if (selectedMembershipRootId == null) return null;
    const root = membershipOptionsForStep.find((o) => o.id === selectedMembershipRootId);
    if (!root) return null;
    return new Set(collectProductAndNestedIds(root));
  }, [selectedMembershipRootId, membershipOptionsForStep]);

  useEffect(() => {
    if (step !== "membership" || membershipOptionsForStep.length !== 1) return;
    if (selectedMembershipRootId == null) {
      setSelectedMembershipRootId(membershipOptionsForStep[0]!.id);
    }
  }, [step, membershipOptionsForStep, selectedMembershipRootId]);

  const questionnaireFetchSteps =
    step === "addons" || step === "forms" || step === "membership";

  const publicQuestionnaireQueries = useQueries({
    queries: questionnaireIds.map((qid) => ({
      queryKey: ["bond", "questionnaire", orgId, qid],
      queryFn: () => fetchPublicQuestionnaireById(orgId, qid),
      enabled:
        mode === "checkout" &&
        open &&
        questionnaireIds.length > 0 &&
        step !== "payment" &&
        questionnaireFetchSteps,
    })),
  });

  const checkoutQuestionnairesQuery = useQuery({
    queryKey: ["bond", "checkoutQuestionnaires", orgId, userId, questionnaireIds],
    queryFn: () => fetchCheckoutQuestionnaires(orgId, userId, questionnaireIds),
    enabled:
      mode === "checkout" &&
      open &&
      questionnaireIds.length > 0 &&
      step !== "payment" &&
      questionnaireFetchSteps,
  });

  const hasFormsStep = questionnaireIds.length > 0;

  const firstCheckoutStep = useMemo((): CheckoutStep => {
    if (hasAddonsStep) return "addons";
    if (hasMembershipStep) return "membership";
    if (hasFormsStep) return "forms";
    return "syncCart";
  }, [hasAddonsStep, hasMembershipStep, hasFormsStep]);

  useLayoutEffect(() => {
    onClearNavigateRef.current = onClearNavigateToCheckoutStep;
    pruneSatisfiedAddonsRef.current = onPruneSatisfiedAddonProductIds;
    firstCheckoutStepRef.current = firstCheckoutStep;
  }, [onClearNavigateToCheckoutStep, onPruneSatisfiedAddonProductIds, firstCheckoutStep]);

  /** When the drawer closes, drop back to the first checkout step so the next open isn’t stuck on sync/payment after the bag. */
  useEffect(() => {
    if (open) return;
    setStep(firstCheckoutStep);
  }, [open, firstCheckoutStep]);

  const preCheckoutSteps = useMemo(() => {
    const s: CheckoutStep[] = [];
    if (hasAddonsStep) s.push("addons");
    if (hasMembershipStep) s.push("membership");
    if (hasFormsStep) s.push("forms");
    return s;
  }, [hasAddonsStep, hasMembershipStep, hasFormsStep]);

  const totalPreSteps = preCheckoutSteps.length;

  const currentPreStepNumber = useMemo(() => {
    if (step === "payment" || step === "addedToCart") return 0;
    if (step === "syncCart") return totalPreSteps > 0 ? totalPreSteps : 0;
    const i = preCheckoutSteps.indexOf(step);
    if (i >= 0) return i + 1;
    return 1;
  }, [step, preCheckoutSteps, totalPreSteps]);

  useEffect(() => {
    if (!open) {
      onParticipantLockChange?.(false);
      return;
    }
    if (mode === "bag") {
      onParticipantLockChange?.(false);
      return;
    }
    const firstCheckoutStep: CheckoutStep = hasAddonsStep
      ? "addons"
      : membershipOptionsForStep.length > 0
        ? "membership"
        : questionnaireIds.length > 0
          ? "forms"
          : "syncCart";
    const participantLocked = !(step === firstCheckoutStep && firstCheckoutStep !== "syncCart");
    onParticipantLockChange?.(participantLocked);
  }, [
    open,
    mode,
    step,
    onParticipantLockChange,
    hasAddonsStep,
    membershipOptionsForStep.length,
    questionnaireIds.length,
  ]);

  /** Required-only lines arrived after first paint — need the add-ons step to confirm them. */
  useEffect(() => {
    if (!open || mode !== "checkout") return;
    if (packageAddons.length > 0) return;
    if (otherRequired.length === 0) return;
    if (step !== "membership") return;
    setStep("addons");
  }, [open, mode, packageAddons.length, otherRequired.length, step]);

  /** Never stay on the add-ons step when there is nothing to confirm there. */
  useEffect(() => {
    if (!open || mode !== "checkout") return;
    if (step !== "addons" || hasAddonsStep) return;
    setStep(
      membershipOptionsForStep.length > 0
        ? "membership"
        : questionnaireIds.length > 0
          ? "forms"
          : "syncCart"
    );
  }, [open, mode, step, hasAddonsStep, membershipOptionsForStep.length, questionnaireIds.length]);

  const preCheckoutStepLabel = useMemo(() => {
    if (step === "payment" || step === "addedToCart") return "";
    if (totalPreSteps < 1) return "";
    if (currentPreStepNumber < 1) return "";
    return `Step ${currentPreStepNumber} of ${totalPreSteps}`;
  }, [step, currentPreStepNumber, totalPreSteps]);

  const mergedForms = useMemo(() => {
    const checkoutData = checkoutQuestionnairesQuery.data?.data;
    return questionnaireIds.map((qid, idx) => {
      const pub = publicQuestionnaireQueries[idx]?.data as Record<string, unknown> | undefined;
      const chk = Array.isArray(checkoutData)
        ? (checkoutData.find((x) => x && typeof x === "object" && (x as { id?: number }).id === qid) as
            | Record<string, unknown>
            | undefined)
        : undefined;
      const title =
        (chk && typeof chk.title === "string" && chk.title) ||
        (pub && typeof pub.title === "string" && pub.title) ||
        `Form ${qid}`;
      const questions = mergeQuestionnaireQuestions(qid, chk, pub);
      const isWaiverFlag =
        chk && typeof chk === "object" && typeof (chk as { isWaiver?: unknown }).isWaiver === "boolean"
          ? (chk as { isWaiver: boolean }).isWaiver
          : false;
      const isWaiverForm =
        isWaiverFlag || questions.some((q) => q.kind === "waiver" || q.kind === "terms");
      return { qid, title, questions, isWaiverForm };
    });
  }, [questionnaireIds, publicQuestionnaireQueries, checkoutQuestionnairesQuery.data]);

  const contactSnap = useMemo(
    () => bookingContactSnapshot(bondProfile, userId, primaryAccountUserId),
    [bondProfile, userId, primaryAccountUserId]
  );

  const presummaryParticipantDemo = useMemo(() => {
    const person = findProfilePersonById(bondProfile, userId);
    if (!person) return undefined;
    return participantDemographicsLine(person);
  }, [bondProfile, userId]);

  const presummaryParticipantPhoto = useMemo(() => {
    const person = findProfilePersonById(bondProfile, userId);
    return profilePhotoUrlFromUser(person ?? undefined);
  }, [bondProfile, userId]);

  useEffect(() => {
    if (!open || step !== "forms") return;
    if (mergedForms.length === 0) return;
    /** Wait until at least one questionnaire has loaded questions (avoid one-shot prefill before public/checkout merges). */
    if (!mergedForms.some((f) => f.questions.length > 0)) return;
    setAnswers((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const form of mergedForms) {
        for (const q of form.questions) {
          const key = `${form.qid}:${q.id}`;
          if ((next[key] ?? "").trim().length > 0) continue;
          let fill = "";
          if (q.kind === "email") fill = contactSnap.email;
          else if (q.kind === "tel") fill = contactSnap.phone;
          else if (q.kind === "date") fill = contactSnap.birthDate;
          else if (q.kind === "address") fill = contactSnap.address;
          else if (q.kind === "select" && contactSnap.gender) {
            const m = matchGenderToSelectValue(contactSnap.gender, q.options);
            if (m) fill = m;
          } else if (q.kind === "text" && contactSnap.gender && labelSuggestsGender(q.label)) {
            fill = contactSnap.gender;
          } else if (q.kind === "waiver" && q.profileWaiverEligible === true && contactSnap.waiverSignedDate) {
            fill = "true";
          }
          if (fill) {
            next[key] = fill;
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [open, step, mergedForms, contactSnap]);

  const showPrefillHint = useCallback(
    (q: NormalizedQuestion, current: string): boolean => {
      if (q.kind === "email" && contactSnap.email && current === contactSnap.email) return true;
      if (q.kind === "tel" && contactSnap.phone && current === contactSnap.phone) return true;
      if (q.kind === "date" && contactSnap.birthDate && current === contactSnap.birthDate) return true;
      if (q.kind === "address" && contactSnap.address && current === contactSnap.address) return true;
      if (q.kind === "select" && contactSnap.gender && q.options.length > 0) {
        const m = matchGenderToSelectValue(contactSnap.gender, q.options);
        if (m && current === m) return true;
      }
      if (q.kind === "text" && contactSnap.gender && labelSuggestsGender(q.label) && current === contactSnap.gender) {
        return true;
      }
      if (q.kind === "waiver" && q.profileWaiverEligible === true && contactSnap.waiverSignedDate && current === "true")
        return true;
      return false;
    },
    [contactSnap]
  );

  const formsValid = useMemo(() => {
    for (const form of mergedForms) {
      if (!isFormQuestionsSatisfied(form.questions, answers, form.qid)) return false;
    }
    return true;
  }, [mergedForms, answers]);

  const questionnairesLoaded = useMemo(() => {
    if (questionnaireIds.length === 0) return true;
    if (publicQuestionnaireQueries.some((q) => q.isPending)) return false;
    if (checkoutQuestionnairesQuery.isPending) return false;
    return true;
  }, [questionnaireIds.length, publicQuestionnaireQueries, checkoutQuestionnairesQuery.isPending]);

  const hasRenderableFormQuestions = useMemo(
    () => mergedForms.some((f) => f.questions.length > 0),
    [mergedForms]
  );

  /** `POST …/create` must not run until questionnaires are loaded and any required answers are present. */
  const canBondPersistCart = useMemo(
    () =>
      questionnairesLoaded &&
      (!hasFormsStep || !hasRenderableFormQuestions || formsValid),
    [questionnairesLoaded, hasFormsStep, hasRenderableFormQuestions, formsValid]
  );

  const buildCreatePayload = useCallback((includeCartMerge: boolean): Record<string, unknown> => {
    const perQuestion: Array<{ questionId: number; value: string }> = [];
    for (const key of Object.keys(answers)) {
      const parts = key.split(":");
      if (parts.length < 2) continue;
      const questionnaireId = Number(parts[0]);
      const questionId = Number(parts[1]);
      if (!Number.isFinite(questionnaireId) || !Number.isFinite(questionId)) continue;
      const raw = answers[key];
      const value =
        raw === undefined || raw === null
          ? ""
          : typeof raw === "string"
            ? raw
            : String(raw);
      perQuestion.push({ questionId, value });
    }

    const expandedAddonIds: number[] = [];
    for (const id of selectedAddonIds) {
      const qty = Math.max(1, addonQuantities?.get(id) ?? 1);
      for (let i = 0; i < qty; i++) expandedAddonIds.push(id);
    }
    const { topLevel, perSegment } = splitAddonPayloadForCreate({
      pickedSlots,
      selectedAddonIds: expandedAddonIds,
      requiredSelected: requiredIdsForBond,
      packageAddons,
      addonSlotTargeting,
    });
    const hasSegmentAddons = perSegment.some((a) => a.length > 0);

    return buildOnlineBookingCreateBody({
      userId,
      portalId,
      categoryId,
      activity,
      facilityId,
      productId,
      product,
      packageAddons,
      slots: pickedSlots,
      addonProductIds: topLevel.length > 0 ? topLevel : undefined,
      segmentAddonProductIds: hasSegmentAddons ? perSegment : undefined,
      answers:
        perQuestion.length > 0
          ? [
              {
                userId,
                answers: perQuestion,
              },
            ]
          : undefined,
      cartId:
        includeCartMerge && mergeCartId != null && mergeCartId > 0 ? mergeCartId : undefined,
      /**
       * Merging into `cartId`: omit `requiredProducts`. Bond already holds membership / required SKUs from the
       * first reservation; resending them reprices duplicate lines and often yields ILLEGAL_PRICE or similar.
       */
      requiredProductLineItems:
        includeCartMerge || requiredProductLineItemsForBond.length === 0
          ? undefined
          : requiredProductLineItemsForBond,
    });
  }, [
    answers,
    selectedAddonIds,
    addonQuantities,
    requiredIdsForBond,
    requiredProductLineItemsForBond,
    packageAddons,
    addonSlotTargeting,
    userId,
    portalId,
    categoryId,
    activity,
    facilityId,
    productId,
    product,
    pickedSlots,
    mergeCartId,
  ]);

  /** Session already has carts but we have no Bond cart id to merge into — block add until storage is fixed or cleared. */
  const cannotMergeSessionCart = useMemo(
    () => bagSnapshots.length > 0 && (mergeCartId == null || mergeCartId <= 0),
    [bagSnapshots.length, mergeCartId]
  );

  const persistCartMutation = useMutation({
    mutationFn: () =>
      postOnlineBookingCreate(orgId, buildCreatePayload(mergeCartId != null && mergeCartId > 0)),
    onSuccess: (cart) => {
      setLastCart(cart);
      if (approvalRequiredPropRef.current) setApprovalDeferred(true);
      if (cart != null) onSuccessRef.current(cart);
      if (checkoutModeRef.current === "checkout") {
        setStep("addedToCart");
      }
      queueMicrotask(() => {
        onAddedToCart?.();
      });
    },
  });

  const dismissBookingConfirmed = useCallback(() => {
    finalizeReservedSlotKeysRef.current = [];
    setFinalizeSuccess(null);
    setFinalizeCheckoutKind(null);
    setFinalizeCopyFlash(null);
    onBookingConfirmedDismiss?.();
    onClose();
  }, [onBookingConfirmedDismiss, onClose]);

  const copyFinalizeClipboard = useCallback(async (value: string, kind: "invoice" | "reservations") => {
    try {
      await navigator.clipboard.writeText(value);
      setFinalizeCopyFlash(kind);
      window.setTimeout(() => setFinalizeCopyFlash(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const persistBondCartErrorText = useMemo(() => {
    if (!persistCartMutation.isError || persistCartMutation.error == null) return null;
    if (persistCartMutation.isPending) return null;
    return formatConsumerBookingErrorUnknown(persistCartMutation.error, te, {
      customerLabel: bookingForLabel,
      orgName: orgDisplayName,
      productName,
    });
  }, [
    persistCartMutation.isError,
    persistCartMutation.isPending,
    persistCartMutation.error,
    bookingForLabel,
    orgDisplayName,
    productName,
    te,
  ]);

  const persistBondCart = useCallback(() => {
    if (persistCartMutation.isPending) return;
    if (cannotMergeSessionCart) return;
    if (!canBondPersistCart || pickedSlots.length === 0) return;
    persistCartMutation.mutate();
  }, [
    persistCartMutation,
    cannotMergeSessionCart,
    canBondPersistCart,
    pickedSlots.length,
  ]);

  const prevCheckoutOpenRef = useRef(false);
  useEffect(() => {
    const prev = prevCheckoutOpenRef.current;
    prevCheckoutOpenRef.current = open;
    if (open && !prev && mode === "checkout") persistCartMutation.reset();
  }, [open, mode, persistCartMutation]);

  const persistCartUserIdRef = useRef(userId);
  useEffect(() => {
    if (persistCartUserIdRef.current !== userId) {
      persistCartUserIdRef.current = userId;
      persistCartMutation.reset();
    }
  }, [userId, persistCartMutation]);

  const submitBookingRequestMutation = useMutation({
    mutationFn: async (overrideAmount?: number) => {
      const cartId = resolveFinalizeCartId(bagSnapshots, lastCart, mergeCartId);
      if (cartId == null) {
        throw new BondBffError(400, "No cart to finalize", null);
      }
      const body: Record<string, unknown> = {};
      const pmSel = selectedPaymentMethodIdRef.current;
      const choice = paymentChoicesRef.current.find((c) => c.id === pmSel);
      if (choice != null) {
        body.paymentMethodId = choice.finalizePaymentMethodId;
      }
      if (overrideAmount != null && overrideAmount > 0) {
        body.amountToPay = overrideAmount;
      } else {
        const freshCart = await getOrganizationCart(orgId, cartId);
        const combinedApprovalMap: Record<number, boolean> = {};
        for (const row of bagSnapshots) {
          if (row.approvalByProductId) Object.assign(combinedApprovalMap, row.approvalByProductId);
        }
        let amount = bondCartPayableTotalForFinalize(freshCart, combinedApprovalMap);
        if (amount == null || amount <= 0) {
          const ui = estimatedAmountDueRef.current;
          if (ui != null && Number.isFinite(ui) && ui > 0) {
            amount = Math.round(ui * 100) / 100;
          }
        }
        if (amount != null && amount > 0) {
          body.amountToPay = amount;
        }
      }
      return finalizeCart(orgId, cartId, body);
    },
    onMutate: () => {
      finalizeCheckoutKindRef.current =
        bagPolicyCheckoutRef.current === "all_submission" ? "submit" : "pay";
      finalizeReservedSlotKeysRef.current = bagSnapshots.flatMap((r) => r.reservedSlotKeys ?? []);
    },
    onSuccess: (data) => {
      const keys = [...finalizeReservedSlotKeysRef.current];
      onFinalizeBookingSuccess?.(keys);
      setLastCart(null);
      setApprovalDeferred(false);
      setFinalizeCheckoutKind(finalizeCheckoutKindRef.current);
      setFinalizeSuccess(parseFinalizeCartResponse(data));
      answersStaleAfterFinalizeRef.current = true;
    },
    onSettled: () => {
      setSubmitKind(null);
    },
  });

  const requestBookingSubmit = useCallback(() => {
    if (submitBookingRequestMutation.isPending) return;
    setSubmitKind("full");
    submitBookingRequestMutation.mutate(undefined);
  }, [submitBookingRequestMutation]);

  useEffect(() => {
    const persistBusy = mode === "checkout" && open && persistCartMutation.isPending;
    onSubmittingChange?.(submitBookingRequestMutation.isPending || persistBusy);
  }, [
    mode,
    open,
    persistCartMutation.isPending,
    submitBookingRequestMutation.isPending,
    onSubmittingChange,
  ]);

  /** Non-membership required rows only — membership is handled on the next step when needed. */
  const canProceedAddons = useMemo(() => {
    return otherRequired.length === 0 || otherRequired.every((r) => requiredSelected.has(r.id));
  }, [otherRequired, requiredSelected]);

  const packageAddonsVisible = addonsExpanded ? packageAddons : packageAddons.slice(0, ADDONS_PAGE);

  const goNextFromAddons = useCallback(() => {
    if (!canProceedAddons) return;
    if (requiredQuery.isPending) return;
    if (membershipOptionsForStep.length > 0 && !membershipSelectionResolved) {
      setStep("membership");
      return;
    }
    if (questionnaireIds.length > 0) setStep("forms");
    else setStep("syncCart");
  }, [
    canProceedAddons,
    requiredQuery.isPending,
    membershipOptionsForStep.length,
    membershipSelectionResolved,
    questionnaireIds.length,
  ]);

  const handleMembershipConfirm = useCallback(() => {
    if (membershipOptionsForStep.length === 0) {
      setMembershipSelectionResolved(true);
      if (questionnaireIds.length > 0) setStep("forms");
      else setStep("syncCart");
      return;
    }
    const root = membershipOptionsForStep.find((o) => o.id === selectedMembershipRootId);
    if (!root) return;
    const ids = collectProductAndNestedIds(root);
    setRequiredSelected((prev) => {
      const n = new Set(prev);
      for (const id of ids) n.add(id);
      return n;
    });
    setMembershipSelectionResolved(true);
    if (questionnaireIds.length > 0) setStep("forms");
    else setStep("syncCart");
  }, [membershipOptionsForStep, selectedMembershipRootId, questionnaireIds.length]);

  const goNextFromForms = useCallback(() => {
    if (!formsValid) return;
    setStep("syncCart");
  }, [formsValid]);

  const checkoutFlowFlags = useMemo<FlowFlags>(
    () => ({
      hasAddonsStep,
      hasMembershipStep,
      hasFormsStep: questionnaireIds.length > 0,
    }),
    [hasAddonsStep, hasMembershipStep, questionnaireIds.length]
  );

  const handleToolbarBack = useCallback(() => {
    if (submitBookingRequestMutation.isPending) return;
    if (mode === "bag") {
      onClose();
      return;
    }
    if (step === "addedToCart") {
      onClose();
      return;
    }
    if (step === "payment") {
      if (onBackFromPayment) {
        onBackFromPayment();
        return;
      }
      onClose();
      return;
    }
    const prev = previousStepInCheckoutFlow(step, checkoutFlowFlags);
    if (prev === "close") {
      onClose();
      return;
    }
    setStep(prev);
  }, [submitBookingRequestMutation.isPending, mode, onClose, onBackFromPayment, step, checkoutFlowFlags]);

  const showDrawerBack =
    mode === "bag" ||
    step === "addons" ||
    step === "membership" ||
    step === "forms" ||
    step === "syncCart" ||
    step === "addedToCart" ||
    step === "payment";

  const subtotal = useMemo(
    () => pickedSlots.reduce((s, p) => s + p.price, 0),
    [pickedSlots]
  );

  const entitlements = product?.entitlementDiscounts;

  const estimatedOriginalSubtotal = useMemo(() => {
    if (!Array.isArray(entitlements) || entitlements.length === 0) return null;
    return pickedSlots.reduce((s, p) => {
      const list =
        p.scheduleUnitPrice != null && Number.isFinite(p.scheduleUnitPrice)
          ? p.scheduleUnitPrice
          : reverseEntitlementDiscountsToUnitPrice(p.price, entitlements);
      return s + list;
    }, 0);
  }, [pickedSlots, entitlements]);

  const showMemberPricing = useMemo(() => {
    if (!Array.isArray(entitlements) || entitlements.length === 0) return false;
    if (estimatedOriginalSubtotal == null) return false;
    return estimatedOriginalSubtotal > subtotal + 0.01;
  }, [entitlements, estimatedOriginalSubtotal, subtotal]);

  const slotKeySet = useMemo(() => new Set(pickedSlots.map((s) => s.key)), [pickedSlots]);

  const bagCurrency = useMemo(() => {
    const c0 = bagSnapshots[0]?.cart;
    if (c0 && typeof c0.currency === "string" && c0.currency.length > 0) return c0.currency;
    return product?.prices[0]?.currency ?? "USD";
  }, [bagSnapshots, product]);

  const bagGrandTotal = useMemo(() => {
    let sum = 0;
    let any = false;
    for (const row of bagSnapshots) {
      const c = row.cart;
      const n =
        typeof c.subtotal === "number" && Number.isFinite(c.subtotal)
          ? c.subtotal
          : typeof c.price === "number" && Number.isFinite(c.price)
            ? c.price
            : null;
      if (n != null) {
        sum += n;
        any = true;
      }
    }
    return any ? sum : null;
  }, [bagSnapshots]);

  const paymentHeadline = useMemo(() => {
    const fromRows = bagSnapshots
      .map((r) => r.bookingForLabel)
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim());
    const unique = [...new Set(fromRows)].sort((a, b) => a.localeCompare(b));
    if (unique.length === 0) {
      return { kind: "single" as const, text: bookingForLabel };
    }
    if (unique.length === 1) {
      return { kind: "single" as const, text: unique[0]! };
    }
    return { kind: "multi" as const, text: unique.join(", ") };
  }, [bagSnapshots, bookingForLabel]);

  /**
   * "Pay minimum due" amount across the bag.
   *
   * **Single source of truth:** when the bag has any cart snapshot, we use ONLY the cart-level
   * `minimumDownpayment` from Bond. Adding the product-level `downpayment` on top would
   * double-count the deposit and trigger `CART.INVALID_PAYMENT_AMOUNT` on finalize (Bond knows
   * the correct minimum — we just relay it). The product-level `downpayment` is only used as a
   * pre-cart "draft" hint when no cart exists yet.
   */
  const depositAmount = useMemo(() => {
    const readDp = (v: unknown): number | null => {
      if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return null;
      return v;
    };

    if (bagSnapshots.length > 0) {
      let total = 0;
      let hasDeposit = false;
      for (const row of bagSnapshots) {
        if (!row.cart) continue;
        const min = cartChargeableMinimum(row.cart);
        if (min == null) continue;
        total += min;
        hasDeposit = true;
      }
      if (!hasDeposit) return null;
      return total > 0 ? total : null;
    }

    const draftDp = readDp(product?.downpayment) ?? readDp(product?.downPayment);
    return draftDp;
  }, [product, bagSnapshots]);

  const customAmountDepositDefaultRef = useRef<number | null>(null);
  useEffect(() => {
    if (depositAmount == null) {
      customAmountDepositDefaultRef.current = null;
      setCustomAmountInput("");
      return;
    }
    const roundedDeposit = Math.round(depositAmount * CURRENCY_CENTS) / CURRENCY_CENTS;
    if (customAmountDepositDefaultRef.current === roundedDeposit) return;
    customAmountDepositDefaultRef.current = roundedDeposit;
    setCustomAmountInput(roundedDeposit.toFixed(CURRENCY_INPUT_DECIMALS));
  }, [depositAmount]);
  const paymentLines = useMemo((): SessionCartSnapshot[] => {
    const rows: SessionCartSnapshot[] = [...bagSnapshots];
    const pushSynthetic = (
      lineName: string,
      amount: number,
      cur: string,
      opts?: {
        approvalRequired?: boolean;
        scheduleSummary?: string;
        lineKind?: "booking" | "membership" | "addon";
        displayLineExtras?: Pick<SessionCartDisplayLine, "strikeAmount" | "discountNote">;
      }
    ) => {
      const lk = opts?.lineKind ?? "booking";
      const baseLine: SessionCartDisplayLine = {
        title: lineName,
        amount,
        lineKind: lk,
        ...(opts?.scheduleSummary ? { meta: opts.scheduleSummary } : {}),
        ...opts?.displayLineExtras,
      };
      rows.push({
        cart: {
          id: 0,
          organizationId: orgId,
          subtotal: amount,
          price: amount,
          currency: cur,
        } as OrganizationCartDto,
        productName: lineName,
        bookingForLabel,
        displayLines: [baseLine],
        ...(opts?.scheduleSummary ? { scheduleSummary: opts.scheduleSummary } : {}),
        ...(opts?.approvalRequired === true ? { approvalRequired: true as const } : {}),
        ...(opts?.approvalRequired === false ? { approvalRequired: false as const } : {}),
      });
    };

    /** In-progress booking before POST create (the old branch required approvalDeferred, which is only set after create — so the summary was empty). */
    if (pickedSlots.length > 0 && !lastCart) {
      const scheduleSummary = formatScheduleSummaryForBooking(pickedSlots, bookingForLabel, (n) =>
        formatPrice(n, currency)
      );
      const entNote = describeEntitlementsForDisplay(entitlements);
      const displayLineExtras =
        showMemberPricing && estimatedOriginalSubtotal != null
          ? {
              strikeAmount: estimatedOriginalSubtotal,
              ...(entNote ? { discountNote: entNote } : {}),
            }
          : undefined;
      pushSynthetic(productName, subtotal, currency, {
        approvalRequired: approvalRequired === true,
        scheduleSummary,
        displayLineExtras,
      });
      for (const r of allRequiredFlat) {
        if (!r.displayPrice) continue;
        if (!requiredSelected.has(r.id) && !selectedMembershipNestedIds?.has(r.id)) continue;
        if (r.displayPrice.currency.toUpperCase() !== currency.toUpperCase()) continue;
        pushSynthetic(r.name ?? `Product ${r.id}`, r.displayPrice.amount, r.displayPrice.currency, {
          approvalRequired: snapshotRowExpectsVenueApproval(r, extendedRequiredList),
          scheduleSummary,
          lineKind: membershipRequiredFromExtendedTree(r.id, extendedRequiredList) ? "membership" : "booking",
        });
      }
      for (const a of packageAddons) {
        if (!selectedAddonIds.has(a.id)) continue;
        const p = resolveAddonDisplayPrice(a);
        if (!p) continue;
        const addonCurrency =
          typeof p.currency === "string" && p.currency.length > 0 ? p.currency : currency;
        let amt = 0;
        if (a.level === "reservation") {
          /** Reservation-level: single global qty. */
          const qty = Math.max(1, addonQuantities?.get(a.id) ?? 1);
          amt = p.price * qty;
        } else {
          /** Slot / hour-level: qty is per-slot in addonSlotQuantities; sum across effective slots. */
          const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
          const slotQtyMap = addonSlotQuantities?.get(a.id);
          for (const s of pickedSlots) {
            if (eff.size > 0 && !eff.has(s.key)) continue;
            const slotQty = Math.max(0, slotQtyMap?.get(s.key) ?? 1);
            if (slotQty <= 0) continue;
            const perUnit =
              a.level === "hour" ? p.price * (slotDurationMinutes(s) / 60) : p.price;
            amt += perUnit * slotQty;
          }
        }
        if (amt > 0) {
          pushSynthetic(a.name, amt, addonCurrency, {
            approvalRequired: approvalRequired === true,
            scheduleSummary,
            lineKind: "addon",
          });
        }
      }
    }
    if (rows.length > 0) return rows;
    if (lastCart)
      return [
        {
          cart: lastCart,
          productName,
          bookingForLabel,
          ...(approvalRequired ? { approvalRequired: true as const } : {}),
        },
      ];
    return [];
  }, [
    bagSnapshots,
    lastCart,
    productName,
    bookingForLabel,
    approvalRequired,
    pickedSlots,
    orgId,
    subtotal,
    currency,
    allRequiredFlat,
    extendedRequiredList,
    requiredSelected,
    selectedMembershipNestedIds,
    packageAddons,
    selectedAddonIds,
    addonQuantities,
    addonSlotQuantities,
    addonSlotTargeting,
    slotKeySet,
    showMemberPricing,
    estimatedOriginalSubtotal,
    entitlements,
    formatPrice,
  ]);

  const tailExtraPaymentLines = useMemo(() => {
    const n = bagSnapshots.length;
    if (paymentLines.length <= n) return [];
    return paymentLines.slice(n);
  }, [paymentLines, bagSnapshots.length]);

  const groupedBagWithTotals = useMemo(() => aggregateBagSnapshotsByLabel(bagSnapshots), [bagSnapshots]);

  const groupedTailPaymentSections = useMemo(
    () => aggregateBagSnapshotsByLabel(tailExtraPaymentLines),
    [tailExtraPaymentLines]
  );

  /** Full checkout snapshot (bag + in-progress booking) for pre-payment booking summary card. */
  const groupedFullCheckoutSummary = useMemo(
    () => aggregateBagSnapshotsByLabel(paymentLines),
    [paymentLines]
  );

  /**
   * Rows that drive the **add-to-cart / presummary** line list and its subtotal/tax/total (tail-only when
   * merging another booking so totals match the on-screen lines, not the whole bag).
   */
  const presummaryLineTotalsRows = useMemo((): SessionCartSnapshot[] => {
    const useTailOnly =
      bagSnapshots.length > 0 &&
      pickedSlots.length > 0 &&
      !lastCart &&
      tailExtraPaymentLines.length > 0;
    return useTailOnly ? tailExtraPaymentLines : paymentLines;
  }, [
    bagSnapshots.length,
    pickedSlots.length,
    lastCart,
    tailExtraPaymentLines,
    paymentLines,
  ]);

  const groupedPresummaryLineSections = useMemo(
    () => aggregateBagSnapshotsByLabel(presummaryLineTotalsRows),
    [presummaryLineTotalsRows]
  );

  const presummaryAggregates = useMemo(
    () => aggregateBagSnapshots(presummaryLineTotalsRows),
    [presummaryLineTotalsRows]
  );

  const presummaryOnlySynthetics = useMemo(
    () =>
      presummaryLineTotalsRows.length > 0 &&
      presummaryLineTotalsRows.every(
        (r) => !(typeof r.cart?.id === "number" && Number.isFinite(r.cart.id) && r.cart.id > 0)
      ),
    [presummaryLineTotalsRows]
  );


  /** Pre-create booking summary: **one card per slot**, with that slot's addons inline (per-slot/per-hour qty editable). */
  const syntheticBookingReviewModel = useMemo(() => {
    if (pickedSlots.length === 0) return null;
    const sorted = [...pickedSlots].sort((a, b) => {
      const d = a.startDate.localeCompare(b.startDate);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });
    const entNote = describeEntitlementsForDisplay(entitlements);
    const includeReq = (id: number) =>
      requiredSelected.has(id) || selectedMembershipNestedIds?.has(id) === true;

    type SlotAddonRow = {
      addonId: number;
      name: string;
      level: "slot" | "hour";
      slotKey: string;
      unitPrice: number;
      perUnitAmount: number;
      qty: number;
      amount: number;
    };
    type SlotItem = {
      key: string;
      title: string;
      slotKey: string;
      resourceLine: string;
      resourceIsInstructor: boolean;
      calendarLine: string;
      unitSubtitle: string;
      amount: number;
      strikeAmount?: number;
      discountNote?: string;
      nestedAddons: SlotAddonRow[];
    };

    const slotItems: SlotItem[] = sorted.map((slot) => {
      const listUnit =
        typeof slot.scheduleUnitPrice === "number" &&
        Number.isFinite(slot.scheduleUnitPrice) &&
        slot.scheduleUnitPrice > 0
          ? slot.scheduleUnitPrice
          : slot.price;
      const dur = Math.max(1, Math.round(slotDurationMinutes(slot)));
      const slotAmount = slot.price;
      const listForStrike = (() => {
        const ls =
          typeof slot.scheduleUnitPrice === "number" &&
          Number.isFinite(slot.scheduleUnitPrice) &&
          slot.scheduleUnitPrice > 0
            ? slot.scheduleUnitPrice
            : Array.isArray(entitlements) && entitlements.length > 0
              ? reverseEntitlementDiscountsToUnitPrice(slot.price, entitlements)
              : null;
        if (ls != null && ls > slot.price + 0.005) return ls;
        return undefined;
      })();

      const resourceLine = slot.resourceName.trim() || "—";
      const longDate = formatPickedSlotLongDate(slot);
      const timeRange = formatPickedSlotTimeRange(slot);
      const calendarLine = `${longDate} · ${timeRange}`;
      const unitSubtitle = `${formatPrice(listUnit, currency)} / ${formatDurationPriceBadge(dur)}`;

      const nestedAddons: SlotAddonRow[] = [];
      for (const a of packageAddons) {
        if (!selectedAddonIds.has(a.id)) continue;
        if (a.level === "reservation") continue;
        const p = resolveAddonDisplayPrice(a);
        if (!p) continue;
        const addonCur =
          typeof p.currency === "string" && p.currency.length > 0
            ? p.currency.toUpperCase()
            : currency.toUpperCase();
        if (addonCur !== currency.toUpperCase()) continue;
        const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
        if (eff.size > 0 && !eff.has(slot.key)) continue;
        const slotQtyMap = addonSlotQuantities?.get(a.id);
        const qty = Math.max(0, slotQtyMap?.get(slot.key) ?? 1);
        if (qty <= 0) continue;
        const perUnitAmount =
          a.level === "hour" ? p.price * (slotDurationMinutes(slot) / 60) : p.price;
        nestedAddons.push({
          addonId: a.id,
          name: a.name,
          level: a.level,
          slotKey: slot.key,
          unitPrice: p.price,
          perUnitAmount,
          qty,
          amount: perUnitAmount * qty,
        });
      }

      return {
        key: `slot-${slot.key}`,
        title: productName,
        slotKey: slot.key,
        resourceLine,
        resourceIsInstructor: Boolean(slot.usesInstructorSegment),
        calendarLine,
        unitSubtitle,
        amount: slotAmount,
        strikeAmount: listForStrike,
        discountNote: listForStrike != null && entNote ? entNote : undefined,
        nestedAddons,
      };
    });

    const reservationAddonItems: { key: string; addonId: number; name: string; amount: number; qty: number; resourceLine?: string; calendarLines?: string[]; unitSubtitle?: string }[] = [];
    for (const a of packageAddons) {
      if (!selectedAddonIds.has(a.id) || a.level !== "reservation") continue;
      const p = resolveAddonDisplayPrice(a);
      if (!p) continue;
      const addonCur = typeof p.currency === "string" && p.currency.length > 0 ? p.currency.toUpperCase() : currency.toUpperCase();
      if (addonCur !== currency.toUpperCase()) continue;
      if (p.price <= 0) continue;
      const qty = Math.max(1, addonQuantities?.get(a.id) ?? 1);
      const uniqueResources = [...new Set(sorted.map((s) => s.resourceName.trim()).filter(Boolean))];
      const calendarLines = sorted.map((s) => `${formatPickedSlotLongDate(s)} · ${formatPickedSlotTimeRange(s)}`);
      reservationAddonItems.push({
        key: `ra-${a.id}`,
        addonId: a.id,
        name: a.name,
        amount: p.price * qty,
        qty,
        resourceLine: uniqueResources.join(", ") || undefined,
        calendarLines,
      });
    }

    const membershipItems: { key: string; name: string; amount: number; unitSubtitle?: string }[] = [];
    const otherRequiredItems: { key: string; name: string; amount: number; unitSubtitle?: string }[] = [];
    const seenReqIds = new Set<number>();
    for (const r of allRequiredFlat) {
      if (!r.displayPrice) continue;
      if (r.displayPrice.currency.toUpperCase() !== currency.toUpperCase()) continue;
      if (!includeReq(r.id)) continue;
      if (seenReqIds.has(r.id)) continue;
      seenReqIds.add(r.id);
      const interval = typeof r.displayPrice.label === "string" && r.displayPrice.label.trim().length > 0
        ? r.displayPrice.label.trim().toLowerCase()
        : undefined;
      const unitSubtitle = interval
        ? `${formatPrice(r.displayPrice.amount, currency)} / ${interval} x 1`
        : `${formatPrice(r.displayPrice.amount, currency)} x 1`;
      const row = {
        key: `req-${r.id}`,
        name: r.name ?? `Product ${r.id}`,
        amount: r.displayPrice.amount,
        unitSubtitle,
      };
      if (membershipRequiredFromExtendedTree(r.id, extendedRequiredList)) {
        membershipItems.push(row);
      } else {
        otherRequiredItems.push(row);
      }
    }

    return { slotItems, reservationAddonItems, membershipItems, otherRequiredItems };
  }, [
    pickedSlots,
    entitlements,
    packageAddons,
    selectedAddonIds,
    addonQuantities,
    addonSlotQuantities,
    addonSlotTargeting,
    slotKeySet,
    currency,
    formatPrice,
    productName,
    allRequiredFlat,
    requiredSelected,
    selectedMembershipNestedIds,
    extendedRequiredList,
  ]);

  const paymentSectionCount = groupedBagWithTotals.length + groupedTailPaymentSections.length;

  const showPreCheckoutShell =
    step === "addons" || step === "membership" || step === "forms" || step === "syncCart";

  /** When any row is a real Bond cart, line amounts are already member-priced; schedule “savings” must not be subtracted again. */
  const paymentLinesHaveBondCart = useMemo(
    () => paymentLines.some((r) => typeof r.cart?.id === "number" && r.cart.id > 0),
    [paymentLines]
  );

  const bagPolicyCheckout = useMemo(() => bagApprovalPolicy(paymentLines), [paymentLines]);
  bagPolicyCheckoutRef.current = bagPolicyCheckout;
  const bagPolicyBag = useMemo(() => bagApprovalPolicy(bagSnapshots), [bagSnapshots]);

  /** Promo / strike-vs-net savings from the same expanded lines as the order summary (Bond may omit cart-level discount). */
  const promoDiscountFromExpandedPurchaseLines = useMemo(() => {
    let sum = 0;
    for (const section of groupedFullCheckoutSummary) {
      for (const item of section.items) {
        const { index, row, cartFlatLineIndices, subsectionBookingForLabel } = item;
        const lines = expandSnapshotForPurchaseList(row, index, {
          bagPolicy: bagPolicyCheckout,
          omitBookingLabelInMeta: true,
          hideVenueApprovalLineNotes: approvalRequired,
          ...(cartFlatLineIndices != null
            ? { cartFlatLineIndexFilter: new Set(cartFlatLineIndices) }
            : {}),
          ...(subsectionBookingForLabel != null ? { subsectionBookingForLabel } : {}),
        });
        for (const line of lines) {
          if (
            line.strikeAmount != null &&
            line.amount != null &&
            line.strikeAmount > line.amount + 0.005
          ) {
            sum += line.strikeAmount - line.amount;
          }
        }
      }
    }
    return sum > 0.005 ? sum : null;
  }, [groupedFullCheckoutSummary, bagPolicyCheckout, approvalRequired]);

  const promoDiscountFromPresummaryLines = useMemo(() => {
    let sum = 0;
    for (const section of groupedPresummaryLineSections) {
      for (const item of section.items) {
        const lines = expandSnapshotForPurchaseList(item.row, item.index, {
          bagPolicy: bagPolicyCheckout,
          omitBookingLabelInMeta: true,
          hideVenueApprovalLineNotes: approvalRequired,
          ...(item.cartFlatLineIndices != null
            ? { cartFlatLineIndexFilter: new Set(item.cartFlatLineIndices) }
            : {}),
          ...(item.subsectionBookingForLabel != null
            ? { subsectionBookingForLabel: item.subsectionBookingForLabel }
            : {}),
        });
        for (const line of lines) {
          if (
            line.strikeAmount != null &&
            line.amount != null &&
            line.strikeAmount > line.amount + 0.005
          ) {
            sum += line.strikeAmount - line.amount;
          }
        }
      }
    }
    return sum > 0.005 ? sum : null;
  }, [groupedPresummaryLineSections, bagPolicyCheckout, approvalRequired]);

  const title = useMemo(() => {
    if (mode === "bag") return tx("bagTitle");
    switch (step) {
      case "addons":
        return packageAddons.length > 0 ? tx("addonsTitle") : tx("requiredItemsTitle");
      case "membership":
        return tx("membershipTitle");
      case "forms":
        return tx("additionalInfoTitle");
      case "syncCart":
        return tx("addToCart");
      case "addedToCart":
        return tx("addedToCartTitle");
      case "payment":
        return tx("cartDrawerTitle");
    }
  }, [mode, step, packageAddons.length, tx]);

  const bagDrawerLineCount = useMemo(() => countSessionCartLineItems(bagSnapshots), [bagSnapshots]);

  /** Bond cart fields only (no client-side line math). */
  const bagSessionAggregates = useMemo(() => aggregateBagSnapshots(bagSnapshots), [bagSnapshots]);

  const bagLineBuckets = useMemo(() => aggregateBagCartLineBuckets(bagSnapshots), [bagSnapshots]);

  const bagAggregates = useMemo(() => aggregateBagSnapshots(paymentLines), [paymentLines]);

  const singleLineMemberSavings = useMemo(() => {
    if (!Array.isArray(entitlements) || entitlements.length === 0) return null;
    if (estimatedOriginalSubtotal == null) return null;
    if (!showMemberPricing) return null;
    if (paymentLinesHaveBondCart) return null;
    return Math.max(0, estimatedOriginalSubtotal - subtotal);
  }, [entitlements, estimatedOriginalSubtotal, showMemberPricing, paymentLinesHaveBondCart, subtotal]);

  /** Member “savings” for presummary when it’s only client-priced rows (2nd booking) — not suppressed by an unrelated bag Bond cart. */
  const singleLineMemberSavingsPresummary = useMemo(() => {
    if (!presummaryOnlySynthetics) return singleLineMemberSavings;
    if (!Array.isArray(entitlements) || entitlements.length === 0) return null;
    if (estimatedOriginalSubtotal == null) return null;
    if (!showMemberPricing) return null;
    return Math.max(0, estimatedOriginalSubtotal - subtotal);
  }, [
    presummaryOnlySynthetics,
    singleLineMemberSavings,
    entitlements,
    estimatedOriginalSubtotal,
    showMemberPricing,
    subtotal,
  ]);

  const presummaryAggregatesForEstimate = useMemo(() => {
    const bondDisc =
      presummaryAggregates.discountTotal != null && presummaryAggregates.discountTotal > 0.005
        ? presummaryAggregates.discountTotal
        : null;
    const member =
      singleLineMemberSavingsPresummary != null && singleLineMemberSavingsPresummary > 0.005
        ? singleLineMemberSavingsPresummary
        : null;
    const promo = promoDiscountFromPresummaryLines;
    const merged = bondDisc ?? member ?? promo ?? null;
    if (merged == null) return { ...presummaryAggregates, discountTotal: null };
    return { ...presummaryAggregates, discountTotal: merged };
  }, [presummaryAggregates, singleLineMemberSavingsPresummary, promoDiscountFromPresummaryLines]);

  const presummaryDisplayDiscount = useMemo(() => {
    const bondDisc =
      presummaryAggregates.discountTotal != null && presummaryAggregates.discountTotal > 0.005
        ? presummaryAggregates.discountTotal
        : null;
    const member =
      singleLineMemberSavingsPresummary != null && singleLineMemberSavingsPresummary > 0.005
        ? singleLineMemberSavingsPresummary
        : null;
    return bondDisc ?? member ?? promoDiscountFromPresummaryLines ?? null;
  }, [
    presummaryAggregates.discountTotal,
    singleLineMemberSavingsPresummary,
    promoDiscountFromPresummaryLines,
  ]);

  const presummaryPrecheckoutAmountDue = useMemo(
    () => estimateAmountDue(presummaryAggregatesForEstimate, { includeProvisionalFees: false }),
    [presummaryAggregatesForEstimate]
  );

  /** Deposit dollar amount to charge — `product.downPayment` is already in dollars. */
  const computedDepositDollars = useMemo(() => {
    if (depositAmount == null || depositAmount <= 0) return null;
    return Math.round(depositAmount * 100) / 100;
  }, [depositAmount]);

  /** Merge member savings and line-implied promo when Bond omits or zeroes cart discount. */
  const bagAggregatesForEstimate = useMemo(() => {
    const bondDisc =
      bagAggregates.discountTotal != null && bagAggregates.discountTotal > 0.005
        ? bagAggregates.discountTotal
        : null;
    const member =
      singleLineMemberSavings != null && singleLineMemberSavings > 0.005
        ? singleLineMemberSavings
        : null;
    const promo = promoDiscountFromExpandedPurchaseLines;
    const merged = bondDisc ?? member ?? promo ?? null;
    if (merged == null) return { ...bagAggregates, discountTotal: null };
    return { ...bagAggregates, discountTotal: merged };
  }, [bagAggregates, singleLineMemberSavings, promoDiscountFromExpandedPurchaseLines]);

  const selectedPaymentChoice = useMemo(
    () => paymentChoices.find((c) => c.id === selectedPaymentMethodId) ?? null,
    [paymentChoices, selectedPaymentMethodId]
  );

  /** Org processing fee from consumer payment options (Bond `fee` on the selected row), when cart has no fee total yet. */
  const paymentProcessingFeeEstimate = useMemo(() => {
    if (bagAggregates.feeTotal != null) return null;
    if (!selectedPaymentChoice?.fee) return null;
    const sub = bagAggregatesForEstimate.lineSubtotal;
    const disc = bagAggregatesForEstimate.discountTotal ?? 0;
    const tax = bagAggregatesForEstimate.taxTotal ?? 0;
    if (sub == null) return null;
    const base = Math.max(0, sub - disc + tax);
    return computeConsumerPaymentProcessingFee(base, selectedPaymentChoice.fee);
  }, [
    bagAggregates.feeTotal,
    bagAggregatesForEstimate.lineSubtotal,
    bagAggregatesForEstimate.discountTotal,
    bagAggregatesForEstimate.taxTotal,
    selectedPaymentChoice,
  ]);

  /** Cart (bag): estimated processing fee from consumer payment `options[].fee` when Bond cart has no fee line yet. */
  const bagProcessingFeeFromOptions = useMemo(() => {
    if (bagSessionAggregates.feeTotal != null && bagSessionAggregates.feeTotal > BOND_KIND_LINE_MIN) {
      return null;
    }
    if (!selectedPaymentChoice?.fee) return null;
    const sub = bagSessionAggregates.lineSubtotal;
    if (sub == null) return null;
    const disc = bagSessionAggregates.discountTotal ?? 0;
    const tax = bagSessionAggregates.taxTotal ?? 0;
    const base = Math.max(0, sub - disc + tax);
    return computeConsumerPaymentProcessingFee(base, selectedPaymentChoice.fee);
  }, [bagSessionAggregates, selectedPaymentChoice]);

  const bagAggregatesWithMaybeEstimatedFee = useMemo(() => {
    if (bagProcessingFeeFromOptions == null) return bagSessionAggregates;
    if (bagSessionAggregates.feeTotal != null && bagSessionAggregates.feeTotal > BOND_KIND_LINE_MIN) {
      return bagSessionAggregates;
    }
    return {
      ...bagSessionAggregates,
      feeTotal: bagProcessingFeeFromOptions,
    };
  }, [bagSessionAggregates, bagProcessingFeeFromOptions]);

  const bagEstimatedTotal = useMemo(
    () => estimateAmountDue(bagAggregatesWithMaybeEstimatedFee, { includeProvisionalFees: true }),
    [bagAggregatesWithMaybeEstimatedFee]
  );

  const bagFooterPrimaryLabel = useMemo(() => {
    const amt =
      bagEstimatedTotal != null
        ? formatPrice(bagEstimatedTotal, bagCurrency)
        : bagSessionAggregates.cartGrandTotal != null
          ? formatPrice(bagSessionAggregates.cartGrandTotal, bagCurrency)
          : null;
    if (bagPolicyBag === "all_pay") {
      return amt != null ? tx("payNowWithAmount", { amount: amt }) : tx("payNow");
    }
    return amt != null ? tx("checkoutWithAmount", { amount: amt }) : tx("proceedToCheckout");
  }, [
    bagEstimatedTotal,
    bagCurrency,
    bagSessionAggregates.cartGrandTotal,
    bagPolicyBag,
    tx,
  ]);

  const bagFeeRowAmount = useMemo(() => {
    if (bagSessionAggregates.feeTotal != null && bagSessionAggregates.feeTotal > BOND_KIND_LINE_MIN) {
      return bagSessionAggregates.feeTotal;
    }
    if (bagProcessingFeeFromOptions != null) return bagProcessingFeeFromOptions;
    return null;
  }, [bagSessionAggregates.feeTotal, bagProcessingFeeFromOptions]);

  const bagAggregatesForPaymentTotal = useMemo(() => {
    if (paymentProcessingFeeEstimate == null || paymentProcessingFeeEstimate <= 0) {
      return bagAggregatesForEstimate;
    }
    return {
      ...bagAggregatesForEstimate,
      feeTotal: (bagAggregatesForEstimate.feeTotal ?? 0) + paymentProcessingFeeEstimate,
    };
  }, [bagAggregatesForEstimate, paymentProcessingFeeEstimate]);

  const feesIncludedInEstimate = useMemo(() => {
    if (bagAggregates.feeTotal != null) return true;
    if (bagPolicyCheckout === "all_submission") return true;
    return selectedPaymentMethodId != null;
  }, [bagAggregates.feeTotal, bagPolicyCheckout, selectedPaymentMethodId]);

  const estimatedAmountDue = useMemo(
    () => estimateAmountDue(bagAggregatesForPaymentTotal, { includeProvisionalFees: feesIncludedInEstimate }),
    [bagAggregatesForPaymentTotal, feesIncludedInEstimate]
  );
  estimatedAmountDueRef.current = estimatedAmountDue;

  const displayDiscountTotal = useMemo(() => {
    const bondDisc =
      bagAggregates.discountTotal != null && bagAggregates.discountTotal > 0.005
        ? bagAggregates.discountTotal
        : null;
    const member =
      singleLineMemberSavings != null && singleLineMemberSavings > 0.005
        ? singleLineMemberSavings
        : null;
    return bondDisc ?? member ?? promoDiscountFromExpandedPurchaseLines ?? null;
  }, [
    bagAggregates.discountTotal,
    singleLineMemberSavings,
    promoDiscountFromExpandedPurchaseLines,
  ]);
  const checkoutPaymentTotal = estimatedAmountDue ?? bagAggregates.cartGrandTotal ?? presummaryPrecheckoutAmountDue ?? 0;
  const checkoutDepositParsed = Number.parseFloat(customAmountInput);
  const checkoutDepositValid =
    computedDepositDollars != null &&
    Number.isFinite(checkoutDepositParsed) &&
    checkoutDepositParsed >= computedDepositDollars &&
    checkoutDepositParsed <= checkoutPaymentTotal + BOND_KIND_LINE_MIN;
  const checkoutDepositAmount = checkoutDepositValid
    ? Math.round(checkoutDepositParsed * CURRENCY_CENTS) / CURRENCY_CENTS
    : null;
  const checkoutApprovalDollars = useMemo(() => {
    if (bagPolicyCheckout === "all_submission") return checkoutPaymentTotal;
    if (bagPolicyCheckout !== "mixed") return null;
    let sum = 0;
    let any = false;
    for (const row of paymentLines) {
      const value = cartApprovalSubtotal(row.cart, row.approvalByProductId);
      if (value == null) continue;
      sum += value;
      any = true;
    }
    return any ? Math.round(sum * CURRENCY_CENTS) / CURRENCY_CENTS : null;
  }, [bagPolicyCheckout, checkoutPaymentTotal, paymentLines]);

  const handleCheckoutCardRemove = useCallback((card: CheckoutCardModel) => {
    const remove: BagRemovePolicy =
      card.kind === "rental"
        ? { kind: "subsection" }
        : card.cartItemId != null
          ? { kind: "line", cartItemId: card.cartItemId }
          : { kind: "subsection" };
    void onRemoveBagLine?.({
      index: card.snapshotIndex,
      cartFlatLineIndices: card.cartFlatLineIndices,
      remove,
    });
  }, [onRemoveBagLine]);

  const paymentMethodModal = (
    <ModalShell
      open={paymentModal != null}
      title={paymentModal === "bank" ? "Confirm bank account" : "Add credit card"}
      hideTitle
      ariaLabel={paymentModal === "bank" ? "Confirm bank account" : "Add credit card"}
      panelClassName="cb-modal-panel--payment-method"
      onClose={() => setPaymentModal(null)}
    >
      {paymentModal === "bank" ? (
        <div className="cb-payment-method-modal cb-payment-method-modal--bank">
          <div className="cb-payment-method-modal-hero">
            <div className="cb-payment-method-modal-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 9h16M6 9v9M10 9v9M14 9v9M18 9v9M3 18h18M12 4l8 5H4l8-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="cb-payment-method-modal-title">Confirm bank account</h2>
            <p className="cb-payment-method-modal-placeholder">[customer goes via stripe and gets redirected here]</p>
            <p className="cb-payment-method-modal-copy">
              Please confirm that you agree to connect your account information to our system. This account will be saved to your payment methods for future use.
            </p>
          </div>
          <div className="cb-payment-method-modal-actions">
            <button type="button" className="cb-payment-method-modal-btn cb-payment-method-modal-btn--outline" onClick={() => setPaymentModal(null)}>
              Cancel
            </button>
            <button type="button" className="cb-payment-method-modal-btn cb-payment-method-modal-btn--primary" onClick={() => setPaymentModal(null)}>
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="cb-payment-method-modal">
          <div className="cb-payment-method-modal-hero">
            <div className="cb-payment-method-modal-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <h2 className="cb-payment-method-modal-title">Add credit card</h2>
            <p className="cb-payment-method-modal-copy">
              Enter the information below to add a new card to your payment methods for future use. You can manage all of your payment methods from your profile at any time.
            </p>
          </div>
          <div className="cb-payment-method-modal-fields">
            <PaymentPlaceholderField label="Name on Card" placeholder="Enter name" required />
            <PaymentPlaceholderField label="Card Number" placeholder="Enter number" icon="card" required />
            <div className="cb-payment-method-modal-field-row">
              <PaymentPlaceholderField label="Expiration Date" placeholder="mm / yy" required />
              <PaymentPlaceholderField label="Security Code" placeholder="Enter code" required />
            </div>
            <PaymentPlaceholderField label="Billing Address" placeholder="Enter full address" required />
            <div className="cb-payment-method-modal-field-row">
              <PaymentPlaceholderField label="City" placeholder="Enter city" required />
              <PaymentPlaceholderField label="State / Province" placeholder="Enter state" required />
            </div>
            <div className="cb-payment-method-modal-field-row">
              <PaymentPlaceholderField label="Zip Code" placeholder="Enter zip code" required />
              <PaymentPlaceholderField label="Country" placeholder="Enter country" required />
            </div>
          </div>
          <div className="cb-payment-method-modal-actions">
            <button type="button" className="cb-payment-method-modal-btn cb-payment-method-modal-btn--outline" onClick={() => setPaymentModal(null)}>
              Cancel
            </button>
            <button type="button" className="cb-payment-method-modal-btn cb-payment-method-modal-btn--primary" onClick={() => setPaymentModal(null)}>
              Save
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );

  /** Shown on add-ons / membership / forms / sync steps (before payment method selection). */
  const precheckoutAmountDue = useMemo(
    () => estimateAmountDue(bagAggregatesForEstimate, { includeProvisionalFees: false }),
    [bagAggregatesForEstimate]
  );

  const confirmationAccountEmail = useMemo(() => {
    if (!bondProfile || typeof bondProfile !== "object") return null;
    const e = (bondProfile as Record<string, unknown>).email;
    return typeof e === "string" && e.includes("@") ? e.trim() : null;
  }, [bondProfile]);

  const finalizeInvoiceDisplay = useMemo(() => {
    if (finalizeSuccess == null) return null;
    if (finalizeSuccess.invoiceNumericId != null) return String(finalizeSuccess.invoiceNumericId);
    return finalizeSuccess.invoiceRef ?? null;
  }, [finalizeSuccess]);

  const finalizeInvoicePortalUrl = useMemo(() => {
    if (
      finalizeSuccess?.invoiceNumericId == null ||
      orgId <= 0 ||
      primaryAccountUserId <= 0
    ) {
      return null;
    }
    return buildSquadCInvoicePortalUrl(orgId, primaryAccountUserId, finalizeSuccess.invoiceNumericId);
  }, [finalizeSuccess, orgId, primaryAccountUserId]);

  const finalizeReservationDisplay = useMemo(() => {
    if (finalizeSuccess == null) return null;
    const r = finalizeSuccess.reservationRef?.trim();
    if (!r) return null;
    return /^res-/i.test(r) ? r.toUpperCase() : `RES-${r}`;
  }, [finalizeSuccess]);

  /** Compact mock-style prefix for the confirmation card (copy matches display). */
  const finalizeInvoiceDisplayPretty = useMemo(() => {
    if (finalizeInvoiceDisplay == null) return null;
    const s = finalizeInvoiceDisplay.trim();
    if (/^\d+$/.test(s)) return `INV-${s}`;
    if (/^inv-/i.test(s)) return s.toUpperCase();
    return s;
  }, [finalizeInvoiceDisplay]);

  const openCalendarTemplate = useCallback(() => {
    const title = encodeURIComponent(`${productName} — ${orgDisplayName ?? "Bond"}`);
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [productName, orgDisplayName]);

  const panelCls = `consumer-booking ${appearanceClass} cb-checkout-drawer cb-checkout-drawer--wide`.trim();
  const safeOnClose = useCallback(() => {
    if (submitBookingRequestMutation.isPending) return;
    onClose();
  }, [submitBookingRequestMutation.isPending, onClose]);

  const presummaryDiscountTagIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.82 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" />
    </svg>
  );

  const presummaryTaxPctIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 18.5L18.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const renderPresummaryCard = (opts: {
    headingId: string;
    keyPrefix: string;
    showReviewHint?: boolean;
    /** `compactTotals` = membership step (totals box only). `bookingReview` = syncCart step (per-slot cards). */
    layout: "compactTotals" | "bookingReview";
    /** bookingReview layout: clicking the pencil on an add-on navigates back to the add-ons step. */
    onEditAddons?: () => void;
    /** bookingReview layout: remove a draft slot by key. */
    onRemoveSlot?: (key: string) => void;
    /** bookingReview layout: remove a reservation-level add-on by product id. */
    onRemoveAddon?: (addonId: number) => void;
  }) => {
    if (paymentLines.length === 0) return null;

    if (opts.layout === "compactTotals") {
      return (
        <div className="cb-checkout-compact-totals-wrap" aria-labelledby={opts.headingId}>
          <h3 id={opts.headingId} className="sr-only">
            {tx("orderSummary")}
          </h3>
          <div className="cb-checkout-presummary-tax-panel">
            <svg className="cb-checkout-presummary-tax-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8.5v0.01M11.25 11h1v5h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="cb-checkout-presummary-tax-text">{tx("taxDiscountsCheckoutNote")}</span>
          </div>
          <div className="cb-checkout-presummary-totals cb-checkout-presummary-totals--flat">
            <CbCheckoutTotalRow
              variant="grand"
              label={tx("total")}
              value={
                <strong>
                  {presummaryPrecheckoutAmountDue != null
                    ? formatPrice(presummaryPrecheckoutAmountDue, bagCurrency)
                    : presummaryAggregates.cartGrandTotal != null
                      ? formatPrice(presummaryAggregates.cartGrandTotal, bagCurrency)
                      : "—"}
                </strong>
              }
            />
          </div>
        </div>
      );
    }

    if (opts.layout === "bookingReview") {
      if (!syntheticBookingReviewModel) {
        return (
          <div className="cb-checkout-presummary cb-checkout-presummary--review-empty" aria-labelledby={opts.headingId}>
            <h3 id={opts.headingId} className="cb-checkout-presummary-title">
              {tx("bookingSummary")}
            </h3>
            <p className="cb-muted text-sm">{tx("bookingSummaryEmptyHint")}</p>
          </div>
        );
      }
      const m = syntheticBookingReviewModel;
      const productGated = productMembershipGated(product);
      const fmtBookingMoney = (amount: number) =>
        formatBookingPriceOrFree(amount, bagCurrency, formatPrice, {
          membershipGated: productGated,
          freeLabel: tb("free"),
          freeForMembersLabel: tb("freeForMembers"),
        });
      const reviewMoney = (strike: number | undefined, net: number) =>
        strike != null && strike > net + 0.005 ? (
          <>
            <span className="cb-checkout-price-strike">{formatPrice(strike, bagCurrency)}</span>{" "}
            <strong>{fmtBookingMoney(net)}</strong>
          </>
        ) : (
          <strong>{fmtBookingMoney(net)}</strong>
        );

      const REVIEW_ADDON_MAX_QTY = 50;
      const setSlotAddonQty = (addonId: number, slotKey: string, next: number) => {
        if (!onSetAddonSlotQty) return;
        const v = Math.min(REVIEW_ADDON_MAX_QTY, Math.max(0, Math.round(next)));
        onSetAddonSlotQty(addonId, slotKey, v);
      };

      const nestedAddonRow = (
        x: { addonId: number; name: string; perUnitAmount: number; qty: number; slotKey: string }
      ) => {
        const canStep = Boolean(onSetAddonSlotQty);
        return (
          <div key={`${x.addonId}-${x.slotKey}`} className="cb-checkout-review-addon-pill">
            <span className="cb-checkout-review-addon-pill-icon" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H5v4h4V5zM19 5h-4v4h4V5zM9 15H5v4h4v-4zM19 15h-4v4h4v-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="cb-checkout-review-addon-pill-name" title={x.name}>{x.name}</span>
            <span className="cb-checkout-review-addon-pill-price">
              {fmtBookingMoney(x.perUnitAmount)}
            </span>
            {canStep ? (
              <span className="cb-checkout-review-addon-pill-qty" role="group" aria-label={tx("quantity")}>
                <button
                  type="button"
                  className="cb-checkout-review-addon-pill-qty-btn"
                  aria-label="Decrease"
                  onClick={() => setSlotAddonQty(x.addonId, x.slotKey, x.qty - 1)}
                >
                  −
                </button>
                <span className="cb-checkout-review-addon-pill-qty-val" aria-live="polite">{x.qty}</span>
                <button
                  type="button"
                  className="cb-checkout-review-addon-pill-qty-btn"
                  aria-label="Increase"
                  disabled={x.qty >= REVIEW_ADDON_MAX_QTY}
                  onClick={() => setSlotAddonQty(x.addonId, x.slotKey, x.qty + 1)}
                >
                  +
                </button>
              </span>
            ) : (
              <span className="cb-checkout-review-addon-pill-qty-static">× {x.qty}</span>
            )}
          </div>
        );
      };

      const nestedAddonRows = (
        items: { addonId: number; name: string; perUnitAmount: number; qty: number; slotKey: string }[]
      ) => (
        <div className="cb-checkout-review-addon-stack">
          {items.map((x) => nestedAddonRow(x))}
        </div>
      );

      const simpleExtraCard = (
        k: string,
        title: string,
        amount: number,
        opts2?: { classSuffix?: string; unitSubtitle?: string; onRemove?: () => void }
      ) => (
        <li
          key={k}
          className={`cb-checkout-review-card${opts2?.classSuffix ? ` ${opts2.classSuffix}` : ""}`}
        >
          <div className="cb-checkout-review-card-head">
            <p className="cb-checkout-review-card-title">{title}</p>
            {opts2?.onRemove ? (
              <div className="cb-checkout-review-card-actions">
                <button
                  type="button"
                  className="cb-checkout-review-card-icon-btn cb-checkout-review-card-icon-btn--danger"
                  onClick={opts2.onRemove}
                  aria-label={tx("remove")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
          {opts2?.unitSubtitle ? (
            <div className="cb-checkout-review-unit-price-row">
              <p className="cb-checkout-review-card-unit cb-muted">{opts2.unitSubtitle}</p>
              <span className="cb-checkout-review-meta-price">{reviewMoney(undefined, amount)}</span>
            </div>
          ) : null}
          <div className="cb-checkout-review-item-total">
            <span className="cb-checkout-review-item-total-label">{tx("itemTotal")}</span>
            <span className="cb-checkout-review-item-total-value">{fmtBookingMoney(amount)}</span>
          </div>
        </li>
      );

      return (
        <div
          className="cb-checkout-presummary cb-checkout-presummary--review"
          aria-labelledby={opts.headingId}
        >
          <div className="cb-checkout-summary-step-hero">
            <div className="cb-checkout-summary-step-hero-icon" aria-hidden>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 id={opts.headingId} className="cb-checkout-presummary-title">
              {tx("bookingSummary")}
            </h3>
            {opts.showReviewHint ? (
              <p className="cb-checkout-presummary-review-hint cb-muted text-sm leading-snug mb-0">
                {tx("bookingSummaryReviewHint")}
              </p>
            ) : null}
          </div>
          <div className="cb-checkout-presummary-participant">
          {presummaryParticipantPhoto ? (
            <img
              className="cb-checkout-presummary-participant-photo"
              src={presummaryParticipantPhoto}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="cb-checkout-presummary-participant-avatar" aria-hidden />
          )}
          <div className="cb-checkout-presummary-participant-text">
            <span className="cb-checkout-presummary-participant-name">{bookingForLabel}</span>
            {presummaryParticipantDemo ? (
              <span className="cb-checkout-presummary-participant-demo">{presummaryParticipantDemo}</span>
            ) : null}
          </div>
          {bookingForBadge ? (
            <span className="cb-checkout-presummary-participant-badge cb-member-badge cb-member-badge--gold">
              {bookingForBadge}
            </span>
          ) : null}
        </div>
          <ul className="cb-checkout-review-card-list">
            {m.slotItems.map((s) => (
              <li key={s.key} className="cb-checkout-review-card">
                <div className="cb-checkout-review-card-head">
                  <div className="cb-checkout-review-card-head-text">
                    <p className="cb-checkout-review-card-title">{s.title}</p>
                  </div>
                  <div className="cb-checkout-review-card-actions">
                    {opts.onRemoveSlot ? (
                      <button
                        type="button"
                        className="cb-checkout-review-card-icon-btn cb-checkout-review-card-icon-btn--remove"
                        onClick={() => opts.onRemoveSlot!(s.slotKey)}
                        aria-label={tx("removeSlot")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
                <ul className="cb-checkout-review-meta-rows cb-checkout-review-meta-rows--strong">
                  <li className="cb-checkout-review-meta-row">
                    <span className="cb-checkout-review-meta-icon" aria-hidden>
                      {s.resourceIsInstructor ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
                          <path
                            d="M5.5 19c1.25-2.75 3.75-4.25 6.5-4.25s5.25 1.5 6.5 4.25"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 21s6.25-4.15 6.25-9.5a6.25 6.25 0 1 0-12.5 0C5.75 16.85 12 21 12 21z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="11" r="1.75" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                      )}
                    </span>
                    <span>{s.resourceLine}</span>
                  </li>
                  <li className="cb-checkout-review-meta-row">
                    <span className="cb-checkout-review-meta-icon" aria-hidden>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="4.5" y="5.5" width="15" height="14" rx="2.25" stroke="currentColor" strokeWidth="1.6"/>
                        <path d="M8.5 3.75v3.5M15.5 3.75v3.5M4.75 10h14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <span className="cb-checkout-review-meta-line" title={s.calendarLine}>{s.calendarLine}</span>
                  </li>
                </ul>
                <p className="cb-checkout-review-card-unit cb-checkout-review-card-unit--price cb-muted">
                  <span className="cb-checkout-review-card-unit-icon" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 12V7.5A2.5 2.5 0 0 0 17.5 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19h11a2.5 2.5 0 0 0 2.5-2.5V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M4 9h16M16 13h4v3h-4a1.5 1.5 0 0 1 0-3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{s.unitSubtitle}</span>
                </p>
                {s.discountNote ? (
                  <div className="cb-checkout-review-promo-row">
                    <span className="cb-checkout-promo-pill">{s.discountNote}</span>
                  </div>
                ) : null}
                {s.nestedAddons.length > 0 ? (
                  <div className="cb-checkout-review-addon-block">
                    {nestedAddonRows(s.nestedAddons)}
                  </div>
                ) : null}
                <div className="cb-checkout-review-item-total">
                  <span className="cb-checkout-review-item-total-label">{tx("itemTotal")}</span>
                  <span className="cb-checkout-review-item-total-value">
                    {fmtBookingMoney(
                      s.amount + s.nestedAddons.reduce((sum, a) => sum + a.amount, 0)
                    )}
                  </span>
                </div>
              </li>
            ))}
            {m.reservationAddonItems.map((x) => {
              const perUnitAmount = x.qty > 0 ? x.amount / x.qty : x.amount;
              const canStep = Boolean(onSetAddonQty);
              const setReservationQty = (next: number) => {
                if (!onSetAddonQty) return;
                const v = Math.min(REVIEW_ADDON_MAX_QTY, Math.max(0, Math.round(next)));
                onSetAddonQty(x.addonId, v);
              };
              return (
                <li key={x.key} className="cb-checkout-review-card">
                  <div className="cb-checkout-review-card-head">
                    <p className="cb-checkout-review-card-title">{x.name}</p>
                    <div className="cb-checkout-review-card-actions">
                      {opts.onRemoveAddon ? (
                        <button
                          type="button"
                          className="cb-checkout-review-card-icon-btn cb-checkout-review-card-icon-btn--danger"
                          onClick={() => opts.onRemoveAddon?.(x.addonId)}
                          aria-label={tx("removeAddon")}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {x.unitSubtitle ? (
                    <p className="cb-checkout-review-card-unit cb-checkout-review-card-unit--strong">
                      {x.unitSubtitle}
                    </p>
                  ) : null}
                  <div className="cb-checkout-review-addon-block">
                    <div className="cb-checkout-review-addon-stack">
                      <div className="cb-checkout-review-addon-pill">
                        <span className="cb-checkout-review-addon-pill-icon" aria-hidden>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H5v4h4V5zM19 5h-4v4h4V5zM9 15H5v4h4v-4zM19 15h-4v4h4v-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="cb-checkout-review-addon-pill-name" title={x.name}>{x.name}</span>
                        <span className="cb-checkout-review-addon-pill-price">{fmtBookingMoney(perUnitAmount)}</span>
                        {canStep ? (
                          <span className="cb-checkout-review-addon-pill-qty" role="group" aria-label={tx("quantity")}>
                            <button
                              type="button"
                              className="cb-checkout-review-addon-pill-qty-btn"
                              aria-label="Decrease"
                              onClick={() => setReservationQty(x.qty - 1)}
                            >
                              −
                            </button>
                            <span className="cb-checkout-review-addon-pill-qty-val" aria-live="polite">{x.qty}</span>
                            <button
                              type="button"
                              className="cb-checkout-review-addon-pill-qty-btn"
                              aria-label="Increase"
                              disabled={x.qty >= REVIEW_ADDON_MAX_QTY}
                              onClick={() => setReservationQty(x.qty + 1)}
                            >
                              +
                            </button>
                          </span>
                        ) : (
                          <span className="cb-checkout-review-addon-pill-qty-static">× {x.qty}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="cb-checkout-review-item-total">
                    <span className="cb-checkout-review-item-total-label">{tx("itemTotal")}</span>
                    <span className="cb-checkout-review-item-total-value">{fmtBookingMoney(x.amount)}</span>
                  </div>
                </li>
              );
            })}
            {m.otherRequiredItems.map((x) =>
              simpleExtraCard(x.key, x.name, x.amount, { unitSubtitle: x.unitSubtitle })
            )}
            {m.membershipItems.map((x) =>
              simpleExtraCard(x.key, x.name, x.amount, {
                classSuffix: "cb-checkout-review-card--membership",
                unitSubtitle: x.unitSubtitle,
              })
            )}
          </ul>
          <div className="cb-checkout-presummary-tax-panel">
            <svg className="cb-checkout-presummary-tax-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8.5v0.01M11.25 11h1v5h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="cb-checkout-presummary-tax-text">{tx("taxDiscountsCheckoutNote")}</span>
          </div>
          <div className="cb-checkout-presummary-totals cb-checkout-presummary-totals--flat">
            <CbCheckoutTotalRow
              variant="grand"
              label={tx("total")}
              value={
                <strong>
                  {presummaryPrecheckoutAmountDue != null
                    ? formatPrice(presummaryPrecheckoutAmountDue, bagCurrency)
                    : presummaryAggregates.cartGrandTotal != null
                      ? formatPrice(presummaryAggregates.cartGrandTotal, bagCurrency)
                      : "—"}
                </strong>
              }
            />
          </div>
        </div>
      );
    }

    return null;
  };

  /**
   * Shared confirmation body. `finalizeSuccess` can be set from either bag-mode
   * (Pay in full / Pay minimum / Submit request CTAs added in e896dee) or
   * checkout-mode, so the early return below routes both modes to this one view.
   */
  const finalizeConfirmationBody =
    finalizeSuccess != null ? (
      <div
        className="cb-checkout-finalize-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cb-finalize-title"
      >
        <div className="cb-booking-confirmed">
          <div className="cb-booking-confirmed-hero">
            <div className="cb-booking-confirmed-icon cb-booking-confirmed-icon--success" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 id="cb-finalize-title" className="cb-booking-confirmed-title">
              {tx("bookingConfirmedTitle")}
            </h2>
            <p className="cb-booking-confirmed-sub cb-muted">
              {finalizeCheckoutKind === "submit"
                ? tx("bookingConfirmedSubtitleSubmit")
                : tx("bookingConfirmedSubtitle")}
            </p>
          </div>
          <div className="cb-booking-confirmed-details">
            <div className="cb-booking-confirmed-detail-row cb-booking-confirmed-detail-row--inline-copy">
              <span className="cb-booking-confirmed-detail-label">
                {tx("reservationLabel")}
                <span className="cb-booking-confirmed-detail-colon" aria-hidden>
                  :
                </span>
              </span>
              <div className="cb-booking-confirmed-detail-inline-value">
                {finalizeReservationDisplay != null ? (
                  <span className="cb-booking-confirmed-invoice-id cb-booking-confirmed-invoice-id--plain cb-booking-confirmed-invoice-id--inline">
                    {finalizeReservationDisplay}
                  </span>
                ) : (
                  <a
                    className="cb-booking-confirmed-invoice-id cb-booking-confirmed-invoice-id--inline"
                    href={consumerReservationsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx("goToReservations")}
                  </a>
                )}
                <button
                  type="button"
                  className="cb-booking-confirmed-copy-icon"
                  onClick={() =>
                    copyFinalizeClipboard(
                      finalizeReservationDisplay ?? consumerReservationsUrl(),
                      "reservations"
                    )
                  }
                  aria-label={finalizeCopyFlash === "reservations" ? tx("copied") : tx("copyId")}
                >
                  {finalizeCopyFlash === "reservations" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {finalizeCheckoutKind === "pay" && finalizeInvoiceDisplayPretty != null ? (
              <div className="cb-booking-confirmed-detail-row cb-booking-confirmed-detail-row--inline-copy">
                <span className="cb-booking-confirmed-detail-label">
                  {tx("invoiceLabel")}
                  <span className="cb-booking-confirmed-detail-colon" aria-hidden>
                    :
                  </span>
                </span>
                <div className="cb-booking-confirmed-detail-inline-value">
                  {finalizeInvoicePortalUrl != null ? (
                    <a
                      className="cb-booking-confirmed-invoice-id cb-booking-confirmed-invoice-id--inline"
                      href={finalizeInvoicePortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {finalizeInvoiceDisplayPretty}
                    </a>
                  ) : (
                    <span className="cb-booking-confirmed-invoice-id cb-booking-confirmed-invoice-id--plain cb-booking-confirmed-invoice-id--inline">
                      {finalizeInvoiceDisplayPretty}
                    </span>
                  )}
                  <button
                    type="button"
                    className="cb-booking-confirmed-copy-icon"
                    onClick={() => copyFinalizeClipboard(finalizeInvoiceDisplayPretty, "invoice")}
                    aria-label={finalizeCopyFlash === "invoice" ? tx("copied") : tx("copyId")}
                  >
                    {finalizeCopyFlash === "invoice" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <p className="cb-booking-confirmed-email cb-muted text-center text-sm">
            {confirmationAccountEmail != null
              ? tx("confirmationEmailSent", { email: confirmationAccountEmail })
              : tx("confirmationEmailGeneric")}
          </p>
          <div className="cb-booking-confirmed-actions cb-booking-confirmed-actions--adjacent">
            <button type="button" className="cb-btn-outline cb-booking-confirmed-action-btn" onClick={openCalendarTemplate}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="cb-booking-confirmed-action-btn-icon"
              >
                <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {tx("addToCalendar")}
            </button>
            <button
              type="button"
              className="cb-btn-primary cb-booking-confirmed-action-btn"
              onClick={dismissBookingConfirmed}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="cb-booking-confirmed-action-btn-icon"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {tx("done")}
            </button>
          </div>
        </div>
      </div>
    ) : null;

  // Confirmation view wins over both bag and checkout renders so submission
  // from either mode lands on the "Booking Confirmed" / "Booking Submitted" screen.
  if (finalizeConfirmationBody != null) {
    return (
      <RightDrawer
        open={open}
        onClose={safeOnClose}
        ariaLabel={tx("bookingConfirmedTitle")}
        hideTitle={true}
        panelClassName={panelCls}
      >
        {finalizeConfirmationBody}
      </RightDrawer>
    );
  }

  if (mode === "bag") {
    const groupedCartCards = groupedBagWithTotals.map((section) => ({
      label: section.label,
      cards: section.items.flatMap((item) =>
        checkoutCardsFromSnapshot(item.row, item.index, {
          ...(item.cartFlatLineIndices != null ? { cartFlatLineIndices: item.cartFlatLineIndices } : {}),
          ...(item.subsectionBookingForLabel != null
            ? { subsectionBookingForLabel: item.subsectionBookingForLabel }
            : {}),
        }),
      ),
    }));
    /**
     * Bag-wide totals. Approval classification walks each row's `cartItems[].metadata.purchaseType`
     * with the snapshot's `approvalByProductId` map as the legacy fallback. We do **not** rely on
     * `minimumPrice < price` because that's also true for any deposit-required cart.
     */
    const sumPerRow = (pick: (row: SessionCartSnapshot) => number | null): number => {
      let sum = 0;
      for (const row of bagSnapshots) {
        const v = row.cart ? pick(row) : null;
        if (v != null) sum += v;
      }
      return Math.round(sum * 100) / 100;
    };
    const approvalMapForRow = (row: SessionCartSnapshot) => row.approvalByProductId;
    const cartFullDollars = sumPerRow((row) =>
      typeof row.cart?.price === "number" ? row.cart.price : null,
    );
    const cartChargeableDollars = sumPerRow((row) =>
      cartChargeableTotal(row.cart, approvalMapForRow(row)),
    );
    const cartMinimumDollars = bagSnapshots.some((r) => r.cart && cartChargeableMinimum(r.cart) != null)
      ? sumPerRow((row) => cartChargeableMinimum(row.cart))
      : null;
    const hasApprovalSplit = bagSnapshots.some(
      (r) => r.cart != null && cartHasApprovalSplit(r.cart, approvalMapForRow(r)),
    );
    const cartApprovalSubDollars = hasApprovalSplit
      ? sumPerRow((row) => cartApprovalSubtotal(row.cart, approvalMapForRow(row)))
      : null;

    /**
     * Cart-state machine, drives the banner + footer button layout in the bag drawer.
     * Maps to the four Figma cart states (1.1 / 1.2 / 1.3 / 1.4).
     */
    const cartFooterState: "request_only" | "split" | "deposit" | "pay_full" =
      bagPolicyBag === "all_submission"
        ? "request_only"
        : hasApprovalSplit
          ? "split"
          : cartMinimumDollars != null && cartMinimumDollars > 0
            ? "deposit"
            : "pay_full";

    const aggregateDiscountTotal =
      bagSessionAggregates.discountTotal != null && bagSessionAggregates.discountTotal > 0.0001
        ? bagSessionAggregates.discountTotal
        : null;
    const aggregateTaxTotal = bagSessionAggregates.taxTotal ?? null;
    const hasDepositEntry = cartFooterState === "deposit" || cartFooterState === "split";
    const customDepositMin = cartMinimumDollars ?? 0;
    const customDepositMax = cartChargeableDollars;
    const customDepositValue = customAmountInput;
    const customDepositParsed = Number.parseFloat(customDepositValue);
    const customDepositValid =
      hasDepositEntry &&
      Number.isFinite(customDepositParsed) &&
      customDepositParsed >= customDepositMin &&
      customDepositParsed <= customDepositMax + BOND_KIND_LINE_MIN;
    const customDepositAmount = customDepositValid
      ? Math.round(customDepositParsed * CURRENCY_CENTS) / CURRENCY_CENTS
      : null;
    const customDepositErrorVisible = customAmountInput.trim().length > 0 && !customDepositValid;

    return (
      <RightDrawer
        open={open}
        onClose={safeOnClose}
        onBack={showDrawerBack ? handleToolbarBack : undefined}
        ariaLabel={tx("bagTitle")}
        title={title}
        hideTitle={true}
        panelClassName={panelCls}
      >
          <div className="cb-checkout-inner cb-checkout-inner--bag cb-co-shell">
          {bagSnapshots.length > 0 ? (
            <div className="cb-co-hero">
              <div className="cb-co-hero-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6h15l-1.5 9h-12L6 6zM4 6h2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="cb-co-hero-title">{tx("cartCheckoutHeading")}</h2>
              <p className="cb-co-hero-sub">{tx("cartCheckoutSubtitle")}</p>
            </div>
          ) : null}

          {bagSnapshots.length === 0 ? (
            <div className="cb-bag-empty" role="status" aria-live="polite">
              <div className="cb-bag-empty-icon" aria-hidden>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6h15l-1.5 9h-12L6 6zM4 6h2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="cb-bag-empty-title">{tx("cartEmptyTitle")}</h3>
              <p className="cb-bag-empty-subtitle">{tx("cartEmptySubtitle")}</p>
              <button
                type="button"
                className="cb-btn-primary cb-bag-empty-cta"
                onClick={safeOnClose}
              >
                {tx("cartEmptyCta")}
              </button>
            </div>
          ) : (
            <>
              <section className="cb-co-section">
                <h3 className="cb-co-section-title">{tx("cartOrderSummary")}</h3>
                {groupedCartCards.map((section, sectionIndex) => (
                  <section key={`${section.label}-${sectionIndex}`} className="cb-co-card-group">
                    <h4 className="cb-co-card-group-title">
                      {groupHeadingForBooking(section.label, sectionIndex, groupedCartCards.length, tx)}
                    </h4>
                    <ul className="cb-co-card-list">
                      {section.cards.map((card) => (
                        <CheckoutItemCard
                          key={card.key}
                          card={card}
                          currency={bagCurrency}
                          formatPrice={formatPrice}
                          hideParticipantMeta
                          onRemove={onRemoveBagLine ? handleCheckoutCardRemove : undefined}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </section>

              <div className="cb-co-divider" aria-hidden />

              <section className="cb-co-section">
                <h3 className="cb-co-section-title">{tc("paymentMethodSectionTitle")}</h3>
                {paymentOptionsQuery.isPending ? (
                  <p className="cb-muted text-sm">{tc("loading")}</p>
                ) : paymentOptionsQuery.isError ? (
                  <p className="text-sm text-[var(--cb-error-text)]" role="alert">
                    {formatConsumerBookingErrorUnknown(paymentOptionsQuery.error, te, {
                      customerLabel: bookingForLabel,
                      orgName: orgDisplayName,
                      productName,
                    })}
                  </p>
                ) : paymentChoices.length === 0 ? (
                  <p className="cb-muted text-sm">{tx("addPaymentWhenAvailable")}</p>
                ) : (
                  <div
                    className="cb-checkout-payment-method-list"
                    role="radiogroup"
                    aria-label={tx("selectPaymentMethod")}
                  >
                    {paymentChoices.map((pm) => {
                      const selected = selectedPaymentMethodId === pm.id;
                      const inputId = `cb-bag-pay-${pm.id}`;
                      return (
                        <label key={pm.id} htmlFor={inputId} className="cb-checkout-payment-method-card">
                          <input
                            id={inputId}
                            type="radio"
                            name="bond-bag-pm"
                            checked={selected}
                            onChange={() => setSelectedPaymentMethodId(pm.id)}
                          />
                          <span className="cb-checkout-payment-method-card-icon" aria-hidden>
                            {pm.methodType === "us_bank_account" ? (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M4 8h16v10H4V8zM2 6h20v2H2V6zm4 4h6v2H6v-2zm0 4h4v2H6v-2z"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M2.5 10h19" stroke="currentColor" strokeWidth="1.4" />
                              </svg>
                            )}
                          </span>
                          <span className="cb-checkout-payment-method-card-body">
                            <span className="cb-checkout-payment-method-card-title">{pm.displayPrimary}</span>
                            {pm.displayExpiry ? (
                              <span className="cb-checkout-payment-method-card-exp">
                                {tc("cardExpiresShort", { date: pm.displayExpiry })}
                              </span>
                            ) : null}
                          </span>
                          {pm.isDefaultPaymentMethod ? (
                            <span className="cb-checkout-payment-method-card-badge">{tc("defaultPaymentBadge")}</span>
                          ) : null}
                        </label>
                      );
                    })}
                    <div className="cb-checkout-payment-add-actions">
                      <button type="button" className="cb-checkout-payment-add-card" onClick={() => setPaymentModal("card")}>
                        {tc("addNewCard")}
                      </button>
                      <button type="button" className="cb-checkout-payment-add-card" onClick={() => setPaymentModal("bank")}>
                        {tc("addBankAccount")}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <div className="cb-co-divider" aria-hidden />

              {cartFooterState === "split" && cartApprovalSubDollars != null ? (
                <div className="cb-co-totals-box cb-co-totals-box--approval">
                  <p className="cb-co-totals-box-label">{tx("cartApprovalItemsBoxLabel")}</p>
                  <div className="cb-co-totals-row cb-co-totals-row--subtotal">
                    <span>{tx("cartSubtotal")}</span>
                    <span>{formatPrice(cartApprovalSubDollars, bagCurrency)}</span>
                  </div>
                  {aggregateDiscountTotal != null ? (
                    <div className="cb-co-totals-row cb-co-totals-row--discount">
                      <span>{tx("cartDiscounts")}</span>
                      <span>−{formatPrice(aggregateDiscountTotal, bagCurrency)}</span>
                    </div>
                  ) : null}
                  {aggregateTaxTotal != null ? (
                    <div className="cb-co-totals-row cb-co-totals-row--tax">
                      <span>{tx("cartTax")}</span>
                      <span>{formatPrice(aggregateTaxTotal, bagCurrency)}</span>
                    </div>
                  ) : null}
                  <div className="cb-co-totals-row cb-co-totals-row--grand">
                    <span>{tx("cartTotal")}</span>
                    <strong>{formatPrice(cartApprovalSubDollars, bagCurrency)}</strong>
                  </div>
                  <div className="cb-co-totals-box-note" role="note">
                    <TotalsBoxNoteInfoIcon />
                    <span className="cb-co-totals-box-note-text">{tx("cartApprovalItemsBoxNote")}</span>
                  </div>
                </div>
              ) : null}

              {cartFooterState !== "request_only" ? (() => {
                const grand = cartChargeableDollars || cartFullDollars;
                const taxN = aggregateTaxTotal ?? 0;
                const discN = aggregateDiscountTotal ?? 0;
                const preTaxSubtotal = Math.max(
                  0,
                  Math.round((grand - taxN + discN) * CURRENCY_CENTS) / CURRENCY_CENTS,
                );
                return (
                  <div className="cb-co-totals-box">
                    {cartFooterState === "split" ? (
                      <p className="cb-co-totals-box-label">{tx("cartInvoicedItemsBoxLabel")}</p>
                    ) : null}
                    <div className="cb-co-totals-row cb-co-totals-row--subtotal">
                      <span>{tx("cartSubtotal")}</span>
                      <span>{formatPrice(preTaxSubtotal, bagCurrency)}</span>
                    </div>
                    {aggregateDiscountTotal != null ? (
                      <div className="cb-co-totals-row cb-co-totals-row--discount">
                        <span className="cb-co-totals-row-label">{tx("cartDiscounts")}</span>
                        <span>−{formatPrice(aggregateDiscountTotal, bagCurrency)}</span>
                      </div>
                    ) : null}
                    {aggregateTaxTotal != null ? (
                      <div className="cb-co-totals-row cb-co-totals-row--tax">
                        <span className="cb-co-totals-row-label">{tx("cartTax")}</span>
                        <span>{formatPrice(aggregateTaxTotal, bagCurrency)}</span>
                      </div>
                    ) : null}
                    <div className="cb-co-totals-row cb-co-totals-row--grand">
                      <span>{tx("cartTotal")}</span>
                      <strong>{formatPrice(grand, bagCurrency)}</strong>
                    </div>
                  </div>
                );
              })() : (
                <div className="cb-co-totals-box cb-co-totals-box--approval">
                  <p className="cb-co-totals-box-label">{tx("cartApprovalItemsBoxLabel")}</p>
                  <div className="cb-co-totals-row cb-co-totals-row--subtotal">
                    <span>{tx("cartSubtotal")}</span>
                    <span>{formatPrice(cartFullDollars, bagCurrency)}</span>
                  </div>
                  {aggregateDiscountTotal != null ? (
                    <div className="cb-co-totals-row cb-co-totals-row--discount">
                      <span>{tx("cartDiscounts")}</span>
                      <span>−{formatPrice(aggregateDiscountTotal, bagCurrency)}</span>
                    </div>
                  ) : null}
                  {aggregateTaxTotal != null ? (
                    <div className="cb-co-totals-row cb-co-totals-row--tax">
                      <span>{tx("cartTax")}</span>
                      <span>{formatPrice(aggregateTaxTotal, bagCurrency)}</span>
                    </div>
                  ) : null}
                  <div className="cb-co-totals-row cb-co-totals-row--grand">
                    <span>{tx("cartTotal")}</span>
                    <strong>{formatPrice(cartFullDollars, bagCurrency)}</strong>
                  </div>
                  <div className="cb-co-totals-box-note" role="note">
                    <TotalsBoxNoteInfoIcon />
                    <span className="cb-co-totals-box-note-text">{tx("cartApprovalItemsBoxNote")}</span>
                  </div>
                </div>
              )}

              {hasDepositEntry ? (
                <div className="cb-co-custom-deposit">
                  <div className="cb-co-custom-deposit-note" role="note">
                    <TotalsBoxNoteInfoIcon />
                    <span className="cb-co-custom-deposit-note-text">{tx("cartDepositBoxNote")}</span>
                  </div>
                  <div className="cb-co-custom-deposit-field">
                    <label className="cb-co-custom-deposit-label" id="cb-co-custom-deposit-label" htmlFor="cb-co-custom-deposit-input">
                      {tx("cartCustomLabel")}
                      <span className="cb-co-custom-deposit-required" aria-hidden>
                        *
                      </span>
                    </label>
                    <span className="cb-co-custom-deposit-input-wrap">
                      <span className="cb-co-custom-deposit-prefix" aria-hidden>
                        $
                      </span>
                      <input
                        id="cb-co-custom-deposit-input"
                        type="number"
                        inputMode="decimal"
                        min={customDepositMin}
                        max={customDepositMax}
                        step={CURRENCY_INPUT_STEP}
                        value={customDepositValue}
                        onChange={(e) => setCustomAmountInput(e.target.value)}
                        className="cb-co-custom-deposit-input"
                      />
                    <button
                      type="button"
                      className="cb-co-custom-deposit-reset"
                      aria-label="Reset custom deposit to minimum due"
                      onClick={() => setCustomAmountInput(customDepositMin.toFixed(CURRENCY_INPUT_DECIMALS))}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M3 12a9 9 0 0 1 15.5-6.25L21 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    </span>
                  </div>
                  {customDepositErrorVisible ? (
                    <p className="cb-co-custom-deposit-error" role="alert">
                      {tx("cartCustomError", {
                        min: formatPrice(customDepositMin, bagCurrency),
                        max: formatPrice(customDepositMax, bagCurrency),
                      })}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {submitBookingRequestMutation.isError ? (
                <p className="mt-2 mb-3 text-sm text-[var(--cb-error-text)]" role="alert">
                  {formatConsumerBookingErrorUnknown(submitBookingRequestMutation.error, te, {
                    customerLabel: bookingForLabel,
                    orgName: orgDisplayName,
                    productName,
                  })}
                </p>
              ) : null}

              <div className="cb-co-actions">
                {cartFooterState === "request_only" ? (
                  <button
                    type="button"
                    className="cb-co-btn cb-co-btn--primary"
                    disabled={
                      submitBookingRequestMutation.isPending ||
                      paymentOptionsQuery.isPending ||
                      (paymentChoices.length > 0 && selectedPaymentMethodId == null)
                    }
                    onClick={requestBookingSubmit}
                  >
                    <CbBusyInline busy={submitBookingRequestMutation.isPending}>
                      {submitBookingRequestMutation.isPending ? tx("submitting") : tx("cartBtnSubmitRequest")}
                    </CbBusyInline>
                  </button>
                ) : cartFooterState === "deposit" || cartFooterState === "split" ? (
                  <>
                    <button
                      type="button"
                      className="cb-co-btn cb-co-btn--outline"
                      disabled={
                        submitBookingRequestMutation.isPending ||
                        paymentOptionsQuery.isPending ||
                        (paymentChoices.length > 0 && selectedPaymentMethodId == null)
                      }
                      onClick={requestBookingSubmit}
                    >
                      <CbBusyInline busy={submitBookingRequestMutation.isPending && submitKind === "full"}>
                        {submitBookingRequestMutation.isPending && submitKind === "full"
                          ? tx("submitting")
                          : tx("cartBtnPayFull", { amount: formatPrice(cartChargeableDollars, bagCurrency) })}
                      </CbBusyInline>
                    </button>
                    <button
                      type="button"
                      className="cb-co-btn cb-co-btn--primary"
                      disabled={
                        submitBookingRequestMutation.isPending ||
                        paymentOptionsQuery.isPending ||
                        (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                        customDepositAmount == null
                      }
                      onClick={() => {
                        if (customDepositAmount == null) return;
                        setSubmitKind("deposit");
                        submitBookingRequestMutation.mutate(customDepositAmount);
                      }}
                    >
                      <CbBusyInline busy={submitBookingRequestMutation.isPending && submitKind === "deposit"}>
                        {submitBookingRequestMutation.isPending && submitKind === "deposit"
                          ? tx("submitting")
                          : tx("cartBtnPayMin", {
                              amount: formatPrice(customDepositAmount ?? customDepositMin, bagCurrency),
                            })}
                      </CbBusyInline>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="cb-co-btn cb-co-btn--primary"
                    disabled={
                      submitBookingRequestMutation.isPending ||
                      paymentOptionsQuery.isPending ||
                      (paymentChoices.length > 0 && selectedPaymentMethodId == null)
                    }
                    onClick={requestBookingSubmit}
                  >
                    <CbBusyInline busy={submitBookingRequestMutation.isPending}>
                      {submitBookingRequestMutation.isPending
                        ? tx("submitting")
                        : tx("cartBtnPayNow", { amount: formatPrice(cartChargeableDollars, bagCurrency) })}
                    </CbBusyInline>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        {paymentMethodModal}
      </RightDrawer>
    );
  }

  // `finalizeSuccess != null` is handled by the shared early return above, so this path
  // is always the "normal checkout UI" case.
  return (
    <RightDrawer
      open={open}
      onClose={safeOnClose}
      onBack={showDrawerBack ? handleToolbarBack : undefined}
      ariaLabel={title}
      title={title}
      panelClassName={panelCls}
    >
      <Fragment>
        <>
          <div className="cb-checkout-inner">
        {showPreCheckoutShell ? (
          <>
            <div className="cb-checkout-progress">
              {onBookingForClick ? (
                <button
                  type="button"
                  className="cb-checkout-booking-for cb-checkout-booking-for--trigger"
                  onClick={onBookingForClick}
                >
                  {tx("bookingForInline")} <strong>{bookingForLabel}</strong>
                  {bookingForBadge ? (
                    <span className="cb-member-badge cb-member-badge--gold ml-2">{bookingForBadge}</span>
                  ) : null}
                  <span className="cb-checkout-booking-for-chev" aria-hidden>
                    {" "}
                    ▾
                  </span>
                </button>
              ) : (
                <p className="cb-checkout-booking-for">
                  {tx("bookingForInline")} <strong>{bookingForLabel}</strong>
                  {bookingForBadge ? (
                    <span className="cb-member-badge cb-member-badge--gold ml-2">{bookingForBadge}</span>
                  ) : null}
                </p>
              )}
              <p className="cb-checkout-step-pill">{preCheckoutStepLabel}</p>
              {totalPreSteps > 0 ? (
                <div className="cb-checkout-progress-bar" aria-hidden>
                  {Array.from({ length: totalPreSteps }, (_, i) => (
                    <span
                      key={i}
                      className={currentPreStepNumber > i ? "cb-checkout-progress-fill" : ""}
                    />
                  ))}
                </div>
              ) : null}
            </div>

          </>
        ) : null}

        {step === "addedToCart" ? (
          <div className="cb-checkout-step cb-checkout-added-to-cart">
            <div className="cb-checkout-added-to-cart-icon-wrap" aria-hidden>
              <div className="cb-checkout-added-to-cart-icon-ring">
                <svg
                  className="cb-checkout-added-to-cart-check"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h2 className="cb-checkout-added-to-cart-title">{tx("addedToCartTitle")}</h2>
            <p className="cb-checkout-added-to-cart-sub cb-muted text-center text-sm leading-relaxed">
              {tx("addedToCartSubtitle")}
            </p>
            <div className="cb-checkout-added-to-cart-actions">
              <button
                type="button"
                className="cb-btn-outline cb-checkout-added-to-cart-btn"
                onClick={() => (onBookAnotherRental ?? onClose)()}
              >
                <span className="cb-checkout-added-to-cart-plus" aria-hidden>
                  +
                </span>
                {tx("bookAnotherRental")}
              </button>
              <button
                type="button"
                className="cb-btn-primary cb-checkout-added-to-cart-btn"
                onClick={() => {
                  if (onGoToCart) onGoToCart();
                  else setStep("payment");
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="cb-checkout-added-to-cart-cart-icon"
                >
                  <path
                    d="M6 6h15l-1.5 9h-12L6 6zM4 6h2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {tx("continueToPayment")}
              </button>
            </div>
          </div>
        ) : null}

        {step === "payment" ? (
          <div className="cb-checkout-step">
            <div className="cb-checkout-payment-hero">
              <div className="cb-checkout-payment-hero-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6h15l-1.5 9h-12L6 6zM4 6h2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="cb-checkout-payment-hero-title">{tx("checkoutHeroTitle")}</p>
              <p className="cb-checkout-payment-hero-sub cb-muted text-sm">{tx("checkoutHeroSubtitle")}</p>
            </div>
            {groupedBagWithTotals.length <= 1 ? (
              <p className="cb-checkout-payment-booking-for cb-muted mb-3 text-sm">
                {paymentHeadline.kind === "single" ? (
                  <>
                    {tx("bookingForInline")}{" "}
                    <strong className="text-[var(--cb-text)]">{paymentHeadline.text}</strong>
                  </>
                ) : (
                  <>
                    {tx("bookingsForInline")}{" "}
                    <strong className="text-[var(--cb-text)]">{paymentHeadline.text}</strong>
                  </>
                )}
              </p>
            ) : (
              <p className="cb-muted mb-3 text-sm">{tx("purchasesGroupedByMember")}</p>
            )}
            <h3 className="cb-checkout-section-title">{tx("orderSummary")}</h3>
            {bagPolicyCheckout === "mixed" ? (
              <div className="cb-checkout-mixed-cart-banner" role="note">
                <span className="cb-checkout-mixed-cart-banner-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 10v5M12 7v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="cb-checkout-mixed-cart-banner-text">{tx("mixedCartPolicyBanner")}</p>
              </div>
            ) : null}
            <div className="cb-checkout-payment-purchase-groups mb-4">
              {groupedBagWithTotals.map((section, si) => (
                <section key={`${section.label}-${si}`} className="cb-checkout-payment-group">
                  <h4 className="cb-checkout-payment-group-title">
                    {groupHeadingForBooking(section.label, si, Math.max(1, paymentSectionCount), tx)}
                  </h4>
                  <ul className="cb-co-card-list">
                    {section.items.flatMap((item) =>
                      checkoutCardsFromSnapshot(item.row, item.index, {
                        ...(item.cartFlatLineIndices != null ? { cartFlatLineIndices: item.cartFlatLineIndices } : {}),
                        ...(item.subsectionBookingForLabel != null
                          ? { subsectionBookingForLabel: item.subsectionBookingForLabel }
                          : {}),
                      }).map((card) => (
                        <CheckoutItemCard
                          key={card.key}
                          card={card}
                          currency={bagCurrency}
                          formatPrice={formatPrice}
                          hideParticipantMeta
                          onRemove={onRemoveBagLine ? handleCheckoutCardRemove : undefined}
                        />
                      ))
                    )}
                  </ul>
                </section>
              ))}
              {groupedTailPaymentSections.map((section, si) => (
                <section key={`tail-${section.label}-${si}`} className="cb-checkout-payment-group">
                  <h4 className="cb-checkout-payment-group-title">
                    {groupHeadingForBooking(
                      section.label,
                      groupedBagWithTotals.length + si,
                      Math.max(1, paymentSectionCount),
                      tx
                    )}
                  </h4>
                  <ul className="cb-co-card-list">
                    {section.items.flatMap((item) =>
                      checkoutCardsFromSnapshot(item.row, item.index, {
                        ...(item.cartFlatLineIndices != null ? { cartFlatLineIndices: item.cartFlatLineIndices } : {}),
                        ...(item.subsectionBookingForLabel != null
                          ? { subsectionBookingForLabel: item.subsectionBookingForLabel }
                          : {}),
                      }).map((card) => (
                        <CheckoutItemCard
                          key={card.key}
                          card={card}
                          currency={bagCurrency}
                          formatPrice={formatPrice}
                          hideParticipantMeta
                          onRemove={onRemoveBagLine ? handleCheckoutCardRemove : undefined}
                        />
                      ))
                    )}
                  </ul>
                </section>
              ))}
            </div>

            {(() => {
              const checkoutTotal = checkoutPaymentTotal;
              const checkoutSubtotal =
                bagAggregates.lineSubtotal ?? Math.max(0, checkoutTotal - (bagAggregates.taxTotal ?? 0) + (displayDiscountTotal ?? 0));
              const checkoutDepositMin = computedDepositDollars ?? 0;
              const checkoutDepositValue = customAmountInput;
              const checkoutDepositErrorVisible = checkoutDepositValue.trim().length > 0 && !checkoutDepositValid;
              return (
                <>
                  {bagPolicyCheckout === "mixed" || bagPolicyCheckout === "all_submission" ? (
                    <div className="cb-co-totals-box cb-co-totals-box--approval mb-3">
                      <p className="cb-co-totals-box-label">{tx("cartApprovalItemsBoxLabel")}</p>
                      <div className="cb-co-totals-row cb-co-totals-row--subtotal">
                        <span>{tx("cartSubtotal")}</span>
                        <span>{formatPrice(checkoutApprovalDollars ?? checkoutSubtotal, bagCurrency)}</span>
                      </div>
                      {displayDiscountTotal != null && displayDiscountTotal > BOND_KIND_LINE_MIN ? (
                        <div className="cb-co-totals-row cb-co-totals-row--discount">
                          <span>{tx("cartDiscounts")}</span>
                          <span>−{formatPrice(displayDiscountTotal, bagCurrency)}</span>
                        </div>
                      ) : null}
                      {bagAggregates.taxTotal != null ? (
                        <div className="cb-co-totals-row cb-co-totals-row--tax">
                          <span>{tx("cartTax")}</span>
                          <span>{formatPrice(bagAggregates.taxTotal, bagCurrency)}</span>
                        </div>
                      ) : null}
                      <div className="cb-co-totals-row cb-co-totals-row--grand">
                        <span>{tx("cartTotal")}</span>
                        <strong>{formatPrice(checkoutApprovalDollars ?? 0, bagCurrency)}</strong>
                      </div>
                      <div className="cb-co-totals-box-note" role="note">
                        <TotalsBoxNoteInfoIcon />
                        <span className="cb-co-totals-box-note-text">{tx("cartApprovalItemsBoxNote")}</span>
                      </div>
                    </div>
                  ) : null}
                  {bagPolicyCheckout !== "all_submission" ? (
                    <div className="cb-co-totals-box mb-3">
                      <div className="cb-co-totals-row cb-co-totals-row--subtotal">
                        <span>{tx("cartSubtotal")}</span>
                        <span>{formatPrice(checkoutSubtotal, bagCurrency)}</span>
                      </div>
                      {displayDiscountTotal != null && displayDiscountTotal > BOND_KIND_LINE_MIN ? (
                        <div className="cb-co-totals-row cb-co-totals-row--discount">
                          <span>{tx("cartDiscounts")}</span>
                          <span>−{formatPrice(displayDiscountTotal, bagCurrency)}</span>
                        </div>
                      ) : null}
                      {bagAggregates.taxTotal != null ? (
                        <div className="cb-co-totals-row cb-co-totals-row--tax">
                          <span>{tx("cartTax")}</span>
                          <span>{formatPrice(bagAggregates.taxTotal, bagCurrency)}</span>
                        </div>
                      ) : null}
                      <div className="cb-co-totals-row cb-co-totals-row--grand">
                        <span>{tx("cartTotal")}</span>
                        <strong>{formatPrice(checkoutTotal, bagCurrency)}</strong>
                      </div>
                    </div>
                  ) : null}
                  {computedDepositDollars != null ? (
                    <div className="cb-co-custom-deposit mb-4">
                      <div className="cb-co-custom-deposit-note" role="note">
                        <TotalsBoxNoteInfoIcon />
                        <span className="cb-co-custom-deposit-note-text">{tx("cartDepositBoxNote")}</span>
                      </div>
                      <div className="cb-co-custom-deposit-field">
                        <label className="cb-co-custom-deposit-label" id="cb-checkout-custom-deposit-label" htmlFor="cb-checkout-custom-deposit-input">
                          {tx("cartCustomLabel")}
                          <span className="cb-co-custom-deposit-required" aria-hidden>
                            *
                          </span>
                        </label>
                        <span className="cb-co-custom-deposit-input-wrap">
                          <span className="cb-co-custom-deposit-prefix" aria-hidden>
                            $
                          </span>
                          <input
                            id="cb-checkout-custom-deposit-input"
                            type="number"
                            inputMode="decimal"
                            min={checkoutDepositMin}
                            max={checkoutTotal}
                            step={CURRENCY_INPUT_STEP}
                            value={checkoutDepositValue}
                            onChange={(e) => setCustomAmountInput(e.target.value)}
                            className="cb-co-custom-deposit-input"
                          />
                      <button
                        type="button"
                        className="cb-co-custom-deposit-reset"
                        aria-label="Reset custom deposit to minimum due"
                        onClick={() => setCustomAmountInput(checkoutDepositMin.toFixed(CURRENCY_INPUT_DECIMALS))}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 12a9 9 0 0 1 15.5-6.25L21 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                        </span>
                      </div>
                      {checkoutDepositErrorVisible ? (
                        <p className="cb-co-custom-deposit-error" role="alert">
                          {tx("cartCustomError", {
                            min: formatPrice(checkoutDepositMin, bagCurrency),
                            max: formatPrice(checkoutTotal, bagCurrency),
                          })}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              );
            })()}

            <h3 className="cb-checkout-section-title">{tc("paymentMethodSectionTitle")}</h3>
            <div className="cb-checkout-payment-methods mb-4">
              {paymentOptionsQuery.isPending ? (
                <p className="cb-muted text-sm">{tc("loading")}</p>
              ) : paymentOptionsQuery.isError ? (
                <p className="text-sm text-[var(--cb-error-text)]" role="alert">
                  {formatConsumerBookingErrorUnknown(paymentOptionsQuery.error, te, {
                    customerLabel: bookingForLabel,
                    orgName: orgDisplayName,
                    productName,
                  })}
                </p>
              ) : paymentChoices.length === 0 ? (
                <p className="cb-muted text-sm">{tx("addPaymentWhenAvailable")}</p>
              ) : (
                <div className="cb-checkout-payment-method-list" role="radiogroup" aria-label={tx("selectPaymentMethod")}>
                  {paymentChoices.map((pm) => {
                    const selected = selectedPaymentMethodId === pm.id;
                    const inputId = `cb-pay-${pm.id}`;
                    return (
                      <label key={pm.id} htmlFor={inputId} className="cb-checkout-payment-method-card">
                        <input
                          id={inputId}
                          type="radio"
                          name="bond-checkout-pm"
                          checked={selected}
                          onChange={() => setSelectedPaymentMethodId(pm.id)}
                        />
                        <span className="cb-checkout-payment-method-card-icon" aria-hidden>
                          {pm.methodType === "us_bank_account" ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M4 8h16v10H4V8zM2 6h20v2H2V6zm4 4h6v2H6v-2zm0 4h4v2H6v-2z"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <rect
                                x="2.5"
                                y="5"
                                width="19"
                                height="14"
                                rx="2.5"
                                stroke="currentColor"
                                strokeWidth="1.4"
                              />
                              <path d="M2.5 10h19" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                          )}
                        </span>
                        <span className="cb-checkout-payment-method-card-body">
                          <span className="cb-checkout-payment-method-card-title">{pm.displayPrimary}</span>
                          {pm.displayExpiry ? (
                            <span className="cb-checkout-payment-method-card-exp">
                              {tc("cardExpiresShort", { date: pm.displayExpiry })}
                            </span>
                          ) : null}
                        </span>
                        {pm.isDefaultPaymentMethod ? (
                          <span className="cb-checkout-payment-method-card-badge">{tc("defaultPaymentBadge")}</span>
                        ) : null}
                      </label>
                    );
                  })}
                  <div className="cb-checkout-payment-add-actions">
                    <button type="button" className="cb-checkout-payment-add-card" onClick={() => setPaymentModal("card")}>
                      {tc("addNewCard")}
                    </button>
                    <button type="button" className="cb-checkout-payment-add-card" onClick={() => setPaymentModal("bank")}>
                      {tc("addBankAccount")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {submitBookingRequestMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--cb-error-text)]" role="alert">
                {formatConsumerBookingErrorUnknown(submitBookingRequestMutation.error, te, {
                  customerLabel: bookingForLabel,
                  orgName: orgDisplayName,
                  productName,
                })}
              </p>
            ) : null}

            <div className="cb-co-actions">
              {bagPolicyCheckout === "all_submission" ? (
                <button
                  type="button"
                  className="cb-co-btn cb-co-btn--primary"
                  disabled={
                    submitBookingRequestMutation.isPending ||
                    paymentOptionsQuery.isPending ||
                    paymentLines.length === 0 ||
                    (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                    (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                  }
                  onClick={requestBookingSubmit}
                >
                  <CbBusyInline busy={submitBookingRequestMutation.isPending}>
                    {submitBookingRequestMutation.isPending ? tx("submitting") : tx("submitRequestTitle")}
                  </CbBusyInline>
                </button>
              ) : bagPolicyCheckout === "mixed" ? (
                computedDepositDollars != null ? (
                  <>
                    <button
                      type="button"
                      className="cb-co-btn cb-co-btn--outline"
                      disabled={
                        submitBookingRequestMutation.isPending ||
                        paymentOptionsQuery.isPending ||
                        paymentLines.length === 0 ||
                        (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                        (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                      }
                      onClick={requestBookingSubmit}
                    >
                      <CbBusyInline busy={submitBookingRequestMutation.isPending && submitKind === "full"}>
                        {submitBookingRequestMutation.isPending && submitKind === "full"
                          ? tx("submitting")
                          : tx("payInFullWithAmount", {
                              amount: formatPrice(presummaryPrecheckoutAmountDue ?? 0, bagCurrency),
                            })}
                      </CbBusyInline>
                    </button>
                    <button
                      type="button"
                      className="cb-co-btn cb-co-btn--primary"
                      disabled={
                        submitBookingRequestMutation.isPending ||
                        paymentOptionsQuery.isPending ||
                        paymentLines.length === 0 ||
                        (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                        (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred) ||
                        checkoutDepositAmount == null
                      }
                      onClick={() => {
                        if (checkoutDepositAmount == null) return;
                        setSubmitKind("deposit");
                        submitBookingRequestMutation.mutate(checkoutDepositAmount);
                      }}
                    >
                      <CbBusyInline busy={submitBookingRequestMutation.isPending && submitKind === "deposit"}>
                        {submitBookingRequestMutation.isPending && submitKind === "deposit"
                          ? tx("submitting")
                          : tx("payMinimumDue", { amount: formatPrice(checkoutDepositAmount ?? computedDepositDollars, bagCurrency) })}
                      </CbBusyInline>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="cb-co-btn cb-co-btn--primary"
                    disabled={
                      submitBookingRequestMutation.isPending ||
                      paymentOptionsQuery.isPending ||
                      paymentLines.length === 0 ||
                      (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                      (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                    }
                    onClick={requestBookingSubmit}
                  >
                    <CbBusyInline busy={submitBookingRequestMutation.isPending}>
                      {submitBookingRequestMutation.isPending
                        ? tx("submitting")
                        : tx("payNowWithAmount", {
                            amount: formatPrice(presummaryPrecheckoutAmountDue ?? 0, bagCurrency),
                          })}
                    </CbBusyInline>
                  </button>
                )
              ) : computedDepositDollars != null ? (
                <>
                  <button
                    type="button"
                    className="cb-co-btn cb-co-btn--outline"
                    disabled={
                      submitBookingRequestMutation.isPending ||
                      paymentOptionsQuery.isPending ||
                      paymentLines.length === 0 ||
                      (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                      (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                    }
                    onClick={requestBookingSubmit}
                  >
                    <CbBusyInline busy={submitBookingRequestMutation.isPending && submitKind === "full"}>
                      {submitBookingRequestMutation.isPending && submitKind === "full"
                        ? tx("submitting")
                        : tx("payInFullWithAmount", {
                            amount: formatPrice(presummaryPrecheckoutAmountDue ?? 0, bagCurrency),
                          })}
                    </CbBusyInline>
                  </button>
                  <button
                    type="button"
                    className="cb-co-btn cb-co-btn--primary"
                    disabled={
                      submitBookingRequestMutation.isPending ||
                      paymentOptionsQuery.isPending ||
                      paymentLines.length === 0 ||
                      (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                      (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred) ||
                      checkoutDepositAmount == null
                    }
                    onClick={() => {
                      if (checkoutDepositAmount == null) return;
                      setSubmitKind("deposit");
                      submitBookingRequestMutation.mutate(checkoutDepositAmount);
                    }}
                  >
                    <CbBusyInline busy={submitBookingRequestMutation.isPending && submitKind === "deposit"}>
                      {submitBookingRequestMutation.isPending && submitKind === "deposit"
                        ? tx("submitting")
                        : tx("payMinimumDue", { amount: formatPrice(checkoutDepositAmount ?? computedDepositDollars, bagCurrency) })}
                    </CbBusyInline>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="cb-co-btn cb-co-btn--primary"
                  disabled={
                    submitBookingRequestMutation.isPending ||
                    paymentOptionsQuery.isPending ||
                    paymentLines.length === 0 ||
                    (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                    (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                  }
                  onClick={requestBookingSubmit}
                >
                  <CbBusyInline busy={submitBookingRequestMutation.isPending}>
                    {submitBookingRequestMutation.isPending ? tx("submitting") : tx("payNow")}
                  </CbBusyInline>
                </button>
              )}
            </div>

          </div>
        ) : null}

        {step === "addons" ? (
          <div className="cb-checkout-step">
            {packageAddons.length > 0 ? (
              <div className="cb-checkout-extras-hero">
                <div className="cb-checkout-extras-hero-icon" aria-hidden>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </div>
                <p className="cb-checkout-extras-hero-title">{tx("extras")}</p>
                <p className="cb-checkout-extras-hero-sub cb-muted text-sm">{tAddons("panelHeading")}</p>
              </div>
            ) : null}
            {packageAddons.length > 0 ? (
              <p className="cb-checkout-hint">
                {selectedAddonIds.size > 0 ? tx("addonsHintWithSelection") : tx("addonsHintOptional")}
              </p>
            ) : otherRequired.length > 0 ? (
              <p className="cb-checkout-hint">{tx("requiredConfirmHint")}</p>
            ) : productCatalogPending ? (
              <p className="cb-muted text-sm">{tc("loading")}</p>
            ) : null}
            {requiredQuery.isPending ? (
              <p className="cb-muted text-sm">{tx("loadingRequiredProducts")}</p>
            ) : membershipOptionsForStep.length > 0 && !membershipSelectionResolved ? (
              <p className="cb-muted mb-3 text-sm">{tx("membershipRequiredBlurb")}</p>
            ) : null}
            {!requiredQuery.isPending && otherRequired.length > 0 ? (
              <div className="cb-checkout-required-block">
                <h3 className="cb-checkout-section-title">{tx("requiredSectionTitle")}</h3>
                <ul className="cb-checkout-list">
                  {otherRequired.map((r) => (
                    <li key={r.id}>
                      <label className="cb-checkout-check">
                        <input
                          type="checkbox"
                          checked={requiredSelected.has(r.id)}
                          onChange={(e) => {
                            setRequiredSelected((prev) => {
                              const n = new Set(prev);
                              if (e.target.checked) n.add(r.id);
                              else n.delete(r.id);
                              return n;
                            });
                          }}
                        />
                        <span>{r.name ?? `Product ${r.id}`}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {requiredQuery.isError ? (
              <p className="text-sm text-[var(--cb-error-text)]">Could not load required products.</p>
            ) : null}

            {packageAddons.length > 0 && pickedSlots.length > 0 ? (
              <div className="cb-checkout-addon-panel mt-4">
                <BookingAddonPanel
                  visibleAddons={packageAddonsVisible}
                  hasMoreAddons={packageAddons.length > ADDONS_PAGE}
                  addonsExpanded={addonsExpanded}
                  onToggleExpand={onToggleExpandAddons}
                  moreCount={packageAddons.length - ADDONS_PAGE}
                  selectedAddonIds={selectedAddonIds}
                  addonQuantities={addonQuantities}
                  addonSlotQuantities={addonSlotQuantities}
                  onSetAddonQty={onSetAddonQty}
                  onSetAddonSlotQty={onSetAddonSlotQty}
                  onToggleAddon={onToggleAddon}
                  addonSlotTargeting={addonSlotTargeting}
                  onAddonSelectAllSlots={onAddonSelectAllSlots}
                  onToggleAddonSlot={onToggleAddonSlot}
                  pickedSlots={pickedSlots}
                  formatPrice={formatPrice}
                  omitPanelHeading
                />
              </div>
            ) : packageAddons.length > 0 && pickedSlots.length === 0 ? (
              <p className="cb-muted mt-2 text-sm">Select time slots first to add per-slot extras.</p>
            ) : null}

            <div className="cb-checkout-actions cb-checkout-actions--split-equal">
              <button
                type="button"
                className="cb-btn-outline cb-checkout-back-chevron"
                onClick={() => {
                  const p = previousStepInCheckoutFlow("addons", checkoutFlowFlags);
                  if (p === "close") onClose();
                  else setStep(p);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="cb-checkout-chevron-back"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {tc("back")}
              </button>
              <button
                type="button"
                className="cb-btn-primary"
                disabled={
                  !canProceedAddons ||
                  requiredQuery.isPending ||
                  cannotMergeSessionCart ||
                  persistCartMutation.isPending ||
                  (productCatalogPending && packageAddons.length === 0 && otherRequired.length === 0)
                }
                onClick={goNextFromAddons}
              >
                {tc("continue")}
              </button>
            </div>
          </div>
        ) : null}

        {step === "membership" ? (
          <div className="cb-checkout-step">
            {requiredQuery.isPending && membershipOptionsForStep.length === 0 ? (
              <p className="cb-muted text-sm">{tx("loadingRequiredProducts")}</p>
            ) : membershipOptionsForStep.length > 0 ? (
              <MembershipRequiredPanel
                options={membershipOptionsForStep}
                selectedRootId={selectedMembershipRootId}
                onSelectRoot={setSelectedMembershipRootId}
                formatPrice={formatPrice}
                bookingForLabel={undefined}
              />
            ) : (
              <p className="cb-muted text-sm">No membership options required. Continue to proceed.</p>
            )}
            {renderPresummaryCard({
              headingId: "cb-presummary-heading-membership",
              keyPrefix: "pre-mem",
              showReviewHint: false,
              layout: "compactTotals",
            })}
            <div className="cb-checkout-actions cb-checkout-actions--split-equal">
              <button
                type="button"
                className="cb-btn-outline cb-checkout-back-chevron"
                onClick={() => {
                  const p = previousStepInCheckoutFlow("membership", checkoutFlowFlags);
                  if (p === "close") onClose();
                  else setStep(p);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="cb-checkout-chevron-back"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {tc("back")}
              </button>
              <button
                type="button"
                className="cb-btn-primary"
                disabled={
                  requiredQuery.isPending ||
                  (membershipOptionsForStep.length > 0 && selectedMembershipRootId == null) ||
                  cannotMergeSessionCart ||
                  persistCartMutation.isPending
                }
                onClick={handleMembershipConfirm}
              >
                {tc("continue")}
              </button>
            </div>
          </div>
        ) : null}

        {step === "forms" ? (
          <div className="cb-checkout-step">
            <div className="cb-checkout-forms-hero">
              <div className="cb-checkout-forms-hero-icon" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 8h8M8 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="cb-checkout-forms-hero-title">Additional Information</p>
              <p className="cb-checkout-forms-hero-sub">Open each section and answer what&apos;s required.</p>
            </div>
            <CheckoutQuestionnairePanels
              key={`${productId}-${questionnaireIds.join("|")}`}
              mergedForms={mergedForms}
              answers={answers}
              onAnswerChange={(key, v) => setAnswers((a) => ({ ...a, [key]: v }))}
              loading={
                publicQuestionnaireQueries.some((q) => q.isPending) || checkoutQuestionnairesQuery.isPending
              }
              showPrefillHint={showPrefillHint}
              profileWaiverDisplay={
                contactSnap.waiverSignedDate ? formatProfileDateYmd(contactSnap.waiverSignedDate) : undefined
              }
            />
            <div className="cb-checkout-actions cb-checkout-actions--split-equal">
              <button
                type="button"
                className="cb-btn-outline cb-checkout-back-chevron"
                onClick={() => {
                  const p = previousStepInCheckoutFlow("forms", checkoutFlowFlags);
                  if (p === "close") onClose();
                  else setStep(p);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="cb-checkout-chevron-back"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {tc("back")}
              </button>
              <button
                type="button"
                className="cb-btn-primary"
                disabled={!formsValid || !canBondPersistCart || cannotMergeSessionCart}
                onClick={goNextFromForms}
              >
                {tc("continue")}
              </button>
            </div>
          </div>
        ) : null}

        {step === "syncCart" ? (
          <div className="cb-checkout-step">
            {cannotMergeSessionCart ? (
              <p className="mb-3 text-sm text-[var(--cb-error-text)]" role="alert">
                {tx("mergeBlocked")}
              </p>
            ) : null}
            {!cannotMergeSessionCart
              ? renderPresummaryCard({
                  headingId: "cb-presummary-heading-sync",
                  keyPrefix: "pre-sync",
                  layout: "bookingReview",
                  onEditAddons: () => setStep("addons"),
                  ...(onRemoveSlot ? { onRemoveSlot } : {}),
                  ...(onRemoveReservationAddon ? { onRemoveAddon: onRemoveReservationAddon } : {}),
                })
              : null}
            {persistCartMutation.isPending ? (
              <div className="cb-checkout-bond-receipt mb-4" aria-busy="true" aria-live="polite">
                <p className="cb-muted text-sm">{tx("loadingPricing")}</p>
              </div>
            ) : persistCartMutation.isError ? (
              <div className="cb-checkout-bond-receipt cb-checkout-bond-receipt--empty mb-4" role="alert">
                <p className="text-sm text-[var(--cb-error-text)] mb-2">
                  {persistBondCartErrorText ?? tx("couldntLoadPricing")}
                </p>
                <button
                  type="button"
                  className="cb-btn-outline text-sm"
                  disabled={persistCartMutation.isPending}
                  aria-busy={persistCartMutation.isPending ? true : undefined}
                  onClick={() => {
                    if (persistCartMutation.isPending) return;
                    persistCartMutation.reset();
                    persistBondCart();
                  }}
                >
                  <CbBusyInline busy={persistCartMutation.isPending}>{tc("retry")}</CbBusyInline>
                </button>
              </div>
            ) : !cannotMergeSessionCart ? (
              <>
                <div className="cb-checkout-actions cb-checkout-actions--split-equal">
                  <button
                    type="button"
                    className="cb-btn-outline cb-checkout-back-chevron"
                    onClick={() => {
                      const prev = previousStepInCheckoutFlow("syncCart", checkoutFlowFlags);
                      if (prev === "close") onClose();
                      else setStep(prev);
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className="cb-checkout-chevron-back"
                    >
                      <path
                        d="M15 6l-6 6 6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {tc("back")}
                  </button>
                  <button
                    type="button"
                    className="cb-btn-add-to-cart"
                    disabled={
                      !canBondPersistCart || pickedSlots.length === 0 || persistCartMutation.isPending
                    }
                    aria-busy={persistCartMutation.isPending ? true : undefined}
                    onClick={() => persistBondCart()}
                  >
                    <CbBusyInline busy={persistCartMutation.isPending}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                        className="cb-btn-add-to-cart-icon"
                      >
                        <path
                          d="M6 6h15l-1.5 9h-12L6 6zM4 6h2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {tx("addToCart")}
                    </CbBusyInline>
                  </button>
                </div>
                {showGoToCartOnSyncStep && bagSnapshots.length > 0 && onGoToCart ? (
                  <div className="mt-3 text-center">
                    <button type="button" className="cb-checkout-textlink text-sm" onClick={() => onGoToCart()}>
                      {tc("goToCart")}
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}

      </div>

          </>
          {paymentMethodModal}
      </Fragment>
    </RightDrawer>
  );
}
