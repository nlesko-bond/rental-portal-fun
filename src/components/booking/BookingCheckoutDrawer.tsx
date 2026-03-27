"use client";

import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { formatBondUserMessage } from "@/lib/bond-errors";
import { BondBffError } from "@/lib/bond-json";
import {
  fetchPublicQuestionnaireById,
  fetchUserRequiredProducts,
  postOnlineBookingCreate,
} from "@/lib/online-booking-user-api";
import { buildOnlineBookingCreateBody } from "@/lib/online-booking-create-body";
import { parseRequiredProductsResponse, type RequiredProductRow } from "@/lib/required-products-parse";
import type { OrganizationCartDto } from "@/types/online-booking";
import type { PickedSlot } from "@/lib/slot-selection";

export type CheckoutStep = "addons" | "forms" | "confirm" | "payment";

type Props = {
  open: boolean;
  onClose: () => void;
  orgId: number;
  portalId: number;
  facilityId: number;
  categoryId: number;
  productId: number;
  productName: string;
  userId: number;
  pickedSlots: PickedSlot[];
  selectedAddonIds: number[];
  questionnaireIds: number[];
  onSuccess: (cart: OrganizationCartDto) => void;
  onSubmittingChange?: (pending: boolean) => void;
};

function questionLabel(q: Record<string, unknown>): string {
  const t =
    (typeof q.text === "string" && q.text) ||
    (typeof q.label === "string" && q.label) ||
    (typeof q.title === "string" && q.title) ||
    (typeof q.name === "string" && q.name);
  if (t) return t;
  const id = q.id;
  return typeof id === "number" || typeof id === "string" ? `Question ${id}` : "Question";
}

function questionId(q: Record<string, unknown>): string {
  const id = q.id;
  return typeof id === "number" || typeof id === "string" ? String(id) : String(Math.random());
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
  userId,
  pickedSlots,
  selectedAddonIds,
  questionnaireIds,
  onSuccess,
  onSubmittingChange,
}: Props) {
  const [step, setStep] = useState<CheckoutStep>("addons");
  const [requiredSelected, setRequiredSelected] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setStep("addons");
    setAnswers({});
    setRequiredSelected(new Set());
  }, [open, productId]);

  const requiredQuery = useQuery({
    queryKey: ["bond", "requiredProducts", orgId, productId, userId],
    queryFn: () => fetchUserRequiredProducts(orgId, productId, userId),
    enabled: open && step === "addons",
  });

  const requiredRows: RequiredProductRow[] = useMemo(
    () => parseRequiredProductsResponse(requiredQuery.data),
    [requiredQuery.data]
  );

  const questionnaireQueries = useQueries({
    queries: questionnaireIds.map((qid) => ({
      queryKey: ["bond", "questionnaire", orgId, qid],
      queryFn: () => fetchPublicQuestionnaireById(orgId, qid),
      enabled: open && questionnaireIds.length > 0 && (step === "forms" || step === "confirm"),
    })),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const answerPayload: Array<{ questionnaireId: number; questionId: number; value: string }> = [];
      for (const key of Object.keys(answers)) {
        const parts = key.split(":");
        if (parts.length < 2) continue;
        const questionnaireId = Number(parts[0]);
        const questionId = Number(parts[1]);
        if (!Number.isFinite(questionnaireId) || !Number.isFinite(questionId)) continue;
        answerPayload.push({ questionnaireId, questionId, value: answers[key] ?? "" });
      }

      const body = buildOnlineBookingCreateBody({
        userId,
        portalId,
        facilityId,
        categoryId,
        productId,
        slots: pickedSlots,
        addonProductIds: [...new Set([...selectedAddonIds, ...requiredSelected])],
        questionnaireAnswers: answerPayload.length > 0 ? answerPayload : undefined,
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

  const goNextFromAddons = useCallback(() => {
    if (!canProceedAddons) return;
    if (questionnaireIds.length > 0) setStep("forms");
    else setStep("confirm");
  }, [canProceedAddons, questionnaireIds.length]);

  const goNextFromForms = useCallback(() => {
    setStep("confirm");
  }, []);

  const title = useMemo(() => {
    if (step === "addons") return "Add-ons";
    if (step === "forms") return "Questions";
    if (step === "confirm") return "Review";
    return "Payment";
  }, [step]);

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      ariaLabel={title}
      title={title}
      panelClassName="consumer-booking cb-checkout-drawer"
    >
      <div className="cb-checkout-inner">
        <p className="cb-checkout-product">
          <span className="cb-checkout-product-label">Service</span>
          <span className="cb-checkout-product-name">{productName}</span>
        </p>

        {step === "addons" ? (
          <div className="cb-checkout-step">
            <p className="cb-checkout-hint">
              Confirm required add-ons for this booking. Optional add-ons from the schedule may already be selected.
            </p>
            {requiredQuery.isPending ? (
              <p className="cb-muted text-sm">Loading required products…</p>
            ) : requiredRows.length === 0 ? (
              <p className="cb-muted text-sm">No additional required products for this selection.</p>
            ) : (
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
            )}
            {requiredQuery.isError ? (
              <p className="text-sm text-[var(--cb-error-text)]">Could not load required products.</p>
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
            <p className="cb-checkout-hint">Answer the following before we add your reservation to the cart.</p>
            {questionnaireQueries.some((q) => q.isPending) ? (
              <p className="cb-muted text-sm">Loading forms…</p>
            ) : (
              questionnaireIds.map((qid, idx) => {
                const q = questionnaireQueries[idx];
                const qs = Array.isArray(q?.data?.questions) ? q!.data!.questions! : [];
                const formTitle = typeof q?.data?.title === "string" ? q.data.title : `Form ${qid}`;
                return (
                  <div key={qid} className="cb-checkout-form-block">
                    <h3 className="cb-checkout-form-title">{formTitle}</h3>
                    {qs.map((raw) => {
                      if (!raw || typeof raw !== "object") return null;
                      const rec = raw as Record<string, unknown>;
                      const id = rec.id;
                      const key =
                        typeof id === "number" || typeof id === "string"
                          ? `${qid}:${id}`
                          : `${qid}:${questionLabel(rec)}`;
                      return (
                        <label key={questionId(rec)} className="cb-checkout-field">
                          <span className="cb-checkout-field-label">{questionLabel(rec)}</span>
                          <input
                            type="text"
                            className="cb-input w-full"
                            value={answers[key] ?? ""}
                            onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                          />
                        </label>
                      );
                    })}
                  </div>
                );
              })
            )}
            <div className="cb-checkout-actions">
              <button type="button" className="cb-btn-ghost" onClick={() => setStep("addons")}>
                Back
              </button>
              <button type="button" className="cb-btn-primary" onClick={goNextFromForms}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === "confirm" ? (
          <div className="cb-checkout-step">
            <ul className="cb-checkout-summary">
              <li>
                {pickedSlots.length} time slot{pickedSlots.length === 1 ? "" : "s"} selected
              </li>
              <li>
                Add-ons: {selectedAddonIds.length + requiredSelected.size} product
                {selectedAddonIds.length + requiredSelected.size === 1 ? "" : "s"}
              </li>
            </ul>
            <p className="cb-muted text-sm">
              This creates your reservation in Bond and opens payment. You can complete payment in the next step when
              your gateway is connected.
            </p>
            {createMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--cb-error-text)]" role="alert">
                {createMutation.error instanceof BondBffError
                  ? formatBondUserMessage(createMutation.error)
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
