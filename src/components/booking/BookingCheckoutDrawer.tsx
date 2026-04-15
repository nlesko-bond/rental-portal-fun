"use client";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ModalShell } from "@/components/booking/ModalShell";
import { RightDrawer } from "@/components/ui/RightDrawer";
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
  formatConsumerPaymentFeeRuleSummary,
} from "@/lib/bond-payment-api";
import {
  fetchCheckoutQuestionnaires,
  fetchPublicQuestionnaireById,
  fetchUserRequiredProducts,
  postOnlineBookingCreate,
} from "@/lib/online-booking-user-api";
import { buildOnlineBookingCreateBody, splitAddonPayloadForCreate } from "@/lib/online-booking-create-body";
import { productMembershipGated } from "@/lib/booking-pricing";
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
import { formatPickedSlotTimeRange, formatSlotControlKeyLabel } from "@/components/booking/booking-slot-labels";
import { CbInfoHint } from "@/components/booking/primitives/CbInfoHint";
import { CbButton } from "@/components/booking/primitives/CbButton";
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
  estimateAmountDue,
} from "@/lib/checkout-bag-totals";
import { reverseEntitlementDiscountsToUnitPrice } from "@/lib/entitlement-discount";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import { positiveBondCartId } from "@/lib/session-cart-snapshot";
import {
  bagApprovalPolicy,
  countSessionCartLineItems,
  expandSnapshotForPurchaseList,
  type BagApprovalPolicy,
} from "@/lib/cart-purchase-lines";
import type { BagRemovePolicy } from "@/lib/bond-cart-removal";

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

export type CheckoutStep = "addons" | "membership" | "forms" | "syncCart" | "payment";

type FlowFlags = { hasAddonsStep: boolean; hasMembershipStep: boolean; hasFormsStep: boolean };

function lastInteractiveCheckoutStep(flow: FlowFlags): CheckoutStep | "close" {
  if (flow.hasFormsStep) return "forms";
  if (flow.hasMembershipStep) return "membership";
  if (flow.hasAddonsStep) return "addons";
  return "close";
}

function previousStepInCheckoutFlow(step: CheckoutStep, flow: FlowFlags): CheckoutStep | "close" {
  if (step === "payment") return lastInteractiveCheckoutStep(flow);
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
};

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
}: Props) {
  const tx = useTranslations("checkout");
  const te = useTranslations("errors");
  const tc = useTranslations("common");
  const [step, setStep] = useState<CheckoutStep>(() =>
    packageAddons.length > 0 ? "addons" : "membership"
  );
  const [requiredSelected, setRequiredSelected] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [extrasCollapsed, setExtrasCollapsed] = useState(false);
  const [lastCart, setLastCart] = useState<OrganizationCartDto | null>(null);
  /** When category requires approval: user skipped API on "Add to cart"; create runs on payment "Submit request". */
  const [approvalDeferred, setApprovalDeferred] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  /** After `POST …/create` succeeds, show confirmation + summary before jumping to payment (Figma-style handoff). */
  /** After `finalizeCart` succeeds — show confirmation (invoice / reservation) before parent clears session. */
  const [finalizeSuccess, setFinalizeSuccess] = useState<FinalizeSuccessDisplay | null>(null);
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
  const selectedPaymentMethodIdRef = useRef<string | null>(null);
  selectedPaymentMethodIdRef.current = selectedPaymentMethodId;
  /** Latest cart total for `POST …/finalize` (`amountToPay`) — mutation runs before later hooks otherwise. */
  const estimatedAmountDueRef = useRef<number | null>(null);
  const drawerWasOpen = useRef(false);
  /** After `navigateToCheckoutStep` applies, skip the next full checkout reset (parent clears navigate in the same tick). */
  const skipNextCheckoutResetRef = useRef(false);
  /** Synced after `firstCheckoutStep` is computed — open-reset effect reads this so step matches forms/syncCart when needed. */
  const firstCheckoutStepRef = useRef<CheckoutStep>("addons");
  /** Must not be a hook dependency — unstable parent lambdas retriggered the effect every render and reset step to addons. */
  const onClearNavigateRef = useRef(onClearNavigateToCheckoutStep);

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
    setAnswers({});
    setRequiredSelected(new Set());
    setLastCart(null);
    setApprovalDeferred(false);
    setDepositModalOpen(false);
    setSelectedMembershipRootId(null);
    setMembershipSelectionResolved(false);
    setSelectedPaymentMethodId(null);
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
    if (step !== "payment") setDepositModalOpen(false);
  }, [step]);

  useEffect(() => {
    if (open && !drawerWasOpen.current) {
      setExtrasCollapsed(selectedAddonIds.size > 0 && packageAddons.length > 0);
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

  /** Last step before sync (Figma “booking summary” before add to cart). */
  const isLastStepBeforeSync = useMemo(() => {
    if (preCheckoutSteps.length === 0) return false;
    return step === preCheckoutSteps[preCheckoutSteps.length - 1];
  }, [step, preCheckoutSteps]);

  const totalPreSteps = preCheckoutSteps.length;

  const currentPreStepNumber = useMemo(() => {
    if (step === "payment") return 0;
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
    if (step === "payment") return "";
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

    const { topLevel, perSegment } = splitAddonPayloadForCreate({
      pickedSlots,
      selectedAddonIds: [...selectedAddonIds],
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
      if (approvalRequired) setApprovalDeferred(true);
      if (cart != null) onSuccess(cart);
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
    if (cannotMergeSessionCart) return;
    if (!canBondPersistCart || pickedSlots.length === 0) return;
    persistCartMutation.mutate();
  }, [cannotMergeSessionCart, canBondPersistCart, pickedSlots.length, persistCartMutation]);

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
    mutationFn: async () => {
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
      const freshCart = await getOrganizationCart(orgId, cartId);
      let amount = bondCartPayableTotalForFinalize(freshCart);
      if (amount == null || amount <= 0) {
        const ui = estimatedAmountDueRef.current;
        if (ui != null && Number.isFinite(ui) && ui > 0) {
          amount = Math.round(ui * 100) / 100;
        }
      }
      if (amount != null && amount > 0) {
        body.amountToPay = amount;
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
    },
  });

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
    if (mode === "bag") {
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
  }, [mode, onClose, onBackFromPayment, step, checkoutFlowFlags]);

  const showDrawerBack =
    mode === "bag" ||
    step === "addons" ||
    step === "membership" ||
    step === "forms" ||
    step === "syncCart" ||
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

  const depositAmount = useMemo(() => {
    const dp = product?.downPayment ?? product?.downpayment;
    if (typeof dp === "number" && Number.isFinite(dp) && dp > 0) return dp;
    return null;
  }, [product]);

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
      }
    ) => {
      const lk = opts?.lineKind ?? "booking";
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
        displayLines: [
          {
            title: lineName,
            amount,
            lineKind: lk,
            ...(opts?.scheduleSummary ? { meta: opts.scheduleSummary } : {}),
          },
        ],
        ...(opts?.scheduleSummary ? { scheduleSummary: opts.scheduleSummary } : {}),
        ...(opts?.approvalRequired === true ? { approvalRequired: true as const } : {}),
        ...(opts?.approvalRequired === false ? { approvalRequired: false as const } : {}),
      });
    };

    /** In-progress booking before POST create (the old branch required approvalDeferred, which is only set after create — so the summary was empty). */
    if (pickedSlots.length > 0 && !lastCart) {
      const scheduleSummary = formatScheduleSummaryForBooking(pickedSlots, bookingForLabel);
      pushSynthetic(productName, subtotal, currency, {
        approvalRequired: approvalRequired === true,
        scheduleSummary,
      });
      for (const r of allRequiredFlat) {
        if (!requiredSelected.has(r.id) || !r.displayPrice) continue;
        if (r.displayPrice.currency !== currency) continue;
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
          amt = p.price;
        } else {
          const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
          const slotCount = eff.size > 0 ? eff.size : slotKeySet.size;
          if (slotCount === 0) continue;
          if (a.level === "slot") {
            amt = p.price * slotCount;
          } else {
            for (const s of pickedSlots) {
              if (eff.size > 0 && !eff.has(s.key)) continue;
              amt += p.price * (slotDurationMinutes(s) / 60);
            }
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
    packageAddons,
    selectedAddonIds,
    addonSlotTargeting,
    slotKeySet,
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
        return persistCartMutation.isPending ? tx("preparingPricing") : tx("addToCart");
      case "payment":
        return tx("cartDrawerTitle");
    }
  }, [mode, step, packageAddons.length, tx, persistCartMutation.isPending]);

  const bagDrawerLineCount = useMemo(() => countSessionCartLineItems(bagSnapshots), [bagSnapshots]);

  /** Bond cart fields only (no client-side line math). */
  const bagSessionAggregates = useMemo(() => aggregateBagSnapshots(bagSnapshots), [bagSnapshots]);

  const bagLineBuckets = useMemo(() => aggregateBagCartLineBuckets(bagSnapshots), [bagSnapshots]);

  const paymentLineBuckets = useMemo(() => aggregateBagCartLineBuckets(paymentLines), [paymentLines]);

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

  const bagFeeRowAmount = useMemo(() => {
    if (bagSessionAggregates.feeTotal != null && bagSessionAggregates.feeTotal > BOND_KIND_LINE_MIN) {
      return bagSessionAggregates.feeTotal;
    }
    if (bagProcessingFeeFromOptions != null) return bagProcessingFeeFromOptions;
    return null;
  }, [bagSessionAggregates.feeTotal, bagProcessingFeeFromOptions]);

  const paymentFeeRowAmount = useMemo(() => {
    if (bagAggregates.feeTotal != null && bagAggregates.feeTotal > BOND_KIND_LINE_MIN) {
      return bagAggregates.feeTotal;
    }
    if (paymentProcessingFeeEstimate != null && paymentProcessingFeeEstimate > 0) {
      return paymentProcessingFeeEstimate;
    }
    return null;
  }, [bagAggregates.feeTotal, paymentProcessingFeeEstimate]);

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

  const showBagApprovalFootnote = useMemo(
    () =>
      approvalRequired === true &&
      (bagPolicyBag === "all_submission" || bagPolicyBag === "mixed"),
    [approvalRequired, bagPolicyBag]
  );

  const showPaymentApprovalFootnote = useMemo(
    () =>
      approvalRequired === true &&
      (bagPolicyCheckout === "all_submission" || bagPolicyCheckout === "mixed"),
    [approvalRequired, bagPolicyCheckout]
  );

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

  const renderPresummaryCard = (opts: {
    headingId: string;
    keyPrefix: string;
    showFootnote: boolean;
    showReviewHint?: boolean;
  }) =>
    paymentLines.length > 0 ? (
      <div className="cb-checkout-presummary" aria-labelledby={opts.headingId}>
        <h3 id={opts.headingId} className="cb-checkout-presummary-title">
          {tx("bookingSummary")}
        </h3>
        {opts.showReviewHint ? (
          <p className="cb-checkout-presummary-review-hint cb-muted text-sm leading-snug mb-3">
            {tx("bookingSummaryReviewHint")}
          </p>
        ) : null}
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
        {groupedPresummaryLineSections.length > 1 ? (
          <p className="cb-muted mb-2 text-xs leading-relaxed">{tx("purchasesGroupedByMember")}</p>
        ) : null}
        <div className="cb-checkout-presummary-groups">
          {groupedPresummaryLineSections.map((section, si) => (
            <section key={`${opts.keyPrefix}-${section.label}-${si}`} className="cb-checkout-payment-group">
              <h4 className="cb-checkout-payment-group-title">
                {groupHeadingForBooking(
                  section.label,
                  si,
                  Math.max(1, groupedPresummaryLineSections.length),
                  tx
                )}
              </h4>
              <ul className="cb-checkout-payment-lines cb-checkout-payment-lines--ds-cards">
                {section.items.flatMap(
                  ({ index, row, cartFlatLineIndices, subsectionBookingForLabel }) =>
                    expandSnapshotForPurchaseList(row, index, {
                      bagPolicy: bagPolicyCheckout,
                      omitBookingLabelInMeta: true,
                      hideVenueApprovalLineNotes: approvalRequired,
                      ...(cartFlatLineIndices != null
                        ? { cartFlatLineIndexFilter: new Set(cartFlatLineIndices) }
                        : {}),
                      ...(subsectionBookingForLabel != null ? { subsectionBookingForLabel } : {}),
                    }).map((line) => (
                      <li key={`${opts.keyPrefix}-${line.key}`} className="cb-checkout-payment-line">
                        <div>
                          <span className="cb-checkout-payment-line-title">{line.title}</span>
                          {line.badge ? (
                            <span className="cb-checkout-receipt-box-badge mt-0.5 inline-block text-[0.65rem]">
                              {line.badge}
                            </span>
                          ) : null}
                          <span className="cb-muted block text-[0.7rem] leading-snug">{line.meta}</span>
                        </div>
                        <span className="cb-checkout-payment-line-price text-[0.8rem]">
                          {line.amount != null ? (
                            line.strikeAmount != null && line.strikeAmount > line.amount + 0.005 ? (
                              <>
                                <span className="cb-checkout-price-strike">
                                  {formatPrice(line.strikeAmount, bagCurrency)}
                                </span>{" "}
                                <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                              </>
                            ) : (
                              <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                            )
                          ) : (
                            "—"
                          )}
                        </span>
                      </li>
                    ))
                )}
              </ul>
            </section>
          ))}
        </div>
        <div className="cb-checkout-presummary-totals">
          <div className="cb-checkout-total-row cb-checkout-total-row--muted">
            <span>{tx("subtotal")}</span>
            <span>
              {presummaryAggregates.lineSubtotal != null
                ? formatPrice(presummaryAggregates.lineSubtotal, bagCurrency)
                : presummaryAggregates.cartGrandTotal != null
                  ? formatPrice(presummaryAggregates.cartGrandTotal, bagCurrency)
                  : "—"}
            </span>
          </div>
          {presummaryDisplayDiscount != null && presummaryDisplayDiscount > 0.005 ? (
            <div className="cb-checkout-total-row cb-checkout-total-row--discount">
              <span>{tc("discountsAndSavings")}</span>
              <span>−{formatPrice(presummaryDisplayDiscount, bagCurrency)}</span>
            </div>
          ) : null}
          <div className="cb-checkout-total-row cb-checkout-total-row--muted">
            <span>{tx("tax")}</span>
            <span>
              {presummaryAggregates.taxTotal != null
                ? formatPrice(presummaryAggregates.taxTotal, bagCurrency)
                : "—"}
            </span>
          </div>
          <div className="cb-checkout-total-row cb-checkout-total-row--grand">
            <span>{tx("estimatedTotal")}</span>
            <strong>
              {presummaryPrecheckoutAmountDue != null
                ? formatPrice(presummaryPrecheckoutAmountDue, bagCurrency)
                : presummaryAggregates.cartGrandTotal != null
                  ? formatPrice(presummaryAggregates.cartGrandTotal, bagCurrency)
                  : "—"}
            </strong>
          </div>
        </div>
        {opts.showFootnote ? (
          <p className="cb-checkout-presummary-note cb-muted">{tc("precheckoutSummaryFootnote")}</p>
        ) : null}
      </div>
    ) : null;

  if (mode === "bag") {
    const nBookings = bagSnapshots.length;
    return (
      <RightDrawer
        open={open}
        onClose={onClose}
        onBack={showDrawerBack ? handleToolbarBack : undefined}
        ariaLabel={tx("bagTitle")}
        title={title}
        panelClassName={panelCls}
      >
          <div className="cb-checkout-inner cb-checkout-inner--bag">
          <div className="cb-checkout-payment-hero cb-cart-bag-hero">
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
            <p className="cb-checkout-payment-hero-sub cb-muted text-sm">{tx("cartHeroSubtitle")}</p>
          </div>
          <div className="cb-cart-bag-heading">
            <p className="cb-cart-bag-subtitle">{tx("orderSummary")}</p>
            {nBookings > 0 ? (
              <span className="cb-cart-bag-count-pill">
                {bagDrawerLineCount} {bagDrawerLineCount === 1 ? tx("lineSingular") : tx("linePlural")} · {nBookings}{" "}
                {nBookings === 1 ? tx("bookingSingular") : tx("bookingPlural")}
              </span>
            ) : null}
          </div>
          {groupedBagWithTotals.length > 1 ? (
            <p className="cb-muted mb-3 text-sm leading-relaxed">{tx("cartGroupedShort")}</p>
          ) : null}
          {bagSnapshots.length > 0 && approvalRequired ? (
            <div
              className="cb-checkout-category-approval-notice mb-3 rounded-md border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-2.5 text-sm leading-snug text-[var(--cb-text)]"
              role="note"
            >
              {tx("approvalNoticeBag")}
            </div>
          ) : null}
          {bagSnapshots.length > 0 && bagPolicyBag === "mixed" ? (
            <div className="cb-checkout-mixed-cart-banner mb-3" role="note">
              <span className="cb-checkout-mixed-cart-banner-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 10v5M12 7v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <p className="cb-checkout-mixed-cart-banner-text">{tx("mixedCartPolicyBanner")}</p>
            </div>
          ) : null}

          {bagSnapshots.length === 0 ? (
            <p className="cb-muted text-sm">{tx("cartEmpty")}</p>
          ) : (
            <>
              <div className="cb-cart-bag-groups">
                {groupedBagWithTotals.map((section, si) => (
                  <section key={`${section.label}-${si}`} className="cb-cart-bag-group">
                    <h4 className="cb-cart-bag-group-title">
                      {groupHeadingForBooking(section.label, si, groupedBagWithTotals.length, tx)}
                    </h4>
                    <ul className="cb-cart-bag-list">
                      {section.items.map(
                        ({ index, row, cartFlatLineIndices, subsectionBookingForLabel }) => {
                        const lines = expandSnapshotForPurchaseList(row, index, {
                          bagPolicy: bagPolicyBag,
                          omitBookingLabelInMeta: true,
                          structuredBagMeta: true,
                          hideVenueApprovalLineNotes: approvalRequired,
                          ...(cartFlatLineIndices != null
                            ? { cartFlatLineIndexFilter: new Set(cartFlatLineIndices) }
                            : {}),
                          ...(subsectionBookingForLabel != null
                            ? { subsectionBookingForLabel }
                            : {}),
                        });
                        return (
                          <li
                            key={`${row.cart.id}-${index}-${subsectionBookingForLabel ?? "all"}`}
                            className="cb-cart-bag-line"
                          >
                                                        {lines.map((line, lineIdx) => (
                              <div
                                key={line.key}
                                className={`cb-cart-bag-line-main${
                                  line.lineKind === "addon" ? " cb-cart-bag-line-main--addon" : ""
                                }${lineIdx > 0 ? " mt-3 border-t border-[var(--cb-border)] pt-3" : ""}`}
                              >
                                <div className="cb-cart-bag-line-top">
                                  <div className="cb-cart-bag-line-primary">
                                    {line.lineKind === "addon" ? (
                                      <p className="cb-cart-bag-addon-pill">
                                        <span aria-hidden className="cb-cart-bag-addon-plus">
                                          +
                                        </span>
                                        <span className="min-w-0 truncate">{line.title}</span>
                                      </p>
                                    ) : (
                                      <div className="cb-cart-bag-line-title-wrap">
                                        <p className="cb-cart-bag-line-title">{line.title}</p>
                                        {line.approvalPending ? (
                                          <span className="cb-cart-bag-approval-pill">
                                            <span className="cb-cart-bag-approval-pill-icon" aria-hidden>
                                              !
                                            </span>
                                            {tx("approvalRequiredPill")}
                                          </span>
                                        ) : null}
                                      </div>
                                    )}
                                    {line.bagMetaRows ? (
                                      <ul className="cb-cart-bag-meta-rows">
                                        {line.bagMetaRows.participant ? (
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
                                            <span className="cb-cart-bag-meta-text">
                                              {line.bagMetaRows.participant}{" "}
                                              <span className="cb-cart-bag-meta-muted">
                                                {tx("participantAttachedCustomer")}
                                              </span>
                                            </span>
                                          </li>
                                        ) : null}
                                        {line.bagMetaRows.resource ? (
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
                                            <span className="cb-cart-bag-meta-text">{line.bagMetaRows.resource}</span>
                                          </li>
                                        ) : null}
                                        {line.bagMetaRows.dateLine ? (
                                          <li className="cb-cart-bag-meta-row">
                                            <span className="cb-cart-bag-meta-icon" aria-hidden>
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <rect
                                                  x="4"
                                                  y="5"
                                                  width="16"
                                                  height="14"
                                                  rx="2"
                                                  stroke="currentColor"
                                                  strokeWidth="1.5"
                                                />
                                                <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="1.5" />
                                              </svg>
                                            </span>
                                            <span className="cb-cart-bag-meta-text">
                                              {line.bagMetaRows.dateLine}
                                              {line.bagMetaRows.timeLine
                                                ? ` · ${line.bagMetaRows.timeLine}`
                                                : ""}
                                            </span>
                                          </li>
                                        ) : line.bagMetaRows.timeLine ? (
                                          <li className="cb-cart-bag-meta-row">
                                            <span className="cb-cart-bag-meta-icon" aria-hidden>
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
                                                <path
                                                  d="M12 8v5l3 2"
                                                  stroke="currentColor"
                                                  strokeWidth="1.5"
                                                  strokeLinecap="round"
                                                />
                                              </svg>
                                            </span>
                                            <span className="cb-cart-bag-meta-text">{line.bagMetaRows.timeLine}</span>
                                          </li>
                                        ) : null}
                                      </ul>
                                    ) : line.meta ? (
                                      <p className="cb-cart-bag-line-meta">{line.meta}</p>
                                    ) : null}
                                    {line.discountNote ? (
                                      <span className="cb-checkout-discount-tag">{line.discountNote}</span>
                                    ) : null}
                                    {line.memberAccessNote ? (
                                      <p className="mt-1.5">
                                        <span className="cb-cart-line-member-badge">{line.memberAccessNote}</span>
                                      </p>
                                    ) : null}
                                    {line.checkoutNote ? (
                                      <p className="cb-muted mt-0.5 text-[0.7rem] leading-snug">{line.checkoutNote}</p>
                                    ) : null}
                                  </div>
                                  <div className="cb-cart-bag-line-actions">
                                    {line.amount != null ? (
                                      <span className="cb-cart-bag-line-price">
                                        {line.strikeAmount != null &&
                                        line.strikeAmount > line.amount + 0.005 ? (
                                          <>
                                            <span className="cb-checkout-price-strike">
                                              {formatPrice(line.strikeAmount, bagCurrency)}
                                            </span>{" "}
                                            <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                                          </>
                                        ) : (
                                          <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                                        )}
                                      </span>
                                    ) : (
                                      <span className="cb-muted text-sm">—</span>
                                    )}
                                    {line.bagRemove && onRemoveBagLine ? (
                                      <button
                                        type="button"
                                        className="cb-cart-bag-remove"
                                        aria-label={
                                          line.bagRemove.kind === "subsection"
                                            ? `Remove reservation and add-ons: ${row.productName}`
                                            : `Remove ${line.title}`
                                        }
                                        onClick={() =>
                                          onRemoveBagLine({
                                            index,
                                            cartFlatLineIndices,
                                            remove: line.bagRemove!,
                                          })
                                        }
                                      >
                                        <span aria-hidden>🗑</span>
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </li>
                        );
                      }
                      )}
                    </ul>
                  </section>
                ))}
              </div>
              <div className="cb-cart-bag-totals">
                <h3 className="cb-checkout-section-title">{tx("orderSummary")}</h3>
                <CbCheckoutTotalRow
                  label={tx("bagBookings")}
                  value={formatPrice(bagLineBuckets.bookings, bagCurrency)}
                />
                {Math.abs(bagLineBuckets.addons) > BOND_KIND_LINE_MIN ? (
                  <CbCheckoutTotalRow
                    label={tx("extras")}
                    value={formatPrice(bagLineBuckets.addons, bagCurrency)}
                  />
                ) : null}
                {Math.abs(bagLineBuckets.memberships) > BOND_KIND_LINE_MIN ? (
                  <CbCheckoutTotalRow
                    label={tx("memberships")}
                    value={formatPrice(bagLineBuckets.memberships, bagCurrency)}
                  />
                ) : null}
                <CbCheckoutTotalRow
                  variant="discount"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.82 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" />
                    </svg>
                  }
                  label={tx("discountAndSavings")}
                  value={
                    bagSessionAggregates.discountTotal != null &&
                    bagSessionAggregates.discountTotal > 0.0001
                      ? `−${formatPrice(bagSessionAggregates.discountTotal, bagCurrency)}`
                      : "—"
                  }
                />
                <CbCheckoutTotalRow
                  variant="muted"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="15.5" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M16 8L8 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  }
                  label={tx("tax")}
                  value={
                    bagSessionAggregates.taxTotal != null
                      ? formatPrice(bagSessionAggregates.taxTotal, bagCurrency)
                      : tx("feePending")
                  }
                />
                <CbCheckoutTotalRow
                  variant="muted"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 7v6l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                  label={tx("fees")}
                  value={
                    bagFeeRowAmount != null
                      ? formatPrice(bagFeeRowAmount, bagCurrency)
                      : paymentOptionsQuery.isPending
                        ? tc("loading")
                        : "—"
                  }
                  title={
                    bagFeeRowAmount != null
                      ? formatConsumerPaymentFeeRuleSummary(selectedPaymentChoice?.fee ?? null) ??
                        undefined
                      : tx("feesMayApplyTooltip")
                  }
                />
                <CbCheckoutTotalRow
                  variant="muted"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  }
                  label={tx("paymentMethodRowLabel")}
                  value={
                    selectedPaymentChoice != null
                      ? selectedPaymentChoice.displayPrimary
                      : tx("paymentMethodRowValue")
                  }
                />
                <CbCheckoutTotalRow
                  variant="grand"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 14l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                  label={tx("total")}
                  value={
                    bagEstimatedTotal != null ? (
                      <strong>{formatPrice(bagEstimatedTotal, bagCurrency)}</strong>
                    ) : bagSessionAggregates.cartGrandTotal != null ? (
                      <strong>{formatPrice(bagSessionAggregates.cartGrandTotal, bagCurrency)}</strong>
                    ) : (
                      tx("feePending")
                    )
                  }
                />
              </div>
            </>
          )}

          <div className="cb-cart-bag-footer-actions">
            <CbButton variant="ghost" className="cb-cart-bag-keep" onClick={onClose}>
              {tx("keepShopping")}
            </CbButton>
            <CbButton
              variant="primary"
              disabled={bagSnapshots.length === 0}
              onClick={() => onRequestBagCheckout?.()}
            >
              {bagPolicyBag === "all_pay" ? tx("payArrow") : tx("checkoutArrow")}
            </CbButton>
          </div>
        </div>
      </RightDrawer>
    );
  }

  const checkoutDrawerTitle = finalizeSuccess != null ? tx("bookingConfirmedTitle") : title;
  const checkoutDrawerBack =
    finalizeSuccess != null ? undefined : showDrawerBack ? handleToolbarBack : undefined;

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      onBack={checkoutDrawerBack}
      ariaLabel={checkoutDrawerTitle}
      title={finalizeSuccess != null ? undefined : title}
      hideTitle={finalizeSuccess != null}
      panelClassName={panelCls}
    >
      <Fragment>
        {finalizeSuccess != null ? (
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
        ) : (
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

            {step === "addons" ? (
              <p className="cb-checkout-product">
                <span className="cb-checkout-product-label">{tx("serviceShort")}</span>
                <span className="cb-checkout-product-name">{productName}</span>
              </p>
            ) : null}

            {step === "addons" ? (
              pickedSlots.length > 0 ? (
                <div
                  className="cb-checkout-selected-slots cb-checkout-presummary"
                  aria-labelledby="cb-selected-slots-heading"
                >
                  <h3 id="cb-selected-slots-heading" className="cb-checkout-presummary-title">
                    {tc("selectedTimesTitle")}
                  </h3>
                  <ul className="cb-checkout-selected-slots-list">
                    {pickedSlots.map((s) => (
                      <li
                        key={s.key}
                        className="cb-checkout-selected-slot-row flex flex-wrap items-start justify-between gap-2 border-b border-[var(--cb-border)] py-2.5 text-sm last:border-0"
                      >
                        <span className="min-w-0">
                          <span className="font-medium text-[var(--cb-text)]">
                            {formatSlotControlKeyLabel(s.key) ??
                              formatPickedSlotTimeRange({
                                startTime: s.startTime,
                                endTime: s.endTime,
                              })}
                          </span>
                          <span className="cb-muted block text-xs leading-snug">{s.resourceName}</span>
                        </span>
                        <span className="shrink-0 font-medium">{formatPrice(s.price, currency)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            ) : null}
          </>
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
                  <ul className="cb-checkout-payment-lines cb-checkout-payment-lines--ds-cards">
                    {section.items.flatMap(
                      ({ index, row, cartFlatLineIndices, subsectionBookingForLabel }) =>
                        expandSnapshotForPurchaseList(row, index, {
                          bagPolicy: bagPolicyCheckout,
                          omitBookingLabelInMeta: true,
                          hideVenueApprovalLineNotes: approvalRequired,
                          ...(cartFlatLineIndices != null
                            ? { cartFlatLineIndexFilter: new Set(cartFlatLineIndices) }
                            : {}),
                          ...(subsectionBookingForLabel != null
                            ? { subsectionBookingForLabel }
                            : {}),
                        }).map((line) => (
                          <li key={line.key} className="cb-checkout-payment-line">
                            <div>
                              <span className="cb-checkout-payment-line-title">{line.title}</span>
                              {line.badge ? (
                                <span className="cb-checkout-receipt-box-badge mt-1 inline-block">{line.badge}</span>
                              ) : null}
                              <span className="cb-muted block text-xs">{line.meta}</span>
                              {line.discountNote ? (
                                <span className="cb-checkout-discount-tag">{line.discountNote}</span>
                              ) : null}
                              {line.memberAccessNote ? (
                                <span className="cb-cart-line-member-badge mt-1 inline-block">
                                  {line.memberAccessNote}
                                </span>
                              ) : null}
                              {line.checkoutNote ? (
                                <span className="cb-muted block text-[0.7rem] leading-snug">{line.checkoutNote}</span>
                              ) : null}
                            </div>
                            <span className="cb-checkout-payment-line-price">
                              {line.amount != null ? (
                                line.strikeAmount != null && line.strikeAmount > line.amount + 0.005 ? (
                                  <>
                                    <span className="cb-checkout-price-strike">
                                      {formatPrice(line.strikeAmount, bagCurrency)}
                                    </span>{" "}
                                    <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                                  </>
                                ) : (
                                  <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                                )
                              ) : (
                                "—"
                              )}
                            </span>
                          </li>
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
                  <ul className="cb-checkout-payment-lines cb-checkout-payment-lines--ds-cards">
                    {section.items.flatMap(
                      ({ index, row, cartFlatLineIndices, subsectionBookingForLabel }) =>
                        expandSnapshotForPurchaseList(row, index, {
                          bagPolicy: bagPolicyCheckout,
                          omitBookingLabelInMeta: true,
                          hideVenueApprovalLineNotes: approvalRequired,
                          ...(cartFlatLineIndices != null
                            ? { cartFlatLineIndexFilter: new Set(cartFlatLineIndices) }
                            : {}),
                          ...(subsectionBookingForLabel != null
                            ? { subsectionBookingForLabel }
                            : {}),
                        }).map((line) => (
                          <li key={line.key} className="cb-checkout-payment-line">
                            <div>
                              <span className="cb-checkout-payment-line-title">{line.title}</span>
                              {line.badge ? (
                                <span className="cb-checkout-receipt-box-badge mt-1 inline-block">{line.badge}</span>
                              ) : null}
                              <span className="cb-muted block text-xs">{line.meta}</span>
                              {line.discountNote ? (
                                <span className="cb-checkout-discount-tag">{line.discountNote}</span>
                              ) : null}
                              {line.memberAccessNote ? (
                                <span className="cb-cart-line-member-badge mt-1 inline-block">
                                  {line.memberAccessNote}
                                </span>
                              ) : null}
                              {line.checkoutNote ? (
                                <span className="cb-muted block text-[0.7rem] leading-snug">{line.checkoutNote}</span>
                              ) : null}
                            </div>
                            <span className="cb-checkout-payment-line-price">
                            {line.amount != null ? (
                              line.strikeAmount != null && line.strikeAmount > line.amount + 0.005 ? (
                                <>
                                  <span className="cb-checkout-price-strike">
                                    {formatPrice(line.strikeAmount, bagCurrency)}
                                  </span>{" "}
                                  <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                                </>
                              ) : (
                                <strong>{formatPrice(line.amount, bagCurrency)}</strong>
                              )
                            ) : (
                              "—"
                            )}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              ))}
            </div>

            <h3 className="cb-checkout-section-title">{tx("orderSummary")}</h3>
            <div className="cb-checkout-totals cb-checkout-totals--ds mb-6">
              <CbCheckoutTotalRow
                label={tx("bagBookings")}
                value={formatPrice(paymentLineBuckets.bookings, bagCurrency)}
              />
              {Math.abs(paymentLineBuckets.addons) > BOND_KIND_LINE_MIN ? (
                <CbCheckoutTotalRow
                  label={tx("extras")}
                  value={formatPrice(paymentLineBuckets.addons, bagCurrency)}
                />
              ) : null}
              {Math.abs(paymentLineBuckets.memberships) > BOND_KIND_LINE_MIN ? (
                <CbCheckoutTotalRow
                  label={tx("memberships")}
                  value={formatPrice(paymentLineBuckets.memberships, bagCurrency)}
                />
              ) : null}
              <CbCheckoutTotalRow
                variant="discount"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.82 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" />
                  </svg>
                }
                label={tx("discountAndSavings")}
                value={
                  displayDiscountTotal != null && displayDiscountTotal > 0.005
                    ? `−${formatPrice(displayDiscountTotal, bagCurrency)}`
                    : "—"
                }
              />
              <CbCheckoutTotalRow
                variant="muted"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="15.5" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M16 8L8 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                }
                label={tx("tax")}
                value={
                  bagAggregates.taxTotal != null
                    ? formatPrice(bagAggregates.taxTotal, bagCurrency)
                    : tx("feePending")
                }
              />
              <CbCheckoutTotalRow
                variant="muted"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 7v6l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                label={tx("fees")}
                value={
                  paymentFeeRowAmount != null
                    ? formatPrice(paymentFeeRowAmount, bagCurrency)
                    : paymentOptionsQuery.isPending
                      ? tc("loading")
                      : "—"
                }
                title={
                  paymentFeeRowAmount != null
                    ? formatConsumerPaymentFeeRuleSummary(selectedPaymentChoice?.fee ?? null) ??
                      undefined
                    : tx("feesMayApplyTooltip")
                }
              />
              <CbCheckoutTotalRow
                variant="muted"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                }
                label={tx("paymentMethodRowLabel")}
                value={
                  selectedPaymentChoice != null
                    ? selectedPaymentChoice.displayPrimary
                    : tx("selectPaymentMethod")
                }
              />
              <CbCheckoutTotalRow
                variant="grand"
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 14l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                label={tx("total")}
                value={
                  estimatedAmountDue != null ? (
                    <strong>{formatPrice(estimatedAmountDue, bagCurrency)}</strong>
                  ) : bagAggregates.cartGrandTotal != null ? (
                    <strong>{formatPrice(bagAggregates.cartGrandTotal, bagCurrency)}</strong>
                  ) : (
                    tx("feePending")
                  )
                }
              />
            </div>

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
                  {paymentChoices.some((c) => c.methodType === "card") ? (
                    <button type="button" className="cb-checkout-payment-add-card" disabled>
                      {tc("addNewCard")}
                    </button>
                  ) : null}
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

            <div className="cb-checkout-actions">
              <button type="button" className="cb-btn-ghost" onClick={onClose}>
                {tx("keepShoppingPayment")}
              </button>
              {bagPolicyCheckout === "all_submission" || bagPolicyCheckout === "mixed" ? (
                <button
                  type="button"
                  className="cb-btn-primary"
                  disabled={
                    submitBookingRequestMutation.isPending ||
                    paymentOptionsQuery.isPending ||
                    paymentLines.length === 0 ||
                    (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                    (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                  }
                  onClick={() => submitBookingRequestMutation.mutate()}
                >
                  {submitBookingRequestMutation.isPending
                    ? tx("submitting")
                    : bagPolicyCheckout === "mixed"
                      ? tx("payTitle")
                      : tx("submitRequestTitle")}
                </button>
              ) : depositAmount != null ? (
                <button
                  type="button"
                  className="cb-btn-primary"
                  onClick={() => setDepositModalOpen(true)}
                >
                  {tx("payDepositCta")}
                </button>
              ) : (
                <button
                  type="button"
                  className="cb-btn-primary"
                  disabled={
                    submitBookingRequestMutation.isPending ||
                    paymentOptionsQuery.isPending ||
                    paymentLines.length === 0 ||
                    (paymentChoices.length > 0 && selectedPaymentMethodId == null) ||
                    (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                  }
                  onClick={() => submitBookingRequestMutation.mutate()}
                >
                  {submitBookingRequestMutation.isPending ? tx("submitting") : tx("payNow")}
                </button>
              )}
            </div>

            {showPaymentApprovalFootnote ? (
              <div
                className="cb-checkout-category-approval-notice mt-4 rounded-md border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-2.5 text-sm leading-snug text-[var(--cb-text)]"
                role="note"
              >
                {tx("approvalNoticeBag")}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === "addons" ? (
          <div className="cb-checkout-step">
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
                <div className="cb-checkout-addon-panel-head">
                  <h3 className="cb-checkout-section-title">Extras</h3>
                  {extrasCollapsed ? (
                    <button type="button" className="cb-checkout-textlink" onClick={() => setExtrasCollapsed(false)}>
                      Edit extras
                    </button>
                  ) : (
                    <button type="button" className="cb-checkout-textlink" onClick={() => setExtrasCollapsed(true)}>
                      Collapse
                    </button>
                  )}
                </div>
                {extrasCollapsed ? (
                  <div className="cb-checkout-extras-summary">
                    {selectedAddonIds.size === 0 ? (
                      <p className="cb-muted text-sm">No optional extras selected.</p>
                    ) : (
                      <ul className="cb-checkout-chip-list">
                        {[...selectedAddonIds].map((id) => {
                          const a = packageAddons.find((p) => p.id === id);
                          return (
                            <li key={id} className="cb-checkout-chip">
                              {a?.name ?? `Extra ${id}`}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <BookingAddonPanel
                    visibleAddons={packageAddonsVisible}
                    hasMoreAddons={packageAddons.length > ADDONS_PAGE}
                    addonsExpanded={addonsExpanded}
                    onToggleExpand={onToggleExpandAddons}
                    moreCount={packageAddons.length - ADDONS_PAGE}
                    selectedAddonIds={selectedAddonIds}
                    onToggleAddon={onToggleAddon}
                    addonSlotTargeting={addonSlotTargeting}
                    onAddonSelectAllSlots={onAddonSelectAllSlots}
                    onToggleAddonSlot={onToggleAddonSlot}
                    pickedSlots={pickedSlots}
                    formatPrice={formatPrice}
                  />
                )}
              </div>
            ) : packageAddons.length > 0 && pickedSlots.length === 0 ? (
              <p className="cb-muted mt-2 text-sm">Select time slots first to add per-slot extras.</p>
            ) : null}

            <div className="cb-checkout-actions">
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
                Continue
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
              showFootnote: true,
              showReviewHint: isLastStepBeforeSync,
            })}
            <div className="cb-checkout-actions">
              <button
                type="button"
                className="cb-btn-ghost"
                onClick={() => {
                  const p = previousStepInCheckoutFlow("membership", checkoutFlowFlags);
                  if (p === "close") onClose();
                  else setStep(p);
                }}
              >
                Back
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
                Continue
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
            <div className="cb-checkout-actions">
              <button
                type="button"
                className="cb-btn-ghost"
                onClick={() => {
                  const p = previousStepInCheckoutFlow("forms", checkoutFlowFlags);
                  if (p === "close") onClose();
                  else setStep(p);
                }}
              >
                Back
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
                  showFootnote: true,
                  showReviewHint: false,
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
                  onClick={() => {
                    persistCartMutation.reset();
                    persistBondCart();
                  }}
                >
                  {tc("retry")}
                </button>
              </div>
            ) : !cannotMergeSessionCart ? (
              <div className="cb-checkout-actions">
                <button
                  type="button"
                  className="cb-btn-ghost"
                  onClick={() => {
                    const prev = previousStepInCheckoutFlow("syncCart", checkoutFlowFlags);
                    if (prev === "close") onClose();
                    else setStep(prev);
                  }}
                >
                  {tc("back")}
                </button>
                {showGoToCartOnSyncStep && bagSnapshots.length > 0 && onGoToCart ? (
                  <button type="button" className="cb-btn-outline" onClick={() => onGoToCart()}>
                    {tc("goToCart")}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="cb-btn-primary"
                  disabled={!canBondPersistCart || pickedSlots.length === 0}
                  onClick={() => persistBondCart()}
                >
                  {tx("addToCart")}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

      </div>

      <ModalShell
        open={depositModalOpen && depositAmount != null}
        title={tx("depositModalTitle")}
        onClose={() => setDepositModalOpen(false)}
        panelClassName="cb-modal-panel--checkout-deposit"
      >
        <div className="cb-checkout-deposit-modal">
          <p className="cb-muted text-sm leading-relaxed">{tx("depositModalBody")}</p>
          <div className="cb-checkout-totals mt-4">
            <div className="cb-checkout-total-row">
              <span>{tx("depositDueNow")}</span>
              <strong>
                {depositAmount != null ? formatPrice(depositAmount, bagCurrency) : "—"}
              </strong>
            </div>
            <div className="cb-checkout-total-row cb-checkout-total-row--muted">
              <span>{tx("fullBalance")}</span>
              <span>
                {estimatedAmountDue != null
                  ? formatPrice(estimatedAmountDue, bagCurrency)
                  : bagAggregates.cartGrandTotal != null
                    ? formatPrice(bagAggregates.cartGrandTotal, bagCurrency)
                    : bagGrandTotal != null
                      ? formatPrice(bagGrandTotal, bagCurrency)
                      : "—"}
              </span>
            </div>
          </div>
          <div className="cb-checkout-actions cb-checkout-actions--stack">
            <button
              type="button"
              className="cb-btn-primary w-full"
              disabled
              title={tx("paymentGatewaySoon")}
            >
              {tx("payDeposit")}
              {depositAmount != null ? ` (${formatPrice(depositAmount, bagCurrency)})` : ""}
            </button>
            <button
              type="button"
              className="cb-btn-outline w-full"
              disabled
              title={tx("paymentGatewaySoon")}
            >
              {tx("payInFull")}
              {estimatedAmountDue != null
                ? ` (${formatPrice(estimatedAmountDue, bagCurrency)})`
                : bagGrandTotal != null
                  ? ` (${formatPrice(bagGrandTotal, bagCurrency)})`
                  : ""}
            </button>
          </div>
        </div>
      </ModalShell>
          </>
        )}
      </Fragment>
    </RightDrawer>
  );
}
