"use client";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModalShell } from "@/components/booking/ModalShell";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { formatConsumerBookingError } from "@/lib/bond-errors";
import { BondBffError } from "@/lib/bond-json";
import {
  fetchCheckoutQuestionnaires,
  fetchPublicQuestionnaireById,
  fetchUserRequiredProducts,
  postOnlineBookingCreate,
} from "@/lib/online-booking-user-api";
import { buildOnlineBookingCreateBody } from "@/lib/online-booking-create-body";
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
  parseExtendedRequiredProductsList,
  partitionMembershipVsOtherRequired,
  primaryListPrice,
  type ExtendedRequiredProductNode,
} from "@/lib/required-products-extended";
import { parseRequiredProductsResponse, type RequiredProductRow } from "@/lib/required-products-parse";
import { formatPickedSlotTimeRange } from "./booking-slot-labels";
import { BookingAddonPanel, getEffectiveAddonSlotKeys, type AddonSlotTargeting } from "./BookingAddonPanel";
import { CheckoutQuestionnairePanels } from "./CheckoutQuestionnairePanels";
import type { ExtendedProductDto, OrganizationCartDto } from "@/types/online-booking";
import type { PackageAddonLine } from "@/lib/product-package-addons";
import { resolveAddonDisplayPrice } from "@/lib/product-package-addons";
import type { BondUserDto } from "@/lib/bond-user-types";
import { slotDurationMinutes, type PickedSlot } from "@/lib/slot-selection";
import {
  aggregateBagSnapshots,
  aggregateBagSnapshotsByLabel,
  estimateAmountDue,
  getBondCartConfirmSummaryLines,
  getBondCartPrimaryLineStrike,
  getBondCartPricingDisplayRows,
} from "@/lib/checkout-bag-totals";
import { reverseEntitlementDiscountsToUnitPrice } from "@/lib/entitlement-discount";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import { countSessionCartLineItems, expandSnapshotForPurchaseList } from "@/lib/cart-purchase-lines";

export type CheckoutStep = "addons" | "membership" | "forms" | "confirm" | "cart" | "payment";

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
  /** After cart is created, user can add another booking (clears slot selection in parent). */
  onAddAnotherBooking?: () => void;
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
  onAddAnotherBooking,
  mode = "checkout",
  bagSnapshots = [],
  onRemoveBagLine,
  approvalRequired = false,
  onCheckoutComplete,
  orgDisplayName,
  onBookingForClick,
}: Props) {
  const [step, setStep] = useState<CheckoutStep>("addons");
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
  const formsPrefillDone = useRef(false);

  const currency = product?.prices[0]?.currency ?? "USD";

  useEffect(() => {
    if (!open) return;
    if (mode === "bag") return;
    setStep("addons");
    setAnswers({});
    setRequiredSelected(new Set());
    setLastCart(null);
    setApprovalDeferred(false);
    setDepositModalOpen(false);
    setSelectedMembershipRootId(null);
    setMembershipSelectionResolved(false);
    setSelectedPaymentMethodId(null);
    formsPrefillDone.current = false;
  }, [open, productId, mode]);

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

  /** Bond only returns memberships the user still needs; if they already qualify, the list is empty (no gate). */
  const requiredQuery = useQuery({
    queryKey: ["bond", "requiredProducts", orgId, productId, userId],
    queryFn: () => fetchUserRequiredProducts(orgId, productId, userId),
    enabled:
      mode === "checkout" &&
      open &&
      step !== "cart" &&
      step !== "payment" &&
      (step === "addons" || step === "membership" || step === "forms" || step === "confirm"),
  });

  const extendedRequiredList = useMemo(
    () => parseExtendedRequiredProductsList(requiredQuery.data),
    [requiredQuery.data]
  );

  const { membershipOptions, otherRequired } = useMemo(() => {
    if (extendedRequiredList.length > 0) {
      return partitionMembershipVsOtherRequired(extendedRequiredList);
    }
    const legacy = parseRequiredProductsResponse(requiredQuery.data);
    return {
      membershipOptions: [] as ExtendedRequiredProductNode[],
      otherRequired: legacy.map(
        (r) =>
          ({
            id: r.id,
            name: r.name,
            productType: r.productType,
          }) as ExtendedRequiredProductNode
      ),
    };
  }, [extendedRequiredList, requiredQuery.data]);

  /** Flat list for confirm-step labels (includes nested required product ids + catalog prices when Bond sends them). */
  const allRequiredFlat: RequiredProductRow[] = useMemo(() => {
    const out: RequiredProductRow[] = [];
    function walk(nodes: ExtendedRequiredProductNode[]) {
      for (const n of nodes) {
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
    return parseRequiredProductsResponse(requiredQuery.data);
  }, [extendedRequiredList, requiredQuery.data]);

  useEffect(() => {
    if (step !== "membership" || membershipOptions.length !== 1) return;
    if (selectedMembershipRootId == null) {
      setSelectedMembershipRootId(membershipOptions[0]!.id);
    }
  }, [step, membershipOptions, selectedMembershipRootId]);

  const publicQuestionnaireQueries = useQueries({
    queries: questionnaireIds.map((qid) => ({
      queryKey: ["bond", "questionnaire", orgId, qid],
      queryFn: () => fetchPublicQuestionnaireById(orgId, qid),
      enabled:
        mode === "checkout" &&
        open &&
        questionnaireIds.length > 0 &&
        step !== "cart" &&
        step !== "payment" &&
        (step === "addons" || step === "forms"),
    })),
  });

  const checkoutQuestionnairesQuery = useQuery({
    queryKey: ["bond", "checkoutQuestionnaires", orgId, userId, questionnaireIds],
    queryFn: () => fetchCheckoutQuestionnaires(orgId, userId, questionnaireIds),
    enabled:
      mode === "checkout" &&
      open &&
      questionnaireIds.length > 0 &&
      step !== "cart" &&
      step !== "payment" &&
      (step === "addons" || step === "forms"),
  });

  const hasMembershipStep = membershipOptions.length > 0;
  const hasFormsStep = questionnaireIds.length > 0;
  const totalPreSteps = 2 + (hasMembershipStep ? 1 : 0) + (hasFormsStep ? 1 : 0);

  const currentPreStepNumber = useMemo(() => {
    if (step === "cart" || step === "payment") return 0;
    if (step === "addons") return 1;
    if (step === "membership") return 2;
    if (step === "forms") return 2 + (hasMembershipStep ? 1 : 0);
    if (step === "confirm") return totalPreSteps;
    return 1;
  }, [step, hasMembershipStep, totalPreSteps]);

  const preCheckoutStepLabel = useMemo(() => {
    if (step === "cart" || step === "payment") return "";
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
    if (mergedForms.length === 0 || formsPrefillDone.current) return;
    formsPrefillDone.current = true;
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

  const buildCreatePayload = useCallback((): Record<string, unknown> => {
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

    const addonProductIds = [...new Set([...selectedAddonIds, ...requiredSelected])];

    return buildOnlineBookingCreateBody({
      userId,
      portalId,
      categoryId,
      activity,
      facilityId,
      productId,
      slots: pickedSlots,
      addonProductIds: addonProductIds.length > 0 ? addonProductIds : undefined,
      answers:
        perQuestion.length > 0
          ? [
              {
                userId,
                answers: perQuestion,
              },
            ]
          : undefined,
    });
  }, [
    answers,
    selectedAddonIds,
    requiredSelected,
    userId,
    portalId,
    categoryId,
    activity,
    facilityId,
    productId,
    pickedSlots,
  ]);

  /** Same payload as Add to cart — used to preview pricing on the booking summary via `POST …/online-booking/create`. */
  const previewPayload = useMemo(() => buildCreatePayload(), [buildCreatePayload]);

  const bookingPreviewQuery = useQuery({
    queryKey: ["bond", "bookingPreview", orgId, previewPayload],
    queryFn: () => postOnlineBookingCreate(orgId, previewPayload),
    enabled: mode === "checkout" && open && step === "confirm" && pickedSlots.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const confirmBondSummary = useMemo(
    () =>
      bookingPreviewQuery.data != null ? getBondCartConfirmSummaryLines(bookingPreviewQuery.data) : null,
    [bookingPreviewQuery.data]
  );

  const confirmPreviewStrike = useMemo(
    () => (bookingPreviewQuery.data != null ? getBondCartPrimaryLineStrike(bookingPreviewQuery.data) : null),
    [bookingPreviewQuery.data]
  );

  const createMutation = useMutation({
    mutationFn: async () => postOnlineBookingCreate(orgId, buildCreatePayload()),
    onSuccess: (cart) => {
      setLastCart(cart);
      onSuccess(cart);
      setStep("cart");
    },
  });

  const handleConfirmAddToCart = useCallback(() => {
    if (approvalRequired) {
      setLastCart(bookingPreviewQuery.data ?? null);
      setApprovalDeferred(true);
      setStep("cart");
      return;
    }
    const cart = bookingPreviewQuery.data;
    if (cart) {
      setLastCart(cart);
      onSuccess(cart);
      setStep("cart");
      return;
    }
    createMutation.mutate();
  }, [approvalRequired, bookingPreviewQuery.data, onSuccess, createMutation]);

  const submitBookingRequestMutation = useMutation({
    mutationFn: async () => {
      if (lastCart != null) return lastCart;
      return postOnlineBookingCreate(orgId, buildCreatePayload());
    },
    onSuccess: () => {
      onCheckoutComplete?.();
      onClose();
    },
  });

  /** Only real mutations affect the bottom bar — preview `POST create` runs inside the drawer only. */
  useEffect(() => {
    onSubmittingChange?.(createMutation.isPending || submitBookingRequestMutation.isPending);
  }, [createMutation.isPending, submitBookingRequestMutation.isPending, onSubmittingChange]);

  /** Non-membership required rows only — membership is handled on the next step when needed. */
  const canProceedAddons = useMemo(() => {
    return otherRequired.length === 0 || otherRequired.every((r) => requiredSelected.has(r.id));
  }, [otherRequired, requiredSelected]);

  const packageAddonsVisible = addonsExpanded ? packageAddons : packageAddons.slice(0, ADDONS_PAGE);

  const goNextFromAddons = useCallback(() => {
    if (!canProceedAddons) return;
    if (membershipOptions.length > 0 && !membershipSelectionResolved) {
      setStep("membership");
      return;
    }
    if (questionnaireIds.length > 0) setStep("forms");
    else setStep("confirm");
  }, [canProceedAddons, membershipOptions.length, membershipSelectionResolved, questionnaireIds.length]);

  const handleMembershipConfirm = useCallback(() => {
    if (membershipOptions.length === 0) {
      setMembershipSelectionResolved(true);
      if (questionnaireIds.length > 0) setStep("forms");
      else setStep("confirm");
      return;
    }
    const root = membershipOptions.find((o) => o.id === selectedMembershipRootId);
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
  }, [membershipOptions, selectedMembershipRootId, questionnaireIds.length]);

  const goNextFromForms = useCallback(() => {
    if (!formsValid) return;
    setStep("confirm");
  }, [formsValid]);

  const title = useMemo(() => {
    if (mode === "bag") return "Your Cart";
    switch (step) {
      case "addons":
        return "Add-ons";
      case "membership":
        return "Membership";
      case "forms":
        return "Additional Information";
      case "confirm":
        return "Booking Summary";
      case "cart":
        return "Added to Cart!";
      case "payment":
        return "Checkout";
    }
  }, [mode, step]);

  const handleToolbarBack = useCallback(() => {
    if (mode === "bag") {
      onClose();
      return;
    }
    if (step === "forms") {
      setStep(membershipOptions.length > 0 ? "membership" : "addons");
      return;
    }
    if (step === "confirm") {
      setStep(
        questionnaireIds.length > 0 ? "forms" : membershipOptions.length > 0 ? "membership" : "addons"
      );
      return;
    }
    if (step === "membership") {
      setStep("addons");
      return;
    }
    if (step === "payment") {
      setStep("cart");
      return;
    }
    if (step === "cart") {
      setStep("confirm");
      return;
    }
    onClose();
  }, [mode, onClose, step, questionnaireIds.length, membershipOptions.length]);

  const showDrawerBack =
    mode === "bag" ||
    step === "addons" ||
    step === "membership" ||
    step === "forms" ||
    step === "confirm" ||
    step === "cart" ||
    step === "payment";

  const subtotal = useMemo(
    () => pickedSlots.reduce((s, p) => s + p.price, 0),
    [pickedSlots]
  );

  const entitlements = product?.entitlementDiscounts;

  const estimatedOriginalSubtotal = useMemo(() => {
    if (!Array.isArray(entitlements) || entitlements.length === 0) return null;
    return pickedSlots.reduce((s, p) => s + reverseEntitlementDiscountsToUnitPrice(p.price, entitlements), 0);
  }, [pickedSlots, entitlements]);

  const showMemberPricing = useMemo(() => {
    if (!Array.isArray(entitlements) || entitlements.length === 0) return false;
    if (estimatedOriginalSubtotal == null) return false;
    return estimatedOriginalSubtotal > subtotal + 0.01;
  }, [entitlements, estimatedOriginalSubtotal, subtotal]);

  const slotKeySet = useMemo(() => new Set(pickedSlots.map((s) => s.key)), [pickedSlots]);

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

  /** Optional package add-ons selected on the add-ons step (matches card math). */
  const optionalAddonsConfirmTotal = useMemo(() => {
    let sum = 0;
    for (const a of packageAddons) {
      if (!selectedAddonIds.has(a.id)) continue;
      const p = resolveAddonDisplayPrice(a);
      if (!p || p.currency !== currency) continue;
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
    const pushSynthetic = (lineName: string, amount: number, cur: string) => {
      rows.push({
        cart: {
          id: 0,
          organizationId: orgId,
          subtotal: amount,
          price: amount,
          currency: cur,
        } as OrganizationCartDto,
        productName: lineName,
      });
    };

    if (approvalDeferred && approvalRequired && pickedSlots.length > 0 && !lastCart) {
      pushSynthetic(productName, subtotal, currency);
      for (const r of allRequiredFlat) {
        if (!requiredSelected.has(r.id) || !r.displayPrice) continue;
        if (r.displayPrice.currency !== currency) continue;
        pushSynthetic(r.name ?? `Product ${r.id}`, r.displayPrice.amount, r.displayPrice.currency);
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
        if (amt > 0) pushSynthetic(a.name, amt, currency);
      }
    }
    if (rows.length > 0) return rows;
    if (lastCart) return [{ cart: lastCart, productName }];
    return [];
  }, [
    bagSnapshots,
    lastCart,
    productName,
    approvalDeferred,
    approvalRequired,
    pickedSlots,
    orgId,
    subtotal,
    currency,
    allRequiredFlat,
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

  const bagDrawerLineCount = useMemo(() => countSessionCartLineItems(bagSnapshots), [bagSnapshots]);

  /** Bond cart fields only (no client-side line math). */
  const bagSessionAggregates = useMemo(() => aggregateBagSnapshots(bagSnapshots), [bagSnapshots]);

  const bagEstimatedTotal = useMemo(
    () => estimateAmountDue(bagSessionAggregates, { includeProvisionalFees: false }),
    [bagSessionAggregates]
  );

  const bagAggregates = useMemo(() => aggregateBagSnapshots(paymentLines), [paymentLines]);

  /** Empty until Bond exposes saved payment instruments for the logged-in user. */
  const savedPaymentMethods = useMemo<ReadonlyArray<{ id: string; label: string }>>(() => [], []);

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
    if (approvalRequired) return true;
    return selectedPaymentMethodId != null;
  }, [bagAggregates.feeTotal, approvalRequired, selectedPaymentMethodId]);

  const estimatedAmountDue = useMemo(
    () => estimateAmountDue(bagAggregatesForEstimate, { includeProvisionalFees: feesIncludedInEstimate }),
    [bagAggregatesForEstimate, feesIncludedInEstimate]
  );

  /** Bond-returned pricing for the cart row just created (post–`POST create`). */
  const lastCartBondPricing = useMemo(
    () => (lastCart != null ? getBondCartPricingDisplayRows(lastCart) : null),
    [lastCart]
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
    if (approvalRequired) {
      return { kind: "muted" as const, text: "—" };
    }
    if (savedPaymentMethods.length === 0) {
      return { kind: "hint" as const, text: "Add a payment method when available" };
    }
    if (!selectedPaymentMethodId) {
      return { kind: "hint" as const, text: "Select a payment method" };
    }
    return { kind: "muted" as const, text: "—" };
  }, [bagAggregates.feeTotal, approvalRequired, savedPaymentMethods.length, selectedPaymentMethodId]);

  const panelCls = `consumer-booking ${appearanceClass} cb-checkout-drawer cb-checkout-drawer--wide`.trim();

  if (mode === "bag") {
    const nBookings = bagSnapshots.length;
    return (
      <RightDrawer
        open={open}
        onClose={onClose}
        onBack={showDrawerBack ? handleToolbarBack : undefined}
        ariaLabel="Your cart"
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

          {bagSnapshots.length === 0 ? (
            <p className="cb-muted text-sm">Your cart is empty.</p>
          ) : (
            <>
              <div className="cb-cart-bag-groups">
                {groupedBagWithTotals.map((section) => (
                  <section key={section.label} className="cb-cart-bag-group">
                    <h4 className="cb-cart-bag-group-title">{section.label}</h4>
                    <ul className="cb-cart-bag-list">
                      {section.items.map(({ index, row }) => {
                        const lines = expandSnapshotForPurchaseList(row, index);
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
                                </div>
                                <div className="cb-cart-bag-line-actions">
                                  {line.amount != null ? (
                                    <span className="cb-cart-bag-line-price">{formatPrice(line.amount, bagCurrency)}</span>
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
                    <div className="cb-cart-bag-group-totals">
                      <div className="cb-checkout-total-row">
                        <span>Subtotal</span>
                        <span>
                          {section.totals.lineSubtotal != null
                            ? formatPrice(section.totals.lineSubtotal, bagCurrency)
                            : "—"}
                        </span>
                      </div>
                      {section.totals.discountTotal != null ? (
                        <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                          <span>Savings</span>
                          <span>−{formatPrice(section.totals.discountTotal, bagCurrency)}</span>
                        </div>
                      ) : null}
                      <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                        <span>Tax</span>
                        <span>
                          {section.totals.taxTotal != null ? formatPrice(section.totals.taxTotal, bagCurrency) : "—"}
                        </span>
                      </div>
                      <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                        <span>Fees</span>
                        <span className="text-[var(--cb-text-muted)] text-xs">
                          {section.totals.feeTotal != null
                            ? formatPrice(section.totals.feeTotal, bagCurrency)
                            : "Depends on payment method"}
                        </span>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
              <div className="cb-cart-bag-totals">
                <h3 className="cb-checkout-section-title">Order summary</h3>
                <div className="cb-checkout-total-row">
                  <span>Subtotal</span>
                  <span>
                    {bagSessionAggregates.lineSubtotal != null
                      ? formatPrice(bagSessionAggregates.lineSubtotal, bagCurrency)
                      : bagGrandTotal != null
                        ? formatPrice(bagGrandTotal, bagCurrency)
                        : "—"}
                  </span>
                </div>
                {bagSessionAggregates.discountTotal != null ? (
                  <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                    <span>Entitlements and savings</span>
                    <span>−{formatPrice(bagSessionAggregates.discountTotal, bagCurrency)}</span>
                  </div>
                ) : null}
                <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                  <span>Estimated tax</span>
                  <span>
                    {bagSessionAggregates.taxTotal != null ? formatPrice(bagSessionAggregates.taxTotal, bagCurrency) : "—"}
                  </span>
                </div>
                <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                  <span>Transaction fees</span>
                  <span className="text-[var(--cb-text-muted)] text-xs">
                    {bagSessionAggregates.feeTotal != null
                      ? formatPrice(bagSessionAggregates.feeTotal, bagCurrency)
                      : "Depends on payment method at checkout"}
                  </span>
                </div>
                <div className="cb-checkout-total-row cb-checkout-total-row--grand">
                  <span>Estimated total</span>
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
                Amounts come from Bond when the API returns them on each cart. Tax and fees finalize when you add a
                payment method.
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
              title="Payment integration coming next"
            >
              Checkout →
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
            <h3 className="cb-checkout-section-title">Purchases</h3>
            <div className="cb-checkout-payment-purchase-groups mb-4">
              {groupedBagWithTotals.map((section) => (
                <section key={section.label} className="cb-checkout-payment-group">
                  <h4 className="cb-checkout-payment-group-title">{section.label}</h4>
                  <ul className="cb-checkout-payment-lines">
                    {section.items.flatMap(({ index, row }) =>
                      expandSnapshotForPurchaseList(row, index).map((line) => (
                        <li key={line.key} className="cb-checkout-payment-line">
                          <div>
                            <span className="cb-checkout-payment-line-title">{line.title}</span>
                            <span className="cb-muted block text-xs">{line.meta}</span>
                          </div>
                          <span className="cb-checkout-payment-line-price">
                            {line.amount != null ? formatPrice(line.amount, bagCurrency) : "—"}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="cb-checkout-payment-group-summary">
                    <div className="cb-checkout-total-row">
                      <span>Subtotal</span>
                      <span>
                        {section.totals.lineSubtotal != null
                          ? formatPrice(section.totals.lineSubtotal, bagCurrency)
                          : "—"}
                      </span>
                    </div>
                    {section.totals.discountTotal != null ? (
                      <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                        <span>Savings</span>
                        <span>−{formatPrice(section.totals.discountTotal, bagCurrency)}</span>
                      </div>
                    ) : null}
                    <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                      <span>Tax</span>
                      <span>
                        {section.totals.taxTotal != null ? formatPrice(section.totals.taxTotal, bagCurrency) : "—"}
                      </span>
                    </div>
                    <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                      <span>Fees</span>
                      <span className="text-[var(--cb-text-muted)] text-xs">
                        {section.totals.feeTotal != null
                          ? formatPrice(section.totals.feeTotal, bagCurrency)
                          : "Depends on payment method"}
                      </span>
                    </div>
                  </div>
                </section>
              ))}
              {tailExtraPaymentLines.length > 0 ? (
                <section className="cb-checkout-payment-group">
                  <h4 className="cb-checkout-payment-group-title">Pending submission</h4>
                  <ul className="cb-checkout-payment-lines">
                    {tailExtraPaymentLines.flatMap((row, i) => {
                      const idx = bagSnapshots.length + i;
                      return expandSnapshotForPurchaseList(row, idx).map((line) => (
                        <li key={line.key} className="cb-checkout-payment-line">
                          <div>
                            <span className="cb-checkout-payment-line-title">{line.title}</span>
                            <span className="cb-muted block text-xs">{line.meta}</span>
                          </div>
                          <span className="cb-checkout-payment-line-price">
                            {line.amount != null ? formatPrice(line.amount, bagCurrency) : "—"}
                          </span>
                        </li>
                      ));
                    })}
                  </ul>
                </section>
              ) : null}
            </div>

            <h3 className="cb-checkout-section-title">Payment method</h3>
            <div className="cb-checkout-payment-methods mb-4">
              {savedPaymentMethods.length === 0 ? (
                <p className="cb-muted text-sm cb-checkout-payment-methods-placeholder">
                  No saved payment methods yet.
                </p>
              ) : (
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
                disabled
                title="Requires payment-methods API from Bond"
              >
                Add new payment method
              </button>
            </div>

            <h3 className="cb-checkout-section-title">Summary</h3>
            <div className="cb-checkout-totals">
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
                  <span>Entitlements and savings</span>
                  <span>−{formatPrice(displayDiscountTotal, bagCurrency)}</span>
                </div>
              ) : null}
              <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                <span>Estimated tax</span>
                <span>
                  {bagAggregates.taxTotal != null
                    ? formatPrice(bagAggregates.taxTotal, bagCurrency)
                    : "—"}
                </span>
              </div>
              <div className="cb-checkout-total-row cb-checkout-total-row--muted">
                <span>Transaction fees</span>
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
                <span>Estimated total</span>
                <strong>
                  {estimatedAmountDue != null
                    ? formatPrice(estimatedAmountDue, bagCurrency)
                    : bagAggregates.cartGrandTotal != null
                      ? formatPrice(bagAggregates.cartGrandTotal, bagCurrency)
                      : "—"}
                </strong>
              </div>
            </div>

            {submitBookingRequestMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--cb-error-text)]" role="alert">
                {submitBookingRequestMutation.error instanceof BondBffError
                  ? formatConsumerBookingError(submitBookingRequestMutation.error, {
                      customerLabel: bookingForLabel,
                      orgName: orgDisplayName,
                    })
                  : submitBookingRequestMutation.error instanceof Error
                    ? submitBookingRequestMutation.error.message
                    : "Could not submit request."}
              </p>
            ) : null}

            <div className="cb-checkout-actions">
              <button type="button" className="cb-btn-ghost" onClick={() => setStep("cart")}>
                Back
              </button>
              {approvalRequired ? (
                <button
                  type="button"
                  className="cb-btn-primary"
                  disabled={
                    submitBookingRequestMutation.isPending ||
                    paymentLines.length === 0 ||
                    pickedSlots.length === 0
                  }
                  onClick={() => submitBookingRequestMutation.mutate()}
                >
                  {submitBookingRequestMutation.isPending ? "Submitting…" : "Submit request"}
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
          </div>
        ) : null}

        {step === "addons" ? (
          <div className="cb-checkout-step">
            <p className="cb-checkout-hint">
              {selectedAddonIds.size > 0
                ? "Your extras from the schedule are kept below. Adjust if needed, then continue."
                : "Optional add-ons for this service. Required items from Bond are listed first—confirm each before continuing."}
            </p>
            {requiredQuery.isPending ? (
              <p className="cb-muted text-sm">Loading required products…</p>
            ) : membershipOptions.length > 0 && !membershipSelectionResolved ? (
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
            {membershipOptions.length > 0 ? (
              <MembershipRequiredPanel
                options={membershipOptions}
                selectedRootId={selectedMembershipRootId}
                onSelectRoot={setSelectedMembershipRootId}
                formatPrice={formatPrice}
                bookingForLabel={undefined}
              />
            ) : (
              <p className="cb-muted text-sm">No membership options required. Continue to proceed.</p>
            )}
            <div className="cb-checkout-actions">
              <button type="button" className="cb-btn-ghost" onClick={() => setStep("addons")}>
                Back
              </button>
              <button
                type="button"
                className="cb-btn-primary"
                disabled={selectedMembershipRootId == null && membershipOptions.length > 0}
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
                onClick={() => setStep(membershipOptions.length > 0 ? "membership" : "addons")}
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
            <div className="cb-checkout-summary-cards">
              {pickedSlots.map((p, slotIdx) => {
                const bondStrike =
                  slotIdx === 0 && confirmPreviewStrike != null ? confirmPreviewStrike : null;
                const origFromSchedule =
                  bondStrike == null && Array.isArray(entitlements) && entitlements.length > 0
                    ? reverseEntitlementDiscountsToUnitPrice(p.price, entitlements)
                    : null;
                const showStrike =
                  bondStrike != null
                    ? bondStrike.original > bondStrike.current + 0.01
                    : origFromSchedule != null && origFromSchedule > p.price + 0.01;
                const strikeAmount = bondStrike?.original ?? origFromSchedule;
                const priceAmount = bondStrike?.current ?? p.price;
                return (
                  <div key={p.key} className="cb-checkout-line-card">
                    <div className="cb-checkout-line-title">{productName}</div>
                    <div className="cb-checkout-line-meta">{p.resourceName}</div>
                    <div className="cb-checkout-line-time">{formatPickedSlotTimeRange(p)}</div>
                    <div className="cb-checkout-line-price">
                      {showStrike && strikeAmount != null ? (
                        <>
                          <span className="cb-checkout-price-strike">{formatPrice(strikeAmount, currency)}</span>{" "}
                          <strong>{formatPrice(priceAmount, currency)}</strong>
                        </>
                      ) : (
                        <strong>{formatPrice(p.price, currency)}</strong>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {allRequiredFlat.some((r) => requiredSelected.has(r.id)) ||
            [...selectedAddonIds].some((id) => packageAddons.some((p) => p.id === id)) ? (
              <div className="cb-checkout-addons-review">
                <h3 className="cb-checkout-section-title">Add-ons</h3>
                {allRequiredFlat.filter((r) => requiredSelected.has(r.id)).length > 0 ? (
                  <div className="cb-checkout-addon-review-group">
                    <p className="cb-checkout-addon-review-label">Required</p>
                    <ul className="cb-checkout-addon-review-list">
                      {allRequiredFlat
                        .filter((r) => requiredSelected.has(r.id))
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

            <div className="cb-checkout-summary-who">
              <span className="cb-checkout-summary-who-label">Booking for</span>
              <span className="cb-checkout-summary-who-name">{bookingForLabel}</span>
              {bookingForBadge ? <span className="cb-member-badge cb-member-badge--gold">{bookingForBadge}</span> : null}
            </div>

            {mode === "checkout" && bagSnapshots.length > 0 ? (
              <p className="cb-checkout-hint cb-checkout-hint--bag mb-3 text-sm">
                You have {bagSnapshots.length} other booking{bagSnapshots.length === 1 ? "" : "s"} in your cart.
              </p>
            ) : null}

            {bookingPreviewQuery.isPending ? (
              <div className="cb-checkout-bond-receipt mb-4" aria-busy="true" aria-live="polite">
                <p className="cb-checkout-bond-receipt-title">Pricing</p>
                <p className="cb-muted text-sm">Loading pricing…</p>
              </div>
            ) : bookingPreviewQuery.isError ? (
              <div className="cb-checkout-bond-receipt cb-checkout-bond-receipt--empty mb-4" role="alert">
                <p className="text-sm text-[var(--cb-error-text)] mb-2">Couldn&apos;t load pricing.</p>
                <button type="button" className="cb-btn-outline text-sm" onClick={() => bookingPreviewQuery.refetch()}>
                  Retry
                </button>
              </div>
            ) : confirmBondSummary != null && confirmBondSummary.rows.length > 0 ? (
              <div className="cb-checkout-bond-receipt mb-4" aria-label="Cart pricing">
                <ul className="cb-checkout-bond-receipt-lines">
                  {confirmBondSummary.rows.map((row, idx) => (
                    <li
                      key={`${row.label}-${idx}`}
                      className={`cb-checkout-bond-receipt-line cb-checkout-bond-receipt-line--${row.variant}`}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span>{row.label}</span>
                        {row.detail ? (
                          <span className="text-[var(--cb-text-muted)] text-xs font-normal">{row.detail}</span>
                        ) : null}
                      </span>
                      <span>
                        {row.amount != null
                          ? row.variant === "discount"
                            ? `−${formatPrice(row.amount, confirmBondSummary.currency)}`
                            : formatPrice(row.amount, confirmBondSummary.currency)
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!bookingPreviewQuery.isPending &&
            !(
              bookingPreviewQuery.isSuccess &&
              confirmBondSummary != null &&
              confirmBondSummary.rows.length > 0
            ) ? (
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
                  <span>Rental</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                {requiredProductsTotal + optionalAddonsConfirmTotal > 0 ? (
                  <div className="cb-checkout-total-row">
                    <span>Add-ons</span>
                    <span>{formatPrice(requiredProductsTotal + optionalAddonsConfirmTotal, currency)}</span>
                  </div>
                ) : null}
                <div className="cb-checkout-total-row cb-checkout-total-row--grand">
                  <span>Total</span>
                  <strong>{formatPrice(confirmGrandTotal, currency)}</strong>
                </div>
              </div>
            ) : null}

            {createMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--cb-error-text)]" role="alert">
                {createMutation.error instanceof BondBffError
                  ? formatConsumerBookingError(createMutation.error, {
                      customerLabel: bookingForLabel,
                      orgName: orgDisplayName,
                    })
                  : createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Could not create reservation."}
              </p>
            ) : null}
            <div className="cb-checkout-actions">
              <button
                type="button"
                className="cb-btn-ghost"
                onClick={() => setStep(questionnaireIds.length > 0 ? "forms" : "addons")}
              >
                Back
              </button>
              <button
                type="button"
                className="cb-btn-primary"
                disabled={bookingPreviewQuery.isPending || createMutation.isPending}
                onClick={handleConfirmAddToCart}
              >
                {createMutation.isPending
                  ? "Adding…"
                  : bookingPreviewQuery.isPending
                    ? "Preparing pricing…"
                    : "Add to cart"}
              </button>
            </div>
          </div>
        ) : null}

        {step === "cart" && (lastCart || approvalDeferred) ? (
          <div className="cb-checkout-step cb-checkout-step--added">
            <div className="cb-checkout-added-iconwrap" aria-hidden>
              <span className="cb-checkout-added-check">✓</span>
            </div>
            <p className="cb-checkout-added-kicker">You&apos;re almost done</p>
            <h3 className="cb-checkout-added-title">
              {approvalDeferred && !lastCart ? "Ready for checkout" : "Added to cart"}
            </h3>
            <p className="cb-checkout-added-copy">
              {approvalDeferred && !lastCart
                ? "Continue to checkout to submit your request."
                : "Your booking is saved. Add another or continue to checkout when you&apos;re ready."}
              {lastCart != null && lastCart.id != null ? (
                <>
                  {" "}
                  <span className="cb-muted">Cart #{lastCart.id}</span>
                </>
              ) : null}
            </p>
            {lastCart != null && lastCartBondPricing != null && lastCartBondPricing.rows.length > 0 ? (
              <div className="cb-checkout-bond-receipt" aria-label="Cart totals from Bond">
                <p className="cb-checkout-bond-receipt-title">Cart totals</p>
                <p className="cb-checkout-bond-receipt-sub text-[var(--cb-text-muted)] text-xs mb-2">
                  From your booking request — promos, entitlements, and tax when Bond returns them.
                </p>
                <ul className="cb-checkout-bond-receipt-lines">
                  {lastCartBondPricing.rows.map((row, idx) => (
                    <li
                      key={`${row.label}-${idx}`}
                      className={`cb-checkout-bond-receipt-line cb-checkout-bond-receipt-line--${row.variant}`}
                    >
                      <span>{row.label}</span>
                      <span>
                        {row.amount != null
                          ? row.variant === "discount"
                            ? `−${formatPrice(row.amount, lastCartBondPricing.currency)}`
                            : formatPrice(row.amount, lastCartBondPricing.currency)
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : lastCart != null && lastCartBondPricing != null && lastCartBondPricing.rows.length === 0 ? (
              <div className="cb-checkout-bond-receipt cb-checkout-bond-receipt--empty">
                <p className="cb-muted text-sm">
                  Bond did not return line totals on this cart yet. Your booking is still reserved — open the cart bag
                  to review, or continue to checkout.
                </p>
              </div>
            ) : null}
            <div className="cb-checkout-added-actions">
              {onAddAnotherBooking ? (
                <button
                  type="button"
                  className="cb-btn-outline cb-checkout-added-btn"
                  onClick={() => {
                    onAddAnotherBooking();
                    onClose();
                  }}
                >
                  Add another booking
                </button>
              ) : null}
              <button
                type="button"
                className="cb-btn-primary cb-checkout-added-btn"
                onClick={() => setStep("payment")}
              >
                Checkout
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
