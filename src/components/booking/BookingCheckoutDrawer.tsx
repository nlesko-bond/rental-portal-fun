"use client";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModalShell } from "@/components/booking/ModalShell";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { formatConsumerBookingErrorUnknown } from "@/lib/bond-errors";
import {
  fetchCheckoutQuestionnaires,
  fetchPublicQuestionnaireById,
  fetchUserRequiredProducts,
  postOnlineBookingCreate,
} from "@/lib/online-booking-user-api";
import { buildOnlineBookingCreateBody, splitAddonPayloadForCreate } from "@/lib/online-booking-create-body";
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
import { formatPickedSlotTimeRange } from "./booking-slot-labels";
import {
  groupContiguousPickedSlotsForConfirm,
  spanLabelForSlotGroup,
} from "@/lib/booking-slot-group-display";
import { formatScheduleSummaryForBooking } from "@/lib/session-booking-display-lines";
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
  estimateAmountDue,
  getBondCartPrimaryLineStrike,
  getBondCartPricingDisplayRows,
  getBondCartReceiptLineItems,
  sumBondCartLineKindsFromCart,
} from "@/lib/checkout-bag-totals";
import {
  describeEntitlementsForDisplay,
  reverseEntitlementDiscountsToUnitPrice,
} from "@/lib/entitlement-discount";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import {
  bagApprovalPolicy,
  countSessionCartLineItems,
  expandSnapshotForPurchaseList,
} from "@/lib/cart-purchase-lines";

/** Until Bond exposes saved instruments, user confirms a card on file so checkout can enforce payment. */
const BOND_PLACEHOLDER_PAYMENT_ID = "bond-payment-on-file";

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

function groupHeadingForBooking(label: string, sectionIndex: number, sectionCount: number): string {
  const t = label.trim();
  const base = t.length === 0 || t === "Booking" ? "Booking" : `Booking for ${t}`;
  if (sectionCount <= 1) return base;
  return `${sectionIndex + 1}. ${base}`;
}

export type CheckoutStep = "addons" | "membership" | "forms" | "confirm" | "payment";

type FlowFlags = { hasAddonsStep: boolean; hasMembershipStep: boolean; hasFormsStep: boolean };

function previousStepInCheckoutFlow(step: CheckoutStep, flow: FlowFlags): CheckoutStep | "close" {
  if (step === "payment") return "confirm";
  if (step === "confirm") {
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

/** Bond kind breakdown row — hide line items at or below this (display cents). */
const BOND_KIND_LINE_MIN = 0.005;

function addonCurrencyMatchesProduct(addonCurrency: string, productCurrency: string): boolean {
  return addonCurrency.trim().toUpperCase() === productCurrency.trim().toUpperCase();
}

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
  /** Remove a line from the in-memory session cart list. */
  onRemoveBagLine?: (index: number) => void;
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
  onBackFromPayment,
  onRequestBagCheckout,
  navigateToCheckoutStep,
  onClearNavigateToCheckoutStep,
  requiredMembershipAlreadySatisfied = false,
  onParticipantLockChange,
  onPruneSatisfiedAddonProductIds,
}: Props) {
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
  /** Membership OR-options from `GET .../products/.../required` (OpenAPI `ExtendedRequiredProductDto[]`). */
  const [selectedMembershipRootId, setSelectedMembershipRootId] = useState<number | null>(null);
  const [membershipSelectionResolved, setMembershipSelectionResolved] = useState(false);
  /** Placeholder until Bond exposes saved instruments (e.g. `GET .../user/payment-methods`). */
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const drawerWasOpen = useRef(false);
  /** After `navigateToCheckoutStep` applies, skip the next full checkout reset (parent clears navigate in the same tick). */
  const skipNextCheckoutResetRef = useRef(false);
  /** Synced after `firstCheckoutStep` is computed — open-reset effect reads this so step matches forms/confirm when needed. */
  const firstCheckoutStepRef = useRef<CheckoutStep>("addons");
  /** Must not be a hook dependency — unstable parent lambdas retriggered the effect every render and reset step to addons. */
  const onClearNavigateRef = useRef(onClearNavigateToCheckoutStep);
  onClearNavigateRef.current = onClearNavigateToCheckoutStep;

  const currency = product?.prices[0]?.currency ?? "USD";

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
      (step === "addons" || step === "membership" || step === "forms" || step === "confirm"),
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
    return {
      membershipOptions: [] as ExtendedRequiredProductNode[],
      otherRequired: legacy
        .filter((r) => r.required !== false)
        .map(
          (r) =>
            ({
              id: r.id,
              name: r.name,
              productType: r.productType,
              required: r.required,
            }) as ExtendedRequiredProductNode
        ),
    };
  }, [extendedRequiredList, requiredQuery.data]);

  const hasAddonsStep = packageAddons.length > 0 || otherRequired.length > 0;

  const pruneSatisfiedAddonsRef = useRef(onPruneSatisfiedAddonProductIds);
  pruneSatisfiedAddonsRef.current = onPruneSatisfiedAddonProductIds;

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
    setStep(questionnaireIds.length > 0 ? "forms" : "confirm");
  }, [open, mode, requiredMembershipAlreadySatisfied, step, questionnaireIds.length]);

  /** Flat list for confirm-step labels (includes nested required product ids + catalog prices when Bond sends them). */
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

  const publicQuestionnaireQueries = useQueries({
    queries: questionnaireIds.map((qid) => ({
      queryKey: ["bond", "questionnaire", orgId, qid],
      queryFn: () => fetchPublicQuestionnaireById(orgId, qid),
      enabled:
        mode === "checkout" &&
        open &&
        questionnaireIds.length > 0 &&
        step !== "payment" &&
        (step === "addons" || step === "forms" || step === "membership"),
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
      (step === "addons" || step === "forms" || step === "membership"),
  });

  const hasMembershipStep = membershipOptionsForStep.length > 0;
  const hasFormsStep = questionnaireIds.length > 0;

  const firstCheckoutStep = useMemo((): CheckoutStep => {
    if (hasAddonsStep) return "addons";
    if (hasMembershipStep) return "membership";
    if (hasFormsStep) return "forms";
    return "confirm";
  }, [hasAddonsStep, hasMembershipStep, hasFormsStep]);
  firstCheckoutStepRef.current = firstCheckoutStep;

  /** When the drawer closes, drop back to the first checkout step so the next open isn’t stuck on confirm/payment after the bag. */
  useEffect(() => {
    if (open) return;
    setStep(firstCheckoutStep);
  }, [open, firstCheckoutStep]);

  const preCheckoutSteps = useMemo(() => {
    const s: CheckoutStep[] = [];
    if (hasAddonsStep) s.push("addons");
    if (hasMembershipStep) s.push("membership");
    if (hasFormsStep) s.push("forms");
    s.push("confirm");
    return s;
  }, [hasAddonsStep, hasMembershipStep, hasFormsStep]);

  const totalPreSteps = preCheckoutSteps.length;

  const currentPreStepNumber = useMemo(() => {
    if (step === "payment") return 0;
    const i = preCheckoutSteps.indexOf(step);
    if (i >= 0) return i + 1;
    return 1;
  }, [step, preCheckoutSteps]);

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
          : "confirm";
    const participantLocked = !(step === firstCheckoutStep && firstCheckoutStep !== "confirm");
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
          : "confirm"
    );
  }, [open, mode, step, hasAddonsStep, membershipOptionsForStep.length, questionnaireIds.length]);

  const preCheckoutStepLabel = useMemo(() => {
    if (step === "payment") return "";
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

  /**
   * One `POST …/create` when the user reaches the booking summary (`confirm`): Bond returns the real cart
   * (discounts, membership lines, `cartId` when merging). **Add to cart** only copies that DTO into the
   * session bag — no second create.
   */
  const confirmBondCartPayload = useMemo(
    () => buildCreatePayload(mergeCartId != null && mergeCartId > 0),
    [buildCreatePayload, mergeCartId]
  );

  /** Session already has carts but we have no Bond cart id to merge into — block add until storage is fixed or cleared. */
  const cannotMergeSessionCart = useMemo(
    () => bagSnapshots.length > 0 && (mergeCartId == null || mergeCartId <= 0),
    [bagSnapshots.length, mergeCartId]
  );

  const confirmBondCartQuery = useQuery({
    queryKey: ["bond", "confirmBondCart", orgId, confirmBondCartPayload],
    queryFn: () => postOnlineBookingCreate(orgId, confirmBondCartPayload),
    enabled: mode === "checkout" && open && step === "confirm" && pickedSlots.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const awaitingConfirmBondCart = confirmBondCartQuery.isPending && confirmBondCartQuery.data == null;

  const previewReceiptLines = useMemo(
    () => (confirmBondCartQuery.data != null ? getBondCartReceiptLineItems(confirmBondCartQuery.data) : []),
    [confirmBondCartQuery.data]
  );

  /** Same `OrganizationCartDto` → rows as post–add-to-cart (`lastCartBondPricing`). */
  const previewBondPricing = useMemo(() => {
    if (confirmBondCartQuery.data == null) return null;
    const base = getBondCartPricingDisplayRows(confirmBondCartQuery.data);
    const hint = describeEntitlementsForDisplay(product?.entitlementDiscounts);
    if (!hint) return base;
    return {
      ...base,
      rows: base.rows.map((r) =>
        r.variant === "discount" ? { ...r, detail: r.detail ?? hint } : r
      ),
    };
  }, [confirmBondCartQuery.data, product?.entitlementDiscounts]);

  const previewKindBreakdown = useMemo(() => {
    if (confirmBondCartQuery.data == null) return null;
    return sumBondCartLineKindsFromCart(confirmBondCartQuery.data);
  }, [confirmBondCartQuery.data]);

  const showBondSplitRows = useMemo(() => {
    if (previewKindBreakdown == null) return false;
    const { rentals, memberships, addons } = previewKindBreakdown;
    return (
      Math.abs(rentals) > BOND_KIND_LINE_MIN ||
      Math.abs(memberships) > BOND_KIND_LINE_MIN ||
      Math.abs(addons) > BOND_KIND_LINE_MIN
    );
  }, [previewKindBreakdown]);

  const bondPricingRowsFiltered = useMemo(() => {
    if (previewBondPricing == null) return [];
    const rows = previewBondPricing.rows;
    if (!showBondSplitRows) return rows;
    return rows.filter(
      (r, i) =>
        !(i === 0 && r.variant === "default" && r.label.trim().toLowerCase() === "subtotal")
    );
  }, [previewBondPricing, showBondSplitRows]);

  const hasBondReceiptLineItems =
    confirmBondCartQuery.isSuccess &&
    confirmBondCartQuery.data != null &&
    previewReceiptLines.length > 0;
  const showBondPricingFooter =
    confirmBondCartQuery.isSuccess &&
    previewBondPricing != null &&
    previewBondPricing.rows.length > 0;

  const confirmPreviewStrike = useMemo(
    () => (confirmBondCartQuery.data != null ? getBondCartPrimaryLineStrike(confirmBondCartQuery.data) : null),
    [confirmBondCartQuery.data]
  );

  const confirmBondCartErrorText = useMemo(() => {
    if (!confirmBondCartQuery.isError || confirmBondCartQuery.error == null) return null;
    if (confirmBondCartQuery.isFetching) return null;
    return formatConsumerBookingErrorUnknown(confirmBondCartQuery.error, {
      customerLabel: bookingForLabel,
      orgName: orgDisplayName,
      productName,
    });
  }, [
    confirmBondCartQuery.isError,
    confirmBondCartQuery.isFetching,
    confirmBondCartQuery.error,
    bookingForLabel,
    orgDisplayName,
    productName,
  ]);

  const finishAddToCart = useCallback(() => {
    if (onAddedToCart) onAddedToCart();
    else onClose();
  }, [onAddedToCart, onClose]);

  const handleConfirmAddToCart = useCallback(() => {
    if (cannotMergeSessionCart) return;
    const cart = confirmBondCartQuery.data ?? null;
    if (!approvalRequired && cart == null) return;
    setLastCart(cart);
    if (approvalRequired) {
      setApprovalDeferred(true);
    }
    if (cart != null) {
      onSuccess(cart);
    }
    finishAddToCart();
  }, [
    approvalRequired,
    cannotMergeSessionCart,
    confirmBondCartQuery.data,
    finishAddToCart,
    onSuccess,
  ]);

  const submitBookingRequestMutation = useMutation({
    mutationFn: async () => {
      if (lastCart != null) return lastCart;
      return postOnlineBookingCreate(orgId, buildCreatePayload(true));
    },
    onSuccess: () => {
      onCheckoutComplete?.();
      onClose();
    },
  });

  useEffect(() => {
    const confirmBondBusy =
      mode === "checkout" &&
      open &&
      step === "confirm" &&
      pickedSlots.length > 0 &&
      (confirmBondCartQuery.isPending || confirmBondCartQuery.isFetching);
    onSubmittingChange?.(submitBookingRequestMutation.isPending || confirmBondBusy);
  }, [
    mode,
    open,
    step,
    pickedSlots.length,
    confirmBondCartQuery.isPending,
    confirmBondCartQuery.isFetching,
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
    if (membershipOptionsForStep.length > 0 && !membershipSelectionResolved) {
      setStep("membership");
      return;
    }
    if (questionnaireIds.length > 0) setStep("forms");
    else setStep("confirm");
  }, [canProceedAddons, membershipOptionsForStep.length, membershipSelectionResolved, questionnaireIds.length]);

  const handleMembershipConfirm = useCallback(() => {
    if (membershipOptionsForStep.length === 0) {
      setMembershipSelectionResolved(true);
      if (questionnaireIds.length > 0) setStep("forms");
      else setStep("confirm");
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
    else setStep("confirm");
  }, [membershipOptionsForStep, selectedMembershipRootId, questionnaireIds.length]);

  const goNextFromForms = useCallback(() => {
    if (!formsValid) return;
    setStep("confirm");
  }, [formsValid]);

  const checkoutFlowFlags = useMemo<FlowFlags>(
    () => ({
      hasAddonsStep,
      hasMembershipStep: membershipOptionsForStep.length > 0,
      hasFormsStep: questionnaireIds.length > 0,
    }),
    [hasAddonsStep, membershipOptionsForStep.length, questionnaireIds.length]
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
    step === "confirm" ||
    step === "payment";

  const subtotal = useMemo(
    () => pickedSlots.reduce((s, p) => s + p.price, 0),
    [pickedSlots]
  );

  const entitlements = product?.entitlementDiscounts;

  /** Shown under discounted line items so members see which catalog entitlement applies. */
  const entitlementCatalogHint = useMemo(
    () => describeEntitlementsForDisplay(product?.entitlementDiscounts),
    [product?.entitlementDiscounts]
  );

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

  const confirmSlotGroups = useMemo(() => groupContiguousPickedSlotsForConfirm(pickedSlots), [pickedSlots]);

  /** Confirmed required add-ons (memberships, fees) — only same currency as rental for subtotal math. */
  const requiredProductsTotal = useMemo(() => {
    let sum = 0;
    for (const r of allRequiredFlat) {
      if (!requiredSelected.has(r.id) || !r.displayPrice) continue;
      if (r.displayPrice.currency !== currency) continue;
      sum += r.displayPrice.amount;
    }
    return sum;
  }, [allRequiredFlat, requiredSelected, currency]);

  /** Required SKUs that are membership products (not optional package add-ons). */
  const membershipRequiredTotal = useMemo(() => {
    let sum = 0;
    for (const r of allRequiredFlat) {
      if (!requiredSelected.has(r.id) || !r.displayPrice) continue;
      if (r.displayPrice.currency !== currency) continue;
      if (!isMembershipRequiredProduct(r as ExtendedRequiredProductNode)) continue;
      sum += r.displayPrice.amount;
    }
    return sum;
  }, [allRequiredFlat, requiredSelected, currency]);

  const nonMembershipRequiredTotal = useMemo(
    () => Math.max(0, requiredProductsTotal - membershipRequiredTotal),
    [requiredProductsTotal, membershipRequiredTotal]
  );

  /** Optional package add-ons selected on the add-ons step (matches card math). */
  const optionalAddonsConfirmTotal = useMemo(() => {
    let sum = 0;
    for (const a of packageAddons) {
      if (!selectedAddonIds.has(a.id)) continue;
      const p = resolveAddonDisplayPrice(a);
      if (!p || !addonCurrencyMatchesProduct(p.currency, currency)) continue;
      if (a.level === "reservation") {
        sum += p.price;
        continue;
      }
      const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
      if (eff.size === 0) continue;
      if (a.level === "slot") {
        sum += p.price * eff.size;
      } else {
        for (const s of pickedSlots) {
          if (!eff.has(s.key)) continue;
          const hours = slotDurationMinutes(s) / 60;
          sum += p.price * hours;
        }
      }
    }
    return sum;
  }, [packageAddons, selectedAddonIds, addonSlotTargeting, slotKeySet, pickedSlots, currency]);

  const confirmGrandTotal = useMemo(
    () => subtotal + requiredProductsTotal + optionalAddonsConfirmTotal,
    [subtotal, requiredProductsTotal, optionalAddonsConfirmTotal]
  );

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
      opts?: { approvalRequired?: boolean; scheduleSummary?: string }
    ) => {
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
        ...(opts?.scheduleSummary ? { scheduleSummary: opts.scheduleSummary } : {}),
        ...(opts?.approvalRequired === true ? { approvalRequired: true as const } : {}),
        ...(opts?.approvalRequired === false ? { approvalRequired: false as const } : {}),
      });
    };

    if (approvalDeferred && approvalRequired && pickedSlots.length > 0 && !lastCart) {
      const scheduleSummary = formatScheduleSummaryForBooking(pickedSlots, bookingForLabel);
      pushSynthetic(productName, subtotal, currency, { approvalRequired: true, scheduleSummary });
      for (const r of allRequiredFlat) {
        if (!requiredSelected.has(r.id) || !r.displayPrice) continue;
        if (r.displayPrice.currency !== currency) continue;
        pushSynthetic(r.name ?? `Product ${r.id}`, r.displayPrice.amount, r.displayPrice.currency, {
          approvalRequired: snapshotRowExpectsVenueApproval(r, extendedRequiredList),
          scheduleSummary,
        });
      }
      for (const a of packageAddons) {
        if (!selectedAddonIds.has(a.id)) continue;
        const p = resolveAddonDisplayPrice(a);
        if (!p || p.currency !== currency) continue;
        let amt = 0;
        if (a.level === "reservation") {
          amt = p.price;
        } else {
          const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
          if (eff.size === 0) continue;
          if (a.level === "slot") {
            amt = p.price * eff.size;
          } else {
            for (const s of pickedSlots) {
              if (!eff.has(s.key)) continue;
              amt += p.price * (slotDurationMinutes(s) / 60);
            }
          }
        }
        if (amt > 0) pushSynthetic(a.name, amt, currency, { approvalRequired: true, scheduleSummary });
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
    approvalDeferred,
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

  const paymentSectionCount = groupedBagWithTotals.length + groupedTailPaymentSections.length;

  const bagPolicyCheckout = useMemo(() => bagApprovalPolicy(paymentLines), [paymentLines]);
  const bagPolicyBag = useMemo(() => bagApprovalPolicy(bagSnapshots), [bagSnapshots]);

  const title = useMemo(() => {
    if (mode === "bag") return "Saved bookings";
    switch (step) {
      case "addons":
        return packageAddons.length > 0 ? "Add-ons" : "Required items";
      case "membership":
        return "Membership";
      case "forms":
        return "Additional Information";
      case "confirm":
        return bagSnapshots.length > 0 ? "Review & add to cart" : "Booking summary";
      case "payment":
        if (bagPolicyCheckout === "all_pay") return "Pay";
        if (bagPolicyCheckout === "all_submission") return "Submit request";
        return "Checkout";
    }
  }, [mode, step, bagPolicyCheckout, packageAddons.length, bagSnapshots.length]);

  const bagDrawerLineCount = useMemo(() => countSessionCartLineItems(bagSnapshots), [bagSnapshots]);

  /** Bond cart fields only (no client-side line math). */
  const bagSessionAggregates = useMemo(() => aggregateBagSnapshots(bagSnapshots), [bagSnapshots]);

  const bagLineBuckets = useMemo(() => aggregateBagCartLineBuckets(bagSnapshots), [bagSnapshots]);

  const bagEstimatedTotal = useMemo(
    () => estimateAmountDue(bagSessionAggregates, { includeProvisionalFees: false }),
    [bagSessionAggregates]
  );

  const bagAggregates = useMemo(() => aggregateBagSnapshots(paymentLines), [paymentLines]);

  /** Bond saved instruments (future) + local placeholder after user confirms payment on file. */
  const savedPaymentMethods = useMemo<ReadonlyArray<{ id: string; label: string }>>(() => {
    if (selectedPaymentMethodId === BOND_PLACEHOLDER_PAYMENT_ID) {
      return [{ id: BOND_PLACEHOLDER_PAYMENT_ID, label: "Payment method on file" }];
    }
    return [];
  }, [selectedPaymentMethodId]);

  const singleLineMemberSavings = useMemo(() => {
    if (!Array.isArray(entitlements) || entitlements.length === 0) return null;
    if (estimatedOriginalSubtotal == null) return null;
    if (!showMemberPricing) return null;
    return Math.max(0, estimatedOriginalSubtotal - subtotal);
  }, [entitlements, estimatedOriginalSubtotal, showMemberPricing, subtotal]);

  /** Merge UI-estimated member savings when carts do not expose `discountAmount`. */
  const bagAggregatesForEstimate = useMemo(() => {
    if (bagAggregates.discountTotal != null) return bagAggregates;
    if (singleLineMemberSavings != null && singleLineMemberSavings > 0) {
      return { ...bagAggregates, discountTotal: singleLineMemberSavings };
    }
    return bagAggregates;
  }, [bagAggregates, singleLineMemberSavings]);

  const feesIncludedInEstimate = useMemo(() => {
    if (bagAggregates.feeTotal != null) return true;
    if (bagPolicyCheckout === "all_submission") return true;
    return selectedPaymentMethodId != null;
  }, [bagAggregates.feeTotal, bagPolicyCheckout, selectedPaymentMethodId]);

  const estimatedAmountDue = useMemo(
    () => estimateAmountDue(bagAggregatesForEstimate, { includeProvisionalFees: feesIncludedInEstimate }),
    [bagAggregatesForEstimate, feesIncludedInEstimate]
  );

  const displayDiscountTotal = useMemo(() => {
    if (bagAggregates.discountTotal != null) return bagAggregates.discountTotal;
    if (singleLineMemberSavings != null && singleLineMemberSavings > 0) return singleLineMemberSavings;
    return null;
  }, [bagAggregates.discountTotal, singleLineMemberSavings]);

  const transactionFeesDisplay = useMemo(() => {
    if (bagAggregates.feeTotal != null) {
      return { kind: "amount" as const, value: bagAggregates.feeTotal };
    }
    if (bagPolicyCheckout === "all_submission") {
      return { kind: "muted" as const, text: "—" };
    }
    if (savedPaymentMethods.length === 0) {
      return { kind: "hint" as const, text: "Add a payment method when available" };
    }
    if (!selectedPaymentMethodId) {
      return { kind: "hint" as const, text: "Select a payment method" };
    }
    return { kind: "muted" as const, text: "—" };
  }, [bagAggregates.feeTotal, bagPolicyCheckout, savedPaymentMethods.length, selectedPaymentMethodId]);

  const panelCls = `consumer-booking ${appearanceClass} cb-checkout-drawer cb-checkout-drawer--wide`.trim();

  if (mode === "bag") {
    const nBookings = bagSnapshots.length;
    return (
      <RightDrawer
        open={open}
        onClose={onClose}
        onBack={showDrawerBack ? handleToolbarBack : undefined}
        ariaLabel="Saved bookings"
        title={title}
        panelClassName={panelCls}
      >
          <div className="cb-checkout-inner cb-checkout-inner--bag">
          <div className="cb-cart-bag-heading">
            <p className="cb-cart-bag-subtitle">In your cart</p>
            {nBookings > 0 ? (
              <span className="cb-cart-bag-count-pill">
                {bagDrawerLineCount} line{bagDrawerLineCount === 1 ? "" : "s"} · {nBookings} booking
                {nBookings === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          {groupedBagWithTotals.length > 1 ? (
            <p className="cb-muted mb-3 text-sm leading-relaxed">
              Bookings are grouped by person. Each section below is for a different family member.
            </p>
          ) : null}
          {bagSnapshots.length > 0 && approvalRequired ? (
            <div
              className="cb-checkout-category-approval-notice mb-3 rounded-md border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-2.5 text-sm leading-snug text-[var(--cb-text)]"
              role="note"
            >
              Rentals and addons are submitted for facility review. Membership charges are handled separately.
            </div>
          ) : null}

          {bagSnapshots.length === 0 ? (
            <p className="cb-muted text-sm">Your cart is empty.</p>
          ) : (
            <>
              <div className="cb-cart-bag-groups">
                {groupedBagWithTotals.map((section, si) => (
                  <section key={`${section.label}-${si}`} className="cb-cart-bag-group">
                    <h4 className="cb-cart-bag-group-title">
                      {groupHeadingForBooking(section.label, si, groupedBagWithTotals.length)}
                    </h4>
                    <ul className="cb-cart-bag-list">
                      {section.items.map(({ index, row }) => {
                        const lines = expandSnapshotForPurchaseList(row, index, {
                          bagPolicy: bagPolicyBag,
                          omitBookingLabelInMeta: true,
                          hideVenueApprovalLineNotes: approvalRequired,
                        });
                        return (
                          <li key={`${row.cart.id}-${index}`} className="cb-cart-bag-line">
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
                      })}
                    </ul>
                  </section>
                ))}
              </div>
              <div className="cb-cart-bag-totals">
                <h3 className="cb-checkout-section-title">Order summary</h3>
                <div className="cb-checkout-total-row">
                  <span>Bookings</span>
                  <span>{formatPrice(bagLineBuckets.bookings, bagCurrency)}</span>
                </div>
                {Math.abs(bagLineBuckets.addons) > BOND_KIND_LINE_MIN ? (
                  <div className="cb-checkout-total-row">
                    <span>Add-ons</span>
                    <span>{formatPrice(bagLineBuckets.addons, bagCurrency)}</span>
                  </div>
                ) : null}
                {Math.abs(bagLineBuckets.memberships) > BOND_KIND_LINE_MIN ? (
                  <div className="cb-checkout-total-row">
                    <span>Memberships</span>
                    <span>{formatPrice(bagLineBuckets.memberships, bagCurrency)}</span>
                  </div>
                ) : null}
                {bagSessionAggregates.discountTotal != null && bagSessionAggregates.discountTotal > 0.0001 ? (
                  <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                    <span>Discount &amp; savings</span>
                    <span>−{formatPrice(bagSessionAggregates.discountTotal, bagCurrency)}</span>
                  </div>
                ) : null}
                <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                  <span>Tax</span>
                  <span>
                    {bagSessionAggregates.taxTotal != null ? formatPrice(bagSessionAggregates.taxTotal, bagCurrency) : "—"}
                  </span>
                </div>
                <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                  <span>Fees</span>
                  <span className="text-[var(--cb-text-muted)] text-right text-xs">
                    {bagSessionAggregates.feeTotal != null
                      ? formatPrice(bagSessionAggregates.feeTotal, bagCurrency)
                      : "—"}
                  </span>
                </div>
                <p className="cb-cart-bag-fees-note mt-1 mb-px text-xs leading-snug text-[var(--cb-text-muted)]">
                  * Transaction fees may apply depending on payment method.
                </p>
                <div className="cb-checkout-total-row cb-checkout-total-row--grand mt-3">
                  <span>Total</span>
                  <strong>
                    {bagEstimatedTotal != null
                      ? formatPrice(bagEstimatedTotal, bagCurrency)
                      : bagSessionAggregates.cartGrandTotal != null
                        ? formatPrice(bagSessionAggregates.cartGrandTotal, bagCurrency)
                        : "—"}
                  </strong>
                </div>
              </div>
              <p className="cb-muted text-xs leading-relaxed">
                Amounts come from Bond when the API returns them on each cart.
              </p>
            </>
          )}

          <div className="cb-cart-bag-footer-actions">
            <button type="button" className="cb-btn-ghost cb-cart-bag-keep" onClick={onClose}>
              Keep shopping
            </button>
            <button
              type="button"
              className="cb-btn-primary"
              disabled={bagSnapshots.length === 0}
              onClick={() => onRequestBagCheckout?.()}
            >
              {bagPolicyBag === "all_pay" ? "Pay →" : "Checkout →"}
            </button>
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
        {step === "addons" || step === "membership" || step === "forms" || step === "confirm" ? (
          <>
            <div className="cb-checkout-progress">
              {onBookingForClick ? (
                <button
                  type="button"
                  className="cb-checkout-booking-for cb-checkout-booking-for--trigger"
                  onClick={onBookingForClick}
                >
                  Booking for <strong>{bookingForLabel}</strong>
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
                  Booking for <strong>{bookingForLabel}</strong>
                  {bookingForBadge ? (
                    <span className="cb-member-badge cb-member-badge--gold ml-2">{bookingForBadge}</span>
                  ) : null}
                </p>
              )}
              <p className="cb-checkout-step-pill">{preCheckoutStepLabel}</p>
              <div className="cb-checkout-progress-bar" aria-hidden>
                {Array.from({ length: totalPreSteps }, (_, i) => (
                  <span
                    key={i}
                    className={currentPreStepNumber > i ? "cb-checkout-progress-fill" : ""}
                  />
                ))}
              </div>
            </div>

            <p className="cb-checkout-product">
              <span className="cb-checkout-product-label">Service</span>
              <span className="cb-checkout-product-name">{productName}</span>
            </p>
          </>
        ) : null}

        {step === "payment" ? (
          <div className="cb-checkout-step">
            {groupedBagWithTotals.length <= 1 ? (
              <p className="cb-checkout-payment-booking-for cb-muted mb-3 text-sm">
                {paymentHeadline.kind === "single" ? (
                  <>
                    Booking for <strong className="text-[var(--cb-text)]">{paymentHeadline.text}</strong>
                  </>
                ) : (
                  <>
                    Bookings for <strong className="text-[var(--cb-text)]">{paymentHeadline.text}</strong>
                  </>
                )}
              </p>
            ) : (
              <p className="cb-muted mb-3 text-sm">
                Purchases are grouped by family member. Review each section before submitting.
              </p>
            )}
            <h3 className="cb-checkout-section-title">Order summary</h3>
            <div className="cb-checkout-payment-purchase-groups mb-4">
              {groupedBagWithTotals.map((section, si) => (
                <section key={`${section.label}-${si}`} className="cb-checkout-payment-group">
                  <h4 className="cb-checkout-payment-group-title">
                    {groupHeadingForBooking(section.label, si, Math.max(1, paymentSectionCount))}
                  </h4>
                  <ul className="cb-checkout-payment-lines">
                    {section.items.flatMap(({ index, row }) =>
                      expandSnapshotForPurchaseList(row, index, {
                        bagPolicy: bagPolicyCheckout,
                        omitBookingLabelInMeta: true,
                        hideVenueApprovalLineNotes: approvalRequired,
                      }).map((line) => (
                        <li key={line.key} className="cb-checkout-payment-line">
                          <div>
                            <span className="cb-checkout-payment-line-title">{line.title}</span>
                            <span className="cb-muted block text-xs">{line.meta}</span>
                            {line.discountNote ? (
                              <span className="cb-checkout-discount-tag">{line.discountNote}</span>
                            ) : null}
                            {line.memberAccessNote ? (
                              <span className="cb-cart-line-member-badge mt-1 inline-block">{line.memberAccessNote}</span>
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
                      Math.max(1, paymentSectionCount)
                    )}
                  </h4>
                  <ul className="cb-checkout-payment-lines">
                    {section.items.flatMap(({ index, row }) =>
                      expandSnapshotForPurchaseList(row, index, {
                        bagPolicy: bagPolicyCheckout,
                        omitBookingLabelInMeta: true,
                        hideVenueApprovalLineNotes: approvalRequired,
                      }).map((line) => (
                        <li key={line.key} className="cb-checkout-payment-line">
                          <div>
                            <span className="cb-checkout-payment-line-title">{line.title}</span>
                            <span className="cb-muted block text-xs">{line.meta}</span>
                            {line.discountNote ? (
                              <span className="cb-checkout-discount-tag">{line.discountNote}</span>
                            ) : null}
                            {line.memberAccessNote ? (
                              <span className="cb-cart-line-member-badge mt-1 inline-block">{line.memberAccessNote}</span>
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
              {displayDiscountTotal != null ? (
                <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                  <span>Discounts &amp; savings</span>
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
                <span>Fees</span>
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

            <h3 className="cb-checkout-section-title">Payment method</h3>
            <div className="cb-checkout-payment-methods mb-4">
              {savedPaymentMethods.length === 0 ? null : (
                <ul className="cb-checkout-payment-method-list">
                  {savedPaymentMethods.map((pm) => (
                    <li key={pm.id}>
                      <label className="cb-checkout-payment-method-option">
                        <input
                          type="radio"
                          name="bond-checkout-pm"
                          checked={selectedPaymentMethodId === pm.id}
                          onChange={() => setSelectedPaymentMethodId(pm.id)}
                        />
                        <span>{pm.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="cb-btn-outline mt-3"
                onClick={() => setSelectedPaymentMethodId(BOND_PLACEHOLDER_PAYMENT_ID)}
                disabled={selectedPaymentMethodId === BOND_PLACEHOLDER_PAYMENT_ID}
              >
                {selectedPaymentMethodId === BOND_PLACEHOLDER_PAYMENT_ID
                  ? "Payment method added"
                  : "Add payment method on file"}
              </button>
            </div>

            {submitBookingRequestMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--cb-error-text)]" role="alert">
                {formatConsumerBookingErrorUnknown(submitBookingRequestMutation.error, {
                  customerLabel: bookingForLabel,
                  orgName: orgDisplayName,
                  productName,
                })}
              </p>
            ) : null}

            <div className="cb-checkout-actions">
              <button type="button" className="cb-btn-ghost" onClick={onClose}>
                Keep shopping
              </button>
              {bagPolicyCheckout === "all_submission" || bagPolicyCheckout === "mixed" ? (
                <button
                  type="button"
                  className="cb-btn-primary"
                  disabled={
                    submitBookingRequestMutation.isPending ||
                    paymentLines.length === 0 ||
                    selectedPaymentMethodId == null ||
                    (pickedSlots.length === 0 && bagSnapshots.length === 0 && !lastCart && !approvalDeferred)
                  }
                  onClick={() => submitBookingRequestMutation.mutate()}
                >
                  {submitBookingRequestMutation.isPending
                    ? "Submitting…"
                    : bagPolicyCheckout === "mixed"
                      ? "Pay & submit"
                      : "Submit request"}
                </button>
              ) : depositAmount != null ? (
                <button
                  type="button"
                  className="cb-btn-primary"
                  onClick={() => setDepositModalOpen(true)}
                >
                  Pay deposit
                </button>
              ) : (
                <button
                  type="button"
                  className="cb-btn-primary"
                  disabled
                  title="Purchase / pay endpoint not yet in public API — wire when Bond exposes it"
                >
                  Pay now
                </button>
              )}
            </div>

            {approvalRequired ? (
              <div
                className="cb-checkout-category-approval-notice mt-4 rounded-md border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 py-2.5 text-sm leading-snug text-[var(--cb-text)]"
                role="note"
              >
                Rentals and addons are submitted for facility review. Membership charges are handled separately.
              </div>
            ) : null}
          </div>
        ) : null}

        {step === "addons" ? (
          <div className="cb-checkout-step">
            {packageAddons.length > 0 ? (
              <p className="cb-checkout-hint">
                {selectedAddonIds.size > 0
                  ? "Your extras from the schedule are listed below. Adjust if needed, then continue."
                  : "Optional extras for this service appear below when available."}
              </p>
            ) : otherRequired.length > 0 ? (
              <p className="cb-checkout-hint">Confirm each required item before continuing.</p>
            ) : null}
            {requiredQuery.isPending ? (
              <p className="cb-muted text-sm">Loading required products…</p>
            ) : membershipOptionsForStep.length > 0 && !membershipSelectionResolved ? (
              <p className="cb-muted mb-3 text-sm">
                A membership is required for this booking. Continue to choose a plan on the next step.
              </p>
            ) : null}
            {!requiredQuery.isPending && otherRequired.length > 0 ? (
              <div className="cb-checkout-required-block">
                <h3 className="cb-checkout-section-title">Required</h3>
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
              <button type="button" className="cb-btn-primary" disabled={!canProceedAddons} onClick={goNextFromAddons}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === "membership" ? (
          <div className="cb-checkout-step">
            {membershipOptionsForStep.length > 0 ? (
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
                disabled={selectedMembershipRootId == null && membershipOptionsForStep.length > 0}
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
              <button type="button" className="cb-btn-primary" disabled={!formsValid} onClick={goNextFromForms}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === "confirm" ? (
          <div className="cb-checkout-step">
            {mode === "checkout" && bagSnapshots.length > 0 ? (
              <p className="cb-checkout-hint cb-checkout-hint--bag mb-3 text-sm leading-relaxed">
                Cart has {bagSnapshots.length} saved booking{bagSnapshots.length === 1 ? "" : "s"}. Pricing here is for
                your new selection only; tap Add to cart to append.
              </p>
            ) : null}
            {!hasBondReceiptLineItems ? (
              <>
                <div className="cb-checkout-summary-cards">
              {confirmSlotGroups.map((group) => {
                const p = group[0]!;
                const firstIdx = pickedSlots.findIndex((s) => s.key === p.key);
                const single = group.length === 1;
                const bondStrike =
                  single && firstIdx === 0 && confirmPreviewStrike != null ? confirmPreviewStrike : null;
                const origFromSchedule =
                  bondStrike == null && single && Array.isArray(entitlements) && entitlements.length > 0
                    ? p.scheduleUnitPrice != null && Number.isFinite(p.scheduleUnitPrice)
                      ? p.scheduleUnitPrice
                      : reverseEntitlementDiscountsToUnitPrice(p.price, entitlements)
                    : null;
                const totalPrice = group.reduce((s, x) => s + x.price, 0);
                const priceAmount = bondStrike != null ? bondStrike.current : single ? p.price : totalPrice;
                const showStrike =
                  bondStrike != null
                    ? bondStrike.original > bondStrike.current + 0.01
                    : origFromSchedule != null && origFromSchedule > p.price + 0.01;
                const strikeAmount = bondStrike?.original ?? origFromSchedule;
                const timeLabel = single ? formatPickedSlotTimeRange(p) : spanLabelForSlotGroup(group);
                return (
                  <div key={group.map((g) => g.key).join("|")} className="cb-checkout-line-card">
                    <div className="cb-checkout-line-title">{productName}</div>
                    {showStrike && entitlementCatalogHint ? (
                      <div className="cb-checkout-line-entitlement mt-0.5 text-xs leading-snug text-[var(--cb-text-muted)]">
                        {entitlementCatalogHint}
                      </div>
                    ) : null}
                    <div className="cb-checkout-line-meta">
                      {p.resourceName}
                      {!single ? ` · ${group.length} consecutive slots` : null}
                    </div>
                    <div className="cb-checkout-line-time">{timeLabel}</div>
                    <div className="cb-checkout-line-price">
                      {showStrike && strikeAmount != null ? (
                        <>
                          <span className="cb-checkout-price-strike">{formatPrice(strikeAmount, currency)}</span>{" "}
                          <strong>{formatPrice(priceAmount, currency)}</strong>
                        </>
                      ) : (
                        <strong>{formatPrice(single ? p.price : totalPrice, currency)}</strong>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {allRequiredFlat.some((r) => requiredSelected.has(r.id)) ||
            [...selectedAddonIds].some((id) => packageAddons.some((p) => p.id === id)) ? (
              <div className="cb-checkout-addons-review">
                {allRequiredFlat.filter(
                  (r) => requiredSelected.has(r.id) && isMembershipRequiredProduct(r as ExtendedRequiredProductNode)
                ).length > 0 ? (
                  <div className="cb-checkout-addon-review-group">
                    <h3 className="cb-checkout-section-title">Membership</h3>
                    <ul className="cb-checkout-addon-review-list">
                      {allRequiredFlat
                        .filter(
                          (r) =>
                            requiredSelected.has(r.id) && isMembershipRequiredProduct(r as ExtendedRequiredProductNode)
                        )
                        .map((r) => (
                          <li key={r.id} className="cb-checkout-addon-review-row">
                            <span>{r.name ?? `Product ${r.id}`}</span>
                            {r.displayPrice ? (
                              <span className="cb-checkout-addon-review-price">
                                {formatPrice(r.displayPrice.amount, r.displayPrice.currency)}
                                {r.displayPrice.label ? (
                                  <span className="cb-checkout-addon-review-freq"> {r.displayPrice.label}</span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="cb-checkout-addon-review-price cb-muted text-xs">—</span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
                {allRequiredFlat.filter(
                  (r) =>
                    requiredSelected.has(r.id) && !isMembershipRequiredProduct(r as ExtendedRequiredProductNode)
                ).length > 0 ? (
                  <div className="cb-checkout-addon-review-group mt-4">
                    <h3 className="cb-checkout-section-title">Other required</h3>
                    <ul className="cb-checkout-addon-review-list">
                      {allRequiredFlat
                        .filter(
                          (r) =>
                            requiredSelected.has(r.id) &&
                            !isMembershipRequiredProduct(r as ExtendedRequiredProductNode)
                        )
                        .map((r) => (
                          <li key={r.id} className="cb-checkout-addon-review-row">
                            <span>{r.name ?? `Product ${r.id}`}</span>
                            {r.displayPrice ? (
                              <span className="cb-checkout-addon-review-price">
                                {formatPrice(r.displayPrice.amount, r.displayPrice.currency)}
                                {r.displayPrice.label ? (
                                  <span className="cb-checkout-addon-review-freq"> {r.displayPrice.label}</span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="cb-checkout-addon-review-price cb-muted text-xs">—</span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
                {[...selectedAddonIds].some((id) => packageAddons.some((p) => p.id === id)) ? (
                  <div className="cb-checkout-addon-review-group mt-4">
                    <h3 className="cb-checkout-section-title">Optional extras</h3>
                {packageAddons.filter((a) => selectedAddonIds.has(a.id) && a.level === "reservation").length > 0 ? (
                  <div className="cb-checkout-addon-review-group">
                    <p className="cb-checkout-addon-review-label">With your reservation</p>
                    <ul className="cb-checkout-addon-review-list">
                      {packageAddons
                        .filter((a) => selectedAddonIds.has(a.id) && a.level === "reservation")
                        .map((a) => {
                          const p = resolveAddonDisplayPrice(a);
                          return (
                            <li key={a.id} className="cb-checkout-addon-review-row">
                              <span>{a.name}</span>
                              {p ? (
                                <span className="cb-checkout-addon-review-price">{formatPrice(p.price, p.currency)}</span>
                              ) : null}
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ) : null}
                {packageAddons.filter((a) => selectedAddonIds.has(a.id) && (a.level === "slot" || a.level === "hour"))
                  .length > 0 ? (
                  <div className="cb-checkout-addon-review-group">
                    <p className="cb-checkout-addon-review-label">For your times</p>
                    <ul className="cb-checkout-addon-review-list">
                      {packageAddons
                        .filter((a) => selectedAddonIds.has(a.id) && (a.level === "slot" || a.level === "hour"))
                        .map((a) => {
                          const eff = getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
                          const p = resolveAddonDisplayPrice(a);
                          return (
                            <li key={a.id} className="cb-checkout-addon-review-slot">
                              <div className="cb-checkout-addon-review-row">
                                <span>{a.name}</span>
                                {p ? (
                                  <span className="cb-checkout-addon-review-price">
                                    {formatPrice(p.price, p.currency)}
                                    {a.level === "hour" ? " / hr" : " / slot"}
                                  </span>
                                ) : null}
                              </div>
                              <ul className="cb-checkout-addon-review-slots">
                                {pickedSlots
                                  .filter((s) => eff.has(s.key))
                                  .map((s) => (
                                    <li key={s.key} className="cb-muted text-sm">
                                      {formatPickedSlotTimeRange(s)} · {s.resourceName}
                                    </li>
                                  ))}
                              </ul>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
              </>
            ) : null}

            {hasBondReceiptLineItems ? (
              <div className="cb-checkout-receipt-sheet">
                <p className="cb-checkout-receipt-kicker">Line items</p>
                <ul className="cb-checkout-receipt-line-list">
                  {previewReceiptLines.map((line) => (
                    <li key={line.id} className="cb-checkout-receipt-line-item">
                      <div className="cb-checkout-receipt-line-item-main">
                        <span className="cb-checkout-receipt-line-title">{line.title}</span>
                        {line.discountNote ? (
                          <span className="cb-checkout-discount-tag">{line.discountNote}</span>
                        ) : line.strikeAmount != null &&
                          line.strikeAmount > line.amount + 0.005 &&
                          entitlementCatalogHint ? (
                          <span className="cb-checkout-receipt-line-entitlement mt-0.5 block text-xs leading-snug text-[var(--cb-text-muted)]">
                            {entitlementCatalogHint}
                          </span>
                        ) : null}
                        {line.badge ? (
                          <span className="cb-checkout-receipt-box-badge">{line.badge}</span>
                        ) : null}
                      </div>
                      <div className="cb-checkout-receipt-line-item-price">
                        {line.strikeAmount != null && line.strikeAmount > line.amount + 0.005 ? (
                          <>
                            <span className="cb-checkout-price-strike">
                              {formatPrice(line.strikeAmount, currency)}
                            </span>{" "}
                            <strong>{formatPrice(line.amount, currency)}</strong>
                          </>
                        ) : (
                          <strong>{formatPrice(line.amount, currency)}</strong>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {showBondPricingFooter && previewBondPricing != null ? (
              <div className="cb-checkout-bond-receipt" aria-label="Cart totals from Bond">
                <p className="cb-muted mb-2 text-xs font-medium uppercase tracking-wide">Estimate from Bond</p>
                <ul className="cb-checkout-bond-receipt-lines">
                  {showBondSplitRows && previewKindBreakdown != null ? (
                    <>
                      {Math.abs(previewKindBreakdown.rentals) > BOND_KIND_LINE_MIN ? (
                        <li className="cb-checkout-bond-receipt-line cb-checkout-bond-receipt-line--default">
                          <span className="cb-checkout-bond-receipt-line-text">
                            <span className="cb-checkout-bond-receipt-line-label">Rentals</span>
                          </span>
                          <span>{formatPrice(previewKindBreakdown.rentals, previewBondPricing.currency)}</span>
                        </li>
                      ) : null}
                      {Math.abs(previewKindBreakdown.memberships) > BOND_KIND_LINE_MIN ? (
                        <li className="cb-checkout-bond-receipt-line cb-checkout-bond-receipt-line--default">
                          <span className="cb-checkout-bond-receipt-line-text">
                            <span className="cb-checkout-bond-receipt-line-label">Memberships</span>
                          </span>
                          <span>{formatPrice(previewKindBreakdown.memberships, previewBondPricing.currency)}</span>
                        </li>
                      ) : null}
                      {Math.abs(previewKindBreakdown.addons) > BOND_KIND_LINE_MIN ? (
                        <li className="cb-checkout-bond-receipt-line cb-checkout-bond-receipt-line--default">
                          <span className="cb-checkout-bond-receipt-line-text">
                            <span className="cb-checkout-bond-receipt-line-label">Add-ons</span>
                          </span>
                          <span>{formatPrice(previewKindBreakdown.addons, previewBondPricing.currency)}</span>
                        </li>
                      ) : null}
                    </>
                  ) : null}
                  {bondPricingRowsFiltered.map((row, idx) => (
                    <li
                      key={`${row.label}-${idx}`}
                      className={`cb-checkout-bond-receipt-line cb-checkout-bond-receipt-line--${row.variant}`}
                    >
                      <span className="cb-checkout-bond-receipt-line-text">
                        <span className="cb-checkout-bond-receipt-line-label">{row.label}</span>
                        {row.detail ? (
                          <span className="cb-checkout-bond-receipt-line-detail">{row.detail}</span>
                        ) : null}
                      </span>
                      <span>
                        {row.amount != null
                          ? row.variant === "discount"
                            ? `−${formatPrice(row.amount, previewBondPricing.currency)}`
                            : formatPrice(row.amount, previewBondPricing.currency)
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {cannotMergeSessionCart ? (
              <p className="mb-3 text-sm text-[var(--cb-error-text)]" role="alert">
                We couldn&apos;t read a cart id from your saved bookings, so another reservation can&apos;t be merged
                yet. Clear the cart and try again, or refresh the page.
              </p>
            ) : null}

            {awaitingConfirmBondCart ? (
              <div className="cb-checkout-bond-receipt mb-4" aria-busy="true" aria-live="polite">
                <p className="cb-muted text-sm">Loading pricing…</p>
              </div>
            ) : confirmBondCartQuery.isError && confirmBondCartQuery.data == null ? (
              <div className="cb-checkout-bond-receipt cb-checkout-bond-receipt--empty mb-4" role="alert">
                <p className="text-sm text-[var(--cb-error-text)] mb-2">
                  {confirmBondCartErrorText ?? "Couldn&apos;t load pricing."}
                </p>
                <button type="button" className="cb-btn-outline text-sm" onClick={() => confirmBondCartQuery.refetch()}>
                  Retry
                </button>
              </div>
            ) : confirmBondCartQuery.isError && confirmBondCartQuery.data != null ? (
              <div
                className="cb-checkout-bond-receipt cb-checkout-bond-receipt--empty mb-4 border border-[var(--cb-border)]"
                role="status"
              >
                <p className="text-sm text-[var(--cb-text-muted)] mb-2">
                  {confirmBondCartErrorText ?? "Pricing may be out of date. Retry to refresh."}
                </p>
                <button type="button" className="cb-btn-outline text-sm" onClick={() => confirmBondCartQuery.refetch()}>
                  Refresh pricing
                </button>
              </div>
            ) : null}

            {!awaitingConfirmBondCart && !showBondPricingFooter ? (
              <div className="cb-checkout-totals">
                <p className="cb-muted mb-2 text-xs font-medium uppercase tracking-wide">Estimate only</p>
                {showMemberPricing && estimatedOriginalSubtotal != null ? (
                  <>
                    <div className="cb-checkout-total-row">
                      <span>Original rental</span>
                      <span>{formatPrice(estimatedOriginalSubtotal, currency)}</span>
                    </div>
                    <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                      <span>Member savings</span>
                      <span>
                        −{formatPrice(Math.max(0, estimatedOriginalSubtotal - subtotal), currency)}
                      </span>
                    </div>
                  </>
                ) : null}
                <div className="cb-checkout-total-row">
                  <span>Rentals</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                {membershipRequiredTotal > 0 ? (
                  <div className="cb-checkout-total-row">
                    <span>Memberships</span>
                    <span>{formatPrice(membershipRequiredTotal, currency)}</span>
                  </div>
                ) : null}
                {optionalAddonsConfirmTotal + nonMembershipRequiredTotal > 0 ? (
                  <div className="cb-checkout-total-row">
                    <span>Extras</span>
                    <span>{formatPrice(optionalAddonsConfirmTotal + nonMembershipRequiredTotal, currency)}</span>
                  </div>
                ) : null}
                <div className="cb-checkout-total-row cb-checkout-total-row--grand">
                  <span>Total</span>
                  <strong>{formatPrice(confirmGrandTotal, currency)}</strong>
                </div>
              </div>
            ) : null}

            <div className="cb-checkout-actions">
              <button
                type="button"
                className="cb-btn-ghost"
                onClick={() => {
                  const p = previousStepInCheckoutFlow("confirm", checkoutFlowFlags);
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
                  cannotMergeSessionCart ||
                  awaitingConfirmBondCart ||
                  (!approvalRequired &&
                    confirmBondCartQuery.data == null &&
                    (confirmBondCartQuery.isPending ||
                      confirmBondCartQuery.isFetching ||
                      confirmBondCartQuery.isError))
                }
                onClick={handleConfirmAddToCart}
              >
                {awaitingConfirmBondCart
                  ? "Preparing pricing…"
                  : confirmBondCartQuery.isFetching && confirmBondCartQuery.data != null
                    ? "Updating pricing…"
                    : "Add to cart"}
              </button>
            </div>
          </div>
        ) : null}

      </div>

      <ModalShell
        open={depositModalOpen && depositAmount != null}
        title="Pay deposit or in full"
        onClose={() => setDepositModalOpen(false)}
        panelClassName="cb-modal-panel--checkout-deposit"
      >
        <div className="cb-checkout-deposit-modal">
          <p className="cb-muted text-sm leading-relaxed">
            Choose how much to pay today. Payment processing will connect here next.
          </p>
          <div className="cb-checkout-totals mt-4">
            <div className="cb-checkout-total-row">
              <span>Deposit due now</span>
              <strong>
                {depositAmount != null ? formatPrice(depositAmount, bagCurrency) : "—"}
              </strong>
            </div>
            <div className="cb-checkout-total-row cb-checkout-total-row--muted">
              <span>Full balance</span>
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
              title="Payment gateway coming next"
            >
              Pay deposit
              {depositAmount != null ? ` (${formatPrice(depositAmount, bagCurrency)})` : ""}
            </button>
            <button
              type="button"
              className="cb-btn-outline w-full"
              disabled
              title="Payment gateway coming next"
            >
              Pay in full
              {estimatedAmountDue != null
                ? ` (${formatPrice(estimatedAmountDue, bagCurrency)})`
                : bagGrandTotal != null
                  ? ` (${formatPrice(bagGrandTotal, bagCurrency)})`
                  : ""}
            </button>
          </div>
        </div>
      </ModalShell>
    </RightDrawer>
  );
}
