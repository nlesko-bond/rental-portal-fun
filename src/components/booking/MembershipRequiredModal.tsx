"use client";

import { useTranslations } from "next-intl";
import { ModalShell } from "@/components/booking/ModalShell";
import { IconMembershipCard } from "@/components/booking/SlotMemberPriceLabel";
import type { ExtendedRequiredProductNode } from "@/lib/required-products-extended";
import {
  collectProductAndNestedIds,
  membershipFrequencyLabel,
  primaryListPrice,
  sumNodeTotalUsd,
} from "@/lib/required-products-extended";

export type MembershipRequiredPanelProps = {
  /** Top-level membership options from Bond (OR). */
  options: ExtendedRequiredProductNode[];
  selectedRootId: number | null;
  onSelectRoot: (id: number) => void;
  formatPrice: (amount: number, currency: string) => string;
  /** Shown under the title so the member knows whose membership they are choosing. */
  bookingForLabel?: string;
};

/** Pretty-prints `productSubType` as a card subtitle (e.g. "Individual", "Family"). */
function membershipSubTypeLabel(node: ExtendedRequiredProductNode): string | null {
  const raw = node.productSubType;
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[_-]+/g, " ").trim();
  if (!cleaned || /gating[_\s]*membership/i.test(cleaned)) return null;
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Inline or modal body: pick a membership OR option + nested fees. */
export function MembershipRequiredPanel({
  options,
  selectedRootId,
  onSelectRoot,
  formatPrice,
  bookingForLabel,
}: MembershipRequiredPanelProps) {
  const tc = useTranslations("checkout");
  if (options.length === 0) return null;

  const selected = options.find((o) => o.id === selectedRootId) ?? null;
  const addedProductCount = selected ? collectProductAndNestedIds(selected).length : 0;
  const currency = primaryListPrice(options[0])?.currency ?? "USD";

  const renderPriceWithFreq = (
    price: { amount: number; currency: string },
    freqLabel: string | null
  ) => (
    <span className="cb-membership-card-price">
      <span className="cb-membership-card-price-amount">{formatPrice(price.amount, price.currency)}</span>
      {freqLabel ? <span className="cb-membership-card-freq"> / {freqLabel}</span> : null}
    </span>
  );

  return (
    <div className="cb-membership-modal">
      <div className="cb-membership-modal-hero">
        <div className="cb-checkout-summary-step-hero-icon cb-membership-modal-hero-icon" aria-hidden>
          <IconMembershipCard className="h-6 w-6" />
        </div>
        <p className="cb-membership-modal-hero-title">{tc("membershipPanelHeroTitle")}</p>
      </div>
      {bookingForLabel ? (
        <p className="cb-membership-modal-booking-for">
          {tc("bookingForInline")} <strong>{bookingForLabel}</strong>
        </p>
      ) : null}
      <p className="cb-membership-modal-lead">{tc("membershipPanelLead")}</p>
      <ul className="cb-membership-modal-options" role="radiogroup" aria-label={tc("membershipOptionsAria")}>
        {options.map((opt) => {
          const sel = opt.id === selectedRootId;
          const price = primaryListPrice(opt);
          const total = sumNodeTotalUsd(opt);
          const nested = opt.requiredProducts ?? [];
          const subType = membershipSubTypeLabel(opt);
          const hasNested = nested.length > 0;
          return (
            <li key={opt.id}>
              <button
                type="button"
                className={`cb-membership-card${sel ? " cb-membership-card--selected" : ""}`}
                role="radio"
                aria-checked={sel}
                onClick={() => onSelectRoot(opt.id)}
              >
                <div className="cb-membership-card-head">
                  <div className="cb-membership-card-head-text">
                    <span className="cb-membership-card-title">{opt.name ?? `Product ${opt.id}`}</span>
                    {subType ? (
                      <span className="cb-membership-card-subtype">{subType}</span>
                    ) : null}
                  </div>
                  {price ? renderPriceWithFreq(price, membershipFrequencyLabel(opt)) : null}
                </div>
                {hasNested && !sel ? (
                  <span className="cb-membership-card-additional-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                    {tc("membershipAdditionalRequiredPill")}
                  </span>
                ) : null}
                {hasNested && sel ? (
                  <div className="cb-membership-card-requires">
                    <div className="cb-membership-card-requires-banner">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                      <span>{tc("membershipRequiresLabel")}</span>
                    </div>
                    <ul className="cb-membership-card-requires-list">
                      {nested.map((child) => {
                        const cp = primaryListPrice(child);
                        const childFreq = membershipFrequencyLabel(child);
                        const childSubType = membershipSubTypeLabel(child);
                        const alreadyOwned = child.required === false;
                        return (
                          <li key={child.id} className="cb-membership-card-requires-row">
                            <div className="cb-membership-card-requires-row-text">
                              <span className="cb-membership-card-requires-row-name">
                                {child.name ?? `Product ${child.id}`}
                              </span>
                              {childSubType ? (
                                <span className="cb-membership-card-requires-row-subtype">{childSubType}</span>
                              ) : null}
                            </div>
                            {cp ? (
                              <span className="cb-membership-card-requires-amt">
                                <span className="cb-membership-card-price-amount">
                                  {alreadyOwned ? formatPrice(0, cp.currency) : formatPrice(cp.amount, cp.currency)}
                                </span>
                                {alreadyOwned ? (
                                  <span className="cb-membership-card-already-owned">
                                    {" "}
                                    {tc("membershipAlreadyOwnedSuffix")}
                                  </span>
                                ) : childFreq ? (
                                  <span className="cb-membership-card-freq"> / {childFreq}</span>
                                ) : null}
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
                {sel ? (
                  <div className="cb-membership-card-total">
                    <span>{tc("membershipCardTotalLabel")}</span>
                    <strong>{formatPrice(total, currency)}</strong>
                  </div>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {selected ? (
        <p className="cb-muted cb-membership-modal-meta text-xs">
          {addedProductCount === 1
            ? tc("membershipProductsAddedOne")
            : tc("membershipProductsAddedMany", { count: addedProductCount })}
        </p>
      ) : null}
    </div>
  );
}

type ModalProps = MembershipRequiredPanelProps & {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
};

/** Optional overlay wrapper — checkout flow uses the dedicated membership step in the drawer. */
export function MembershipRequiredModal({
  open,
  onClose,
  onConfirm,
  title,
  ...panel
}: ModalProps) {
  const tc = useTranslations("checkout");
  const tm = useTranslations("membership");
  if (!open || panel.options.length === 0) return null;

  return (
    <ModalShell
      open={open}
      title={title ?? tm("defaultTitle")}
      onClose={onClose}
      panelClassName="cb-modal-panel--membership-required"
    >
      <MembershipRequiredPanel {...panel} />
      <div className="cb-checkout-actions cb-membership-modal-actions">
        <button type="button" className="cb-btn-ghost" onClick={onClose}>
          {tm("modalCancel")}
        </button>
        <button
          type="button"
          className="cb-btn-primary"
          disabled={panel.selectedRootId == null}
          onClick={onConfirm}
        >
          {tc("membershipModalConfirm")}
        </button>
      </div>
    </ModalShell>
  );
}
