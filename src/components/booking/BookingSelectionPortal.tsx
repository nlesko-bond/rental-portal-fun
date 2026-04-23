"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { CbBusyInline } from "@/components/booking/primitives/CbBusyInline";
import { IconCartShopping } from "./booking-icons";

type Props = {
  /** Current slot selection for the booking being built */
  slotCount: number;
  /** Successful `POST …/online-booking/create` sessions in the tab cart */
  cartSessionCount?: number;
  /** Total line items across saved carts (FAB badge when cart is non-empty) */
  cartLineItemCount?: number;
  error: string | null;
  onClear: () => void;
  /** `--cb-*` variables from `resolveBookingThemeStyle` so tokens apply on `body` portal. */
  themeStyle: CSSProperties;
  /** Same classes as main `.consumer-booking` (e.g. `consumer-booking--light`) so tokens match forced theme */
  appearanceClass?: string;
  /**
   * Any full-screen overlay (checkout drawer, family picker, login, etc.) — hide the floating
   * bar/FAB so it never stacks above drawers (z-index alone is not enough during hydration).
   */
  overlayOpen?: boolean;
  /**
   * When there are saved carts, the cart FAB opens the bag drawer.
   * When the bag is empty but `slotCount > 0`, the same FAB opens checkout (`onBook`).
   */
  onOpenCart?: () => void;
  /** Opens checkout for the current slot selection (drawer: add-ons → … → summary → Add to cart). */
  onBook?: () => void;
  bookBusy?: boolean;
  bookDisabled?: boolean;
};

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Fixed bottom booking summary (viewport) — single primary CTA row + cart affordance per mocks.
 */
export function BookingSelectionPortal({
  slotCount,
  cartSessionCount = 0,
  cartLineItemCount = 0,
  error,
  onClear,
  themeStyle,
  appearanceClass = "",
  overlayOpen = false,
  onOpenCart,
  onBook,
  bookBusy,
  bookDisabled,
}: Props) {
  /** Root namespace avoids Turbopack/client edge cases where nested `useTranslations(ns)` misses keys in portaled subtrees. */
  const t = useTranslations();
  const isClient = useIsClient();

  if (!isClient || typeof document === "undefined") return null;
  if (overlayOpen) return null;

  const show = slotCount > 0 || cartSessionCount > 0 || (error != null && error.length > 0);
  if (!show) return null;

  /** Cart badge must reflect saved cart lines, not draft slot selection (they are separate). */
  const cartBadge =
    cartSessionCount > 0
      ? cartLineItemCount > 0
        ? cartLineItemCount
        : cartSessionCount
      : 0;
  const fabBadge = cartBadge;
  /** Show draft slot CTA whenever slots are selected; cart FAB still opens bag when there are saved bookings. */
  const showSlotBar = slotCount > 0;
  const primaryActionLabel = t("booking.slotsSelectedCompleteBooking", { count: slotCount });
  const fabOpensBag = cartSessionCount > 0 && onOpenCart != null;
  const fabOpensCheckout = slotCount > 0 && onBook != null;
  const fabClickable = fabOpensBag || fabOpensCheckout;
  const handleFabClick = () => {
    if (fabOpensBag) onOpenCart!();
    else if (fabOpensCheckout) onBook!();
  };
  const cartFabLabel =
    slotCount > 0 && cartSessionCount > 0
      ? `View cart: ${cartSessionCount} saved booking${cartSessionCount === 1 ? "" : "s"}, ${cartLineItemCount || cartSessionCount} line item${
          (cartLineItemCount || cartSessionCount) === 1 ? "" : "s"
        }. ${slotCount} slot${slotCount === 1 ? "" : "s"} in current draft.`
      : cartSessionCount > 0
        ? `View cart: ${cartSessionCount} booking${cartSessionCount === 1 ? "" : "s"}, ${cartLineItemCount || cartSessionCount} line item${
            (cartLineItemCount || cartSessionCount) === 1 ? "" : "s"
          }.`
        : slotCount > 0
          ? `Open checkout, ${slotCount} slot${slotCount === 1 ? "" : "s"} selected`
          : `Shopping cart`;

  const wrapCls = `consumer-booking ${appearanceClass} cb-selection-portal`.trim();

  return createPortal(
    <div className={wrapCls} style={themeStyle}>
      {error && slotCount === 0 && cartSessionCount === 0 ? <p className="cb-selection-err">{error}</p> : null}
      {slotCount > 0 || cartSessionCount > 0 ? (
        <div className="cb-selection-cluster cb-selection-cluster--split">
          <div className="cb-selection-fab-row">
            {fabClickable ? (
              <button
                type="button"
                className="cb-selection-fab cb-selection-fab--clickable"
                onClick={handleFabClick}
                aria-label={cartFabLabel}
              >
                <IconCartShopping className="text-[var(--cb-text-on-primary)]" aria-hidden />
                {fabBadge > 0 ? (
                  <span className="cb-selection-fab-badge" aria-hidden>
                    {fabBadge > 99 ? "99+" : fabBadge}
                  </span>
                ) : null}
              </button>
            ) : (
              <div
                className="cb-selection-fab"
                role="img"
                aria-label={`Shopping cart, ${fabBadge} ${fabBadge === 1 ? "item" : "items"}`}
              >
                <IconCartShopping className="text-[var(--cb-text-on-primary)]" aria-hidden />
                {fabBadge > 0 ? (
                  <span className="cb-selection-fab-badge" aria-hidden>
                    {fabBadge > 99 ? "99+" : fabBadge}
                  </span>
                ) : null}
              </div>
            )}
          </div>
          {showSlotBar ? (
            <div className="cb-selection-bar cb-selection-bar--unified" role="status">
              <div className="cb-selection-actions">
                <button type="button" className="cb-selection-clearbtn" onClick={onClear}>
                  {t("common.clear")}
                </button>
                <button
                  type="button"
                  className="cb-selection-book cb-selection-book--unified cb-selection-slot-cta"
                  disabled={bookDisabled || bookBusy}
                  aria-busy={bookBusy ? true : undefined}
                  onClick={onBook}
                >
                  <CbBusyInline busy={Boolean(bookBusy)}>{primaryActionLabel}</CbBusyInline>
                </button>
              </div>
            </div>
          ) : null}
          {error ? <p className="cb-selection-err-below">{error}</p> : null}
        </div>
      ) : null}
    </div>,
    document.body
  );
}
