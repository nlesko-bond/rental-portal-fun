"use client";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { bookingContactSnapshot } from "@/lib/booking-profile-contact";
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
} from "@/lib/cart-purchase-lines";

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
  /** Remove a cart row; parent should call Bond `closeCart` / `removeCartItem` then update session. */
  onRemoveBagLine?: (index: number) => void | Promise<void>;
  /** Portal category `settings.approvalRequired` — checkout step shows Submit request vs Pay now. */
  approvalRequired?: boolean;
  /**
   * Called when checkout is finished from the payment step (submit request, or pay when wired).
   * Parent should clear session cart storage and UI.
   */
  onCheckoutComplete?: () => void;
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
  onCheckoutComplete,
  orgDisplayName,
  onBookingForClick,
  mergeCartId,
  onAddedToCart,
  onBookAnotherRental,
  onBackFromPayment,
  onRequestBagCheckout,
  navigateToCheckoutStep,
  onClearNavigateToCheckoutStep,
  requiredMembershipAlreadySatisfied = false,
  onParticipantLockChange,
  onPruneSatisfiedAddonProductIds,
}: Props) {
  const onCheckoutCompleteRef = useRef(onCheckoutComplete);
  onCheckoutCompleteRef.current = onCheckoutComplete;
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
  const [postCreateAwaitingContinue, setPostCreateAwaitingContinue] = useState(false);
  /** After `finalizeCart` succeeds — show confirmation (invoice / reservation) before parent clears session. */
  const [finalizeSuccess, setFinalizeSuccess] = useState<FinalizeSuccessDisplay | null>(null);
  const [finalizeCopyFlash, setFinalizeCopyFlash] = useState<"invoice" | "reservation" | null>(null);
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
      open && mode === "checkout" && step === "payment" && orgId > 0 && primaryAccountUserId > 0,
  });

  const paymentChoices = useMemo(
    () => flattenConsumerPaymentChoices(paymentOptionsQuery.data ?? []),
    [paymentOptionsQuery.data]
  );
  const paymentChoicesRef = useRef(paymentChoices);
  paymentChoicesRef.current = paymentChoices;

  useEffect(() => {
    if (step !== "payment" || mode !== "checkout") return;
    if (paymentChoices.length === 0) return;
    setSelectedPaymentMethodId((prev) => {
      if (prev != null && paymentChoices.some((p) => p.id === prev)) return prev;
      return paymentChoices[0]!.id;
    });
  }, [step, mode, paymentChoices]);

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
    setPostCreateAwaitingContinue(false);
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
      requiredProductLineItems:
        requiredProductLineItemsForBond.length > 0 ? requiredProductLineItemsForBond : undefined,
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

  const finishAddToCart = useCallback(() => {
    setPostCreateAwaitingContinue(false);
    if (onAddedToCart) onAddedToCart();
    else onClose();
  }, [onAddedToCart, onClose]);

  const persistCartMutation = useMutation({
    mutationFn: () =>
      postOnlineBookingCreate(orgId, buildCreatePayload(mergeCartId != null && mergeCartId > 0)),
    onSuccess: (cart) => {
      setLastCart(cart);
      if (approvalRequired) setApprovalDeferred(true);
      if (cart != null) onSuccess(cart);
      setPostCreateAwaitingContinue(true);
    },
  });

  const handleBookAnotherRental = useCallback(() => {
    setPostCreateAwaitingContinue(false);
    persistCartMutation.reset();
    if (onBookAnotherRental) onBookAnotherRental();
    else onClose();
  }, [onBookAnotherRental, onClose, persistCartMutation]);

  const dismissBookingConfirmed = useCallback(() => {
    setFinalizeSuccess(null);
    setFinalizeCopyFlash(null);
    onClose();
  }, [onClose]);

  const copyFinalizeId = useCallback(async (kind: "invoice" | "reservation", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFinalizeCopyFlash(kind === "invoice" ? "invoice" : "reservation");
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
    onSuccess: (data) => {
      setFinalizeSuccess(parseFinalizeCartResponse(data));
      onCheckoutCompleteRef.current?.();
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

  /** After create succeeds, header+presummary are hidden so “Added to cart” is one screen (no duplicate summary blocks). */
  const postCreateSuccessVisible =
    step === "syncCart" && persistCartMutation.isSuccess && postCreateAwaitingContinue;

  const showPreCheckoutShell =
    step === "addons" ||
    step === "membership" ||
    step === "forms" ||
    (step === "syncCart" && !postCreateSuccessVisible);

  /** When any row is a real Bond cart, line amounts are already member-priced; schedule “savings” must not be subtracted again. */
  const paymentLinesHaveBondCart = useMemo(
    () => paymentLines.some((r) => typeof r.cart?.id === "number" && r.cart.id > 0),
    [paymentLines]
  );

  const bagPolicyCheckout = useMemo(() => bagApprovalPolicy(paymentLines), [paymentLines]);
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
    if (mode === "bag") return tx("savedBookings");
    switch (step) {
      case "addons":
        return packageAddons.length > 0 ? tx("addonsTitle") : tx("requiredItemsTitle");
      case "membership":
        return tx("membershipTitle");
      case "forms":
        return tx("additionalInfoTitle");
      case "syncCart":
        if (postCreateAwaitingContinue) return tx("addedToCartTitle");
        return persistCartMutation.isPending ? tx("preparingPricing") : tx("addToCart");
      case "payment":
        return tx("cartDrawerTitle");
    }
  }, [mode, step, packageAddons.length, tx, persistCartMutation.isPending, postCreateAwaitingContinue]);

  const bagDrawerLineCount = useMemo(() => countSessionCartLineItems(bagSnapshots), [bagSnapshots]);

  /** Bond cart fields only (no client-side line math). */
  const bagSessionAggregates = useMemo(() => aggregateBagSnapshots(bagSnapshots), [bagSnapshots]);

  const bagLineBuckets = useMemo(() => aggregateBagCartLineBuckets(bagSnapshots), [bagSnapshots]);

  const bagEstimatedTotal = useMemo(
    () => estimateAmountDue(bagSessionAggregates, { includeProvisionalFees: false }),
    [bagSessionAggregates]
  );

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

  const transactionFeesDisplay = useMemo(() => {
    const ruleLabel = formatConsumerPaymentFeeRuleSummary(selectedPaymentChoice?.fee ?? null);
    if (bagAggregates.feeTotal != null) {
      return { kind: "amount" as const, value: bagAggregates.feeTotal, ruleLabel };
    }
    if (paymentProcessingFeeEstimate != null && paymentProcessingFeeEstimate > 0) {
      return { kind: "amount" as const, value: paymentProcessingFeeEstimate, ruleLabel };
    }
    if (bagPolicyCheckout === "all_submission") {
      return { kind: "muted" as const, text: "—", ruleLabel };
    }
    if (paymentChoices.length === 0) {
      return { kind: "hint" as const, text: tx("addPaymentWhenAvailable"), ruleLabel: null as string | null };
    }
    if (!selectedPaymentMethodId) {
      return { kind: "hint" as const, text: tx("selectPaymentMethod"), ruleLabel: null as string | null };
    }
    return { kind: "muted" as const, text: "—", ruleLabel };
  }, [
    bagAggregates.feeTotal,
    paymentProcessingFeeEstimate,
    bagPolicyCheckout,
    paymentChoices.length,
    selectedPaymentMethodId,
    selectedPaymentChoice,
    tx,
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
              <ul className="cb-checkout-payment-lines">
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
        ariaLabel={tx("savedBookings")}
        title={title}
        panelClassName={panelCls}
      >
          <div className="cb-checkout-inner cb-checkout-inner--bag">
          <div className="cb-cart-bag-heading">
            <p className="cb-cart-bag-subtitle">{tx("inYourCart")}</p>
            {nBookings > 0 ? (
              <span className="cb-cart-bag-count-pill">
                {bagDrawerLineCount} {bagDrawerLineCount === 1 ? tx("lineSingular") : tx("linePlural")} · {nBookings}{" "}
                {nBookings === 1 ? tx("bookingSingular") : tx("bookingPlural")}
              </span>
            ) : null}
          </div>
          {groupedBagWithTotals.length > 1 ? (
                       <p className="cb-muted mb-3 text-sm leading-relaxed">
              {tx("cartGroupedShort")}{" "}
              <CbInfoHint label={tx("cartGroupedHintLabel")} description={tx("cartGroupedByPerson")} />
            </p>
          ) : null}
          {bagSnapshots.length > 0 && approvalRequired ? (
            <div
              className="cb-checkout-category-approval-notice mb-3 rounded-md border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-2.5 text-sm leading-snug text-[var(--cb-text)]"
              role="note"
            >
              {tx("approvalNoticeBag")}
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
                                className={`cb-cart-bag-line-main${lineIdx > 0 ? " mt-3 border-t border-[var(--cb-border)] pt-3" : ""}`}
                              >
                                <div>
                                  <p className="cb-cart-bag-line-title">{line.title}</p>
                                  <p className="cb-cart-bag-line-meta">{line.meta}</p>
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
                                  {lineIdx === 0 && onRemoveBagLine ? (
                                    <button
                                      type="button"
                                      className="cb-cart-bag-remove"
                                      aria-label={`Remove ${row.productName}`}
                                      onClick={() => onRemoveBagLine(index)}
                                    >
                                      <span aria-hidden>🗑</span>
                                    </button>
                                  ) : null}
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
                {bagSessionAggregates.discountTotal != null && bagSessionAggregates.discountTotal > 0.0001 ? (
                  <CbCheckoutTotalRow
                    variant="discount"
                    label={tx("discountAndSavings")}
                    value={`−${formatPrice(bagSessionAggregates.discountTotal, bagCurrency)}`}
                  />
                ) : null}
                <CbCheckoutTotalRow
                  variant="muted"
                  label={tx("tax")}
                  value={
                    bagSessionAggregates.taxTotal != null
                      ? formatPrice(bagSessionAggregates.taxTotal, bagCurrency)
                      : tx("feePending")
                  }
                />
                <CbCheckoutTotalRow
                  variant="muted"
                  label={tx("transactionFee")}
                  value={
                    bagSessionAggregates.feeTotal != null
                      ? formatPrice(bagSessionAggregates.feeTotal, bagCurrency)
                      : tx("feePending")
                  }
                  valueClassName="text-[var(--cb-text-muted)] text-right text-xs"
                />
                <p className="cb-cart-bag-fees-note mt-1 mb-px text-xs leading-snug text-[var(--cb-text-muted)]">
                  {tx("transactionFeesShort")}{" "}
                  <CbInfoHint label={tx("infoHintMore")} description={tx("transactionFeesDetail")} />
                </p>
                <CbCheckoutTotalRow
                  variant="grand"
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
              <p className="cb-muted text-xs leading-relaxed">
                {tx("bondAmountsShort")}{" "}
                <CbInfoHint label={tx("infoHintMore")} description={tx("bondAmountsDetail")} />
              </p>
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

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      onBack={showDrawerBack ? handleToolbarBack : undefined}
      ariaLabel={title}
      title={title}
      panelClassName={panelCls}
    >
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

            <p className="cb-checkout-product">
              <span className="cb-checkout-product-label">{tx("serviceShort")}</span>
              <span className="cb-checkout-product-name">{productName}</span>
            </p>

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
            ) : step === "forms" ? null : (
              renderPresummaryCard({
                headingId: "cb-presummary-heading",
                keyPrefix: "pre",
                showFootnote: true,
                showReviewHint: isLastStepBeforeSync,
              })
            )}
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
            <div className="cb-checkout-payment-purchase-groups mb-4">
              {groupedBagWithTotals.map((section, si) => (
                <section key={`${section.label}-${si}`} className="cb-checkout-payment-group">
                  <h4 className="cb-checkout-payment-group-title">
                    {groupHeadingForBooking(section.label, si, Math.max(1, paymentSectionCount), tx)}
                  </h4>
                  <ul className="cb-checkout-payment-lines">
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
                  <ul className="cb-checkout-payment-lines">
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

            <h3 className="cb-checkout-section-title">Totals</h3>
            <div className="cb-checkout-totals mb-6">
              <div className="cb-checkout-total-row">
                <span>Subtotal</span>
                <span>
                  {bagAggregates.lineSubtotal != null
                    ? formatPrice(bagAggregates.lineSubtotal, bagCurrency)
                    : bagGrandTotal != null
                      ? formatPrice(bagGrandTotal, bagCurrency)
                      : "—"}
                </span>
              </div>
              {displayDiscountTotal != null && displayDiscountTotal > 0.005 ? (
                <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                  <span>{tc("discountsAndSavings")}</span>
                  <span>−{formatPrice(displayDiscountTotal, bagCurrency)}</span>
                </div>
              ) : null}
              <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                <span>Tax</span>
                <span>
                  {bagAggregates.taxTotal != null
                    ? formatPrice(bagAggregates.taxTotal, bagCurrency)
                    : "—"}
                </span>
              </div>
              <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                <span>
                  {transactionFeesDisplay.ruleLabel
                    ? `${tx("transactionFee")} (${transactionFeesDisplay.ruleLabel})`
                    : tx("transactionFee")}
                </span>
                <span
                  className={
                    transactionFeesDisplay.kind === "hint" ? "text-[var(--cb-text-muted)] text-right text-xs" : ""
                  }
                >
                  {transactionFeesDisplay.kind === "amount"
                    ? formatPrice(transactionFeesDisplay.value, bagCurrency)
                    : transactionFeesDisplay.text}
                </span>
              </div>
              <div className="cb-checkout-total-row cb-checkout-total-row--grand">
                <span>Total</span>
                <strong>
                  {estimatedAmountDue != null
                    ? formatPrice(estimatedAmountDue, bagCurrency)
                    : bagAggregates.cartGrandTotal != null
                      ? formatPrice(bagAggregates.cartGrandTotal, bagCurrency)
                      : "—"}
                </strong>
              </div>
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
                    setPostCreateAwaitingContinue(false);
                    persistBondCart();
                  }}
                >
                  {tc("retry")}
                </button>
              </div>
            ) : persistCartMutation.isSuccess && postCreateAwaitingContinue ? (
              <div className="cb-checkout-post-create">
                <div className="cb-checkout-confirmation-hero">
                  <div className="cb-checkout-confirmation-icon" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="cb-checkout-confirmation-kicker">{tx("addedToCartTitle")}</p>
                  <p className="cb-checkout-confirmation-sub cb-muted">{tx("addedToCartSubtitle")}</p>
                </div>
                <div className="cb-checkout-post-create-footer">
                  <button
                    type="button"
                    className="cb-btn-outline cb-checkout-post-create-secondary w-full"
                    onClick={handleBookAnotherRental}
                  >
                    <span className="cb-checkout-post-create-plus" aria-hidden>
                      +
                    </span>{" "}
                    {tx("bookAnotherRental")}
                  </button>
                  <button type="button" className="cb-btn-primary w-full" onClick={finishAddToCart}>
                    {tx("continueToPayment")}
                  </button>
                </div>
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

      <ModalShell
        open={finalizeSuccess != null}
        title={tx("bookingConfirmedTitle")}
        hideTitle
        ariaLabel={tx("bookingConfirmedTitle")}
        onClose={dismissBookingConfirmed}
        panelClassName={`consumer-booking ${appearanceClass} cb-modal-panel--booking-confirmed`.trim()}
      >
        <div className="cb-booking-confirmed">
          <div className="cb-booking-confirmed-hero">
            <div className="cb-booking-confirmed-icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="cb-booking-confirmed-title">{tx("bookingConfirmedTitle")}</h2>
            <p className="cb-booking-confirmed-sub cb-muted">{tx("bookingConfirmedSubtitle")}</p>
          </div>
          {finalizeSuccess?.reservationRef != null || finalizeInvoiceDisplay != null ? (
            <div className="cb-booking-confirmed-details">
              {finalizeSuccess != null && finalizeSuccess.reservationRef != null ? (
                <div className="cb-booking-confirmed-detail-row">
                  <span className="cb-booking-confirmed-detail-label">{tx("reservationLabel")}</span>
                  <span className="cb-booking-confirmed-detail-value">{finalizeSuccess.reservationRef}</span>
                  <button
                    type="button"
                    className="cb-booking-confirmed-copy"
                    onClick={() => copyFinalizeId("reservation", finalizeSuccess.reservationRef!)}
                  >
                    {finalizeCopyFlash === "reservation" ? tx("copied") : tx("copyId")}
                  </button>
                </div>
              ) : null}
              {finalizeInvoiceDisplay != null ? (
                <div className="cb-booking-confirmed-detail-row cb-booking-confirmed-detail-row--invoice">
                  <span className="cb-booking-confirmed-detail-label">{tx("invoiceLabel")}</span>
                  {finalizeInvoicePortalUrl != null ? (
                    <a
                      className="cb-booking-confirmed-invoice-id"
                      href={finalizeInvoicePortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${tx("invoiceLabel")}: ${finalizeInvoiceDisplay}`}
                    >
                      {finalizeInvoiceDisplay}
                    </a>
                  ) : (
                    <span className="cb-booking-confirmed-invoice-id cb-booking-confirmed-invoice-id--plain">
                      {finalizeInvoiceDisplay}
                    </span>
                  )}
                  <div className="cb-booking-confirmed-detail-row-actions">
                    <button
                      type="button"
                      className="cb-booking-confirmed-copy"
                      onClick={() => copyFinalizeId("invoice", finalizeInvoiceDisplay)}
                    >
                      {finalizeCopyFlash === "invoice" ? tx("copied") : tx("copyId")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <p className="cb-booking-confirmed-email cb-muted text-center text-sm">
            {confirmationAccountEmail != null
              ? tx("confirmationEmailSent", { email: confirmationAccountEmail })
              : tx("confirmationEmailGeneric")}
          </p>
          <div className="cb-booking-confirmed-actions">
            <button type="button" className="cb-btn-outline" onClick={openCalendarTemplate}>
              {tx("addToCalendar")}
            </button>
            <button type="button" className="cb-btn-primary" onClick={dismissBookingConfirmed}>
              {tx("done")}
            </button>
          </div>
        </div>
      </ModalShell>
    </RightDrawer>
  );
}
