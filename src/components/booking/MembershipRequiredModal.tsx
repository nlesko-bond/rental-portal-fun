"use client";

import { ModalShell } from "@/components/booking/ModalShell";
import type { ExtendedRequiredProductNode } from "@/lib/required-products-extended";
import {
  collectProductAndNestedIds,
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

/** Inline or modal body: pick a membership OR option + nested fees. */
export function MembershipRequiredPanel({
  options,
  selectedRootId,
  onSelectRoot,
  formatPrice,
  bookingForLabel,
}: MembershipRequiredPanelProps) {
  if (options.length === 0) return null;

  const selected = options.find((o) => o.id === selectedRootId) ?? null;
  const currency = primaryListPrice(options[0])?.currency ?? "USD";

  return (
    <div className="cb-membership-modal">
      {bookingForLabel ? (
        <p className="cb-membership-modal-booking-for">
          Booking for <strong>{bookingForLabel}</strong>
        </p>
      ) : null}
      <p className="cb-membership-modal-lead">
        This service requires a membership. Select one below to complete your booking.
      </p>
      <ul className="cb-membership-modal-options" role="radiogroup" aria-label="Membership options">
        {options.map((opt) => {
          const sel = opt.id === selectedRootId;
          const price = primaryListPrice(opt);
          const total = sumNodeTotalUsd(opt);
          const nested = opt.requiredProducts ?? [];
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
                  <span className="cb-membership-card-title">{opt.name ?? `Product ${opt.id}`}</span>
                  {price ? (
                    <span className="cb-membership-card-price">
                      {formatPrice(price.amount, price.currency)}
                      {price.label ? <span className="cb-membership-card-freq"> {price.label}</span> : null}
                    </span>
                  ) : null}
                </div>
                {nested.length > 0 ? (
                  <div className="cb-membership-card-requires">
                    <p className="cb-membership-card-requires-label">Requires</p>
                    <ul className="cb-membership-card-requires-list">
                      {nested.map((child) => {
                        const cp = primaryListPrice(child);
                        return (
                          <li key={child.id} className="cb-membership-card-requires-row">
                            <span>{child.name ?? `Product ${child.id}`}</span>
                            {cp ? (
                              <span className="cb-membership-card-requires-amt">
                                {formatPrice(cp.amount, cp.currency)}
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
                <div className="cb-membership-card-total">
                  <span>Total</span>
                  <strong>{formatPrice(total, currency)}</strong>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {selected ? (
        <p className="cb-muted cb-membership-modal-meta text-xs">
          {collectProductAndNestedIds(selected).length} product
          {collectProductAndNestedIds(selected).length === 1 ? "" : "s"} will be added with your booking.
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
  title = "Membership required",
  ...panel
}: ModalProps) {
  if (!open || panel.options.length === 0) return null;

  return (
    <ModalShell open={open} title={title} onClose={onClose} panelClassName="cb-modal-panel--membership-required">
      <MembershipRequiredPanel {...panel} />
      <div className="cb-checkout-actions cb-membership-modal-actions">
        <button type="button" className="cb-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="cb-btn-primary"
          disabled={panel.selectedRootId == null}
          onClick={onConfirm}
        >
          Continue
        </button>
      </div>
    </ModalShell>
  );
}
