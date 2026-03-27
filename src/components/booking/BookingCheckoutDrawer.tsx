"use client";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { mergeQuestionnaireQuestions, type NormalizedQuestion } from "@/lib/questionnaire-parse";
import { parseRequiredProductsResponse, type RequiredProductRow } from "@/lib/required-products-parse";
import { formatPickedSlotTimeRange } from "./booking-slot-labels";
import { BookingAddonPanel, getEffectiveAddonSlotKeys, type AddonSlotTargeting } from "./BookingAddonPanel";
import { CheckoutQuestionField } from "./CheckoutQuestionField";
import type { ExtendedProductDto, OrganizationCartDto } from "@/types/online-booking";
import type { PackageAddonLine } from "@/lib/product-package-addons";
import { resolveAddonDisplayPrice } from "@/lib/product-package-addons";
import type { BondUserDto } from "@/lib/bond-user-types";
import type { PickedSlot } from "@/lib/slot-selection";
import { reverseEntitlementDiscountsToUnitPrice } from "@/lib/entitlement-discount";

export type CheckoutStep = "addons" | "forms" | "confirm" | "payment";

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
};

function stepIndex(s: CheckoutStep): number {
  if (s === "addons") return 0;
  if (s === "forms") return 1;
  if (s === "confirm") return 2;
  return 2;
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
}: Props) {
  const [step, setStep] = useState<CheckoutStep>("addons");
  const [requiredSelected, setRequiredSelected] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [extrasCollapsed, setExtrasCollapsed] = useState(false);
  const drawerWasOpen = useRef(false);
  const formsPrefillDone = useRef(false);

  const currency = product?.prices[0]?.currency ?? "USD";

  useEffect(() => {
    if (!open) return;
    setStep("addons");
    setAnswers({});
    setRequiredSelected(new Set());
    formsPrefillDone.current = false;
  }, [open, productId]);

  useEffect(() => {
    if (open && !drawerWasOpen.current) {
      setExtrasCollapsed(selectedAddonIds.size > 0 && packageAddons.length > 0);
    }
    drawerWasOpen.current = open;
  }, [open, selectedAddonIds, packageAddons]);

  const requiredQuery = useQuery({
    queryKey: ["bond", "requiredProducts", orgId, productId, userId],
    queryFn: () => fetchUserRequiredProducts(orgId, productId, userId),
    enabled: open && (step === "addons" || step === "confirm"),
  });

  const requiredRows: RequiredProductRow[] = useMemo(
    () => parseRequiredProductsResponse(requiredQuery.data),
    [requiredQuery.data]
  );

  const publicQuestionnaireQueries = useQueries({
    queries: questionnaireIds.map((qid) => ({
      queryKey: ["bond", "questionnaire", orgId, qid],
      queryFn: () => fetchPublicQuestionnaireById(orgId, qid),
      enabled: open && questionnaireIds.length > 0 && (step === "addons" || step === "forms" || step === "confirm"),
    })),
  });

  const checkoutQuestionnairesQuery = useQuery({
    queryKey: ["bond", "checkoutQuestionnaires", orgId, userId, questionnaireIds],
    queryFn: () => fetchCheckoutQuestionnaires(orgId, userId, questionnaireIds),
    enabled: open && questionnaireIds.length > 0 && (step === "addons" || step === "forms" || step === "confirm"),
  });

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
      return { qid, title, questions };
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
    (kind: NormalizedQuestion["kind"], current: string): boolean => {
      if (kind === "email" && contactSnap.email && current === contactSnap.email) return true;
      if (kind === "tel" && contactSnap.phone && current === contactSnap.phone) return true;
      if (kind === "date" && contactSnap.birthDate && current === contactSnap.birthDate) return true;
      if (kind === "address" && contactSnap.address && current === contactSnap.address) return true;
      return false;
    },
    [contactSnap]
  );

  const formsValid = useMemo(() => {
    for (const form of mergedForms) {
      for (const q of form.questions) {
        if (!q.mandatory) continue;
        const key = `${form.qid}:${q.id}`;
        const v = answers[key] ?? "";
        if (q.kind === "multiselect") {
          try {
            const arr = JSON.parse(v || "[]");
            if (!Array.isArray(arr) || arr.length === 0) return false;
          } catch {
            if (!v.trim()) return false;
          }
        } else if (q.kind === "boolean" || q.kind === "yesno") {
          if (v !== "true" && v !== "false") return false;
        } else if (q.kind === "waiver") {
          if (v !== "true") return false;
        } else if (q.kind === "file") {
          if (!String(v).trim()) return false;
        } else if (!String(v).trim()) {
          return false;
        }
      }
    }
    return true;
  }, [mergedForms, answers]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const questionnaireAnswers: Array<Record<string, unknown>> = [];
      for (const key of Object.keys(answers)) {
        const parts = key.split(":");
        if (parts.length < 2) continue;
        const questionnaireId = Number(parts[0]);
        const questionId = Number(parts[1]);
        if (!Number.isFinite(questionnaireId) || !Number.isFinite(questionId)) continue;
        questionnaireAnswers.push({
          questionnaireId,
          questionId,
          value: answers[key] ?? "",
        });
      }

      const addonProductIds = [...new Set([...selectedAddonIds, ...requiredSelected])];

      const body = buildOnlineBookingCreateBody({
        userId,
        portalId,
        categoryId,
        activity,
        facilityId,
        productId,
        slots: pickedSlots,
        addonProductIds: addonProductIds.length > 0 ? addonProductIds : undefined,
        questionnaireAnswers: questionnaireAnswers.length > 0 ? questionnaireAnswers : undefined,
      });
      return postOnlineBookingCreate(orgId, body);
    },
    onSuccess: (cart) => {
      onSuccess(cart);
      setStep("payment");
    },
  });

  useEffect(() => {
    onSubmittingChange?.(createMutation.isPending);
  }, [createMutation.isPending, onSubmittingChange]);

  const canProceedAddons = useMemo(() => {
    if (requiredRows.length === 0) return true;
    return requiredRows.every((r) => requiredSelected.has(r.id));
  }, [requiredRows, requiredSelected]);

  const packageAddonsVisible = addonsExpanded ? packageAddons : packageAddons.slice(0, ADDONS_PAGE);

  const goNextFromAddons = useCallback(() => {
    if (!canProceedAddons) return;
    if (questionnaireIds.length > 0) setStep("forms");
    else setStep("confirm");
  }, [canProceedAddons, questionnaireIds.length]);

  const goNextFromForms = useCallback(() => {
    if (!formsValid) return;
    setStep("confirm");
  }, [formsValid]);

  const title = useMemo(() => {
    if (step === "addons") return "Add-ons";
    if (step === "forms") return "Additional Information";
    if (step === "confirm") return "Review";
    return "Payment";
  }, [step]);

  const progressStep = step === "payment" ? 3 : stepIndex(step) + 1;

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

  const panelCls = `consumer-booking ${appearanceClass} cb-checkout-drawer cb-checkout-drawer--wide`.trim();

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      ariaLabel={title}
      title={title}
      panelClassName={panelCls}
    >
      <div className="cb-checkout-inner">
        <div className="cb-checkout-progress">
          <p className="cb-checkout-booking-for">
            Booking for <strong>{bookingForLabel}</strong>
            {bookingForBadge ? <span className="cb-member-badge cb-member-badge--gold ml-2">{bookingForBadge}</span> : null}
          </p>
          <p className="cb-checkout-step-pill">Step {Math.min(progressStep, 3)} of 3</p>
          <div className="cb-checkout-progress-bar" aria-hidden>
            <span className={stepIndex(step) >= 0 ? "cb-checkout-progress-fill" : ""} />
            <span className={stepIndex(step) >= 1 ? "cb-checkout-progress-fill" : ""} />
            <span className={stepIndex(step) >= 2 ? "cb-checkout-progress-fill" : ""} />
          </div>
        </div>

        <p className="cb-checkout-product">
          <span className="cb-checkout-product-label">Service</span>
          <span className="cb-checkout-product-name">{productName}</span>
        </p>

        {step === "addons" ? (
          <div className="cb-checkout-step">
            <p className="cb-checkout-hint">
              {selectedAddonIds.size > 0
                ? "Your extras from the schedule are kept below. Adjust if needed, then continue."
                : "Optional add-ons for this service. Required items from Bond are listed first—confirm each before continuing."}
            </p>
            {requiredQuery.isPending ? (
              <p className="cb-muted text-sm">Loading required products…</p>
            ) : requiredRows.length > 0 ? (
              <div className="cb-checkout-required-block">
                <h3 className="cb-checkout-section-title">Required</h3>
                <ul className="cb-checkout-list">
                  {requiredRows.map((r) => (
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
              <p className="cb-checkout-forms-hero-sub">Complete the required forms and documents</p>
            </div>
            {publicQuestionnaireQueries.some((q) => q.isPending) || checkoutQuestionnairesQuery.isPending ? (
              <p className="cb-muted text-sm">Loading forms…</p>
            ) : (
              <div className="cb-checkout-form-block cb-checkout-form-block--flat">
                {mergedForms.flatMap((form) =>
                  form.questions.map((q: NormalizedQuestion) => {
                    const key = `${form.qid}:${q.id}`;
                    const val = answers[key] ?? "";
                    return (
                      <CheckoutQuestionField
                        key={key}
                        q={q}
                        namePrefix={`q-${form.qid}`}
                        value={val}
                        prefilledHint={showPrefillHint(q.kind, val)}
                        onChange={(v) => setAnswers((a) => ({ ...a, [key]: v }))}
                      />
                    );
                  })
                )}
              </div>
            )}
            <div className="cb-checkout-actions">
              <button type="button" className="cb-btn-ghost" onClick={() => setStep("addons")}>
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
              {pickedSlots.map((p) => {
                const orig =
                  Array.isArray(entitlements) && entitlements.length > 0
                    ? reverseEntitlementDiscountsToUnitPrice(p.price, entitlements)
                    : null;
                return (
                  <div key={p.key} className="cb-checkout-line-card">
                    <div className="cb-checkout-line-title">{productName}</div>
                    <div className="cb-checkout-line-meta">{p.resourceName}</div>
                    <div className="cb-checkout-line-time">{formatPickedSlotTimeRange(p)}</div>
                    <div className="cb-checkout-line-price">
                      {orig != null && orig > p.price + 0.01 ? (
                        <>
                          <span className="cb-checkout-price-strike">{formatPrice(orig, currency)}</span>{" "}
                          <strong>{formatPrice(p.price, currency)}</strong>
                        </>
                      ) : (
                        <strong>{formatPrice(p.price, currency)}</strong>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {requiredRows.some((r) => requiredSelected.has(r.id)) ||
            [...selectedAddonIds].some((id) => packageAddons.some((p) => p.id === id)) ? (
              <div className="cb-checkout-addons-review">
                <h3 className="cb-checkout-section-title">Add-ons</h3>
                {requiredRows.filter((r) => requiredSelected.has(r.id)).length > 0 ? (
                  <div className="cb-checkout-addon-review-group">
                    <p className="cb-checkout-addon-review-label">Required</p>
                    <ul className="cb-checkout-addon-review-list">
                      {requiredRows
                        .filter((r) => requiredSelected.has(r.id))
                        .map((r) => (
                          <li key={r.id} className="cb-checkout-addon-review-row">
                            <span>{r.name ?? `Product ${r.id}`}</span>
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

            <div className="cb-checkout-totals">
              {showMemberPricing && estimatedOriginalSubtotal != null ? (
                <div className="cb-checkout-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(estimatedOriginalSubtotal, currency)}</span>
                </div>
              ) : (
                <div className="cb-checkout-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
              )}
              {showMemberPricing ? (
                <div className="cb-checkout-total-row cb-checkout-total-row--discount">
                  <span>Member savings</span>
                  <span>
                    −{formatPrice(Math.max(0, (estimatedOriginalSubtotal ?? subtotal) - subtotal), currency)}
                  </span>
                </div>
              ) : null}
              <div className="cb-checkout-total-row cb-checkout-total-row--grand">
                <span>Total</span>
                <strong>{formatPrice(subtotal, currency)}</strong>
              </div>
            </div>

            <p className="cb-muted text-xs leading-relaxed">
              Tax and payment processing will appear here once your payment gateway is connected.
            </p>

            {createMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--cb-error-text)]" role="alert">
                {createMutation.error instanceof BondBffError
                  ? formatConsumerBookingError(createMutation.error)
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
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Adding…" : "Add to cart"}
              </button>
            </div>
          </div>
        ) : null}

        {step === "payment" ? (
          <div className="cb-checkout-step">
            <p className="cb-checkout-hint">
              Reservation created. Payment collection (card / wallet) will plug in here—your cart is ready in Bond.
            </p>
            <div className="cb-checkout-actions">
              <button type="button" className="cb-btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </RightDrawer>
  );
}
