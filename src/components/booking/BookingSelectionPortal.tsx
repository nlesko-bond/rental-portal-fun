"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore, type CSSProperties } from "react";
import { IconCartShopping } from "./booking-icons";

type Props = {
  /** Current slot selection for the booking being built */
  slotCount: number;
  /** Successful cart submissions this session (shows on FAB when slots cleared) */
  cartBookingCount?: number;
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
  /** When set and there are saved carts, the cart FAB opens the bag / “Your cart” drawer. */
  onOpenCart?: () => void;
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
  cartBookingCount = 0,
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
  const isClient = useIsClient();

  if (!isClient || typeof document === "undefined") return null;
  if (overlayOpen) return null;

  const show = slotCount > 0 || cartBookingCount > 0 || (error != null && error.length > 0);
  if (!show) return null;

  const fabBadge = slotCount > 0 ? slotCount : cartBookingCount;
  const showSlotBar = slotCount > 0;
  const primaryActionLabel =
    slotCount === 1 ? "1 slot selected →" : `${slotCount} slots selected →`;
  const cartFabLabel =
    slotCount > 0 && cartBookingCount > 0
      ? `View cart (${cartBookingCount} saved). ${slotCount} slot${slotCount === 1 ? "" : "s"} in current booking.`
      : `View cart, ${cartBookingCount} saved ${cartBookingCount === 1 ? "booking" : "bookings"}`;

  const wrapCls = `consumer-booking ${appearanceClass} cb-selection-portal`.trim();

  return createPortal(
    <div className={wrapCls} style={themeStyle}>
      {error && slotCount === 0 && cartBookingCount === 0 ? <p className="cb-selection-err">{error}</p> : null}
      {slotCount > 0 || cartBookingCount > 0 ? (
        <div className="cb-selection-cluster cb-selection-cluster--split">
          <div className="cb-selection-fab-row">
            {onOpenCart && cartBookingCount > 0 ? (
              <button
                type="button"
                className="cb-selection-fab cb-selection-fab--clickable"
                onClick={onOpenCart}
                aria-label={cartFabLabel}
              >
                <IconCartShopping className="text-[var(--cb-primary)]" aria-hidden />
                <span className="cb-selection-fab-badge" aria-hidden>
                  {fabBadge > 99 ? "99+" : fabBadge}
                </span>
              </button>
            ) : (
              <div
                className="cb-selection-fab"
                role="img"
                aria-label={`Shopping cart, ${fabBadge} ${fabBadge === 1 ? "item" : "items"}`}
              >
                <IconCartShopping className="text-[var(--cb-primary)]" aria-hidden />
                <span className="cb-selection-fab-badge" aria-hidden>
                  {fabBadge > 99 ? "99+" : fabBadge}
                </span>
              </div>
            )}
          </div>
          {showSlotBar ? (
            <div className="cb-selection-bar cb-selection-bar--unified" role="status">
              <div className="cb-selection-actions">
                <button type="button" className="cb-selection-clearlink" onClick={onClear}>
                  Clear
                </button>
                <button
                  type="button"
                  className="cb-selection-book cb-selection-book--unified cb-selection-slot-cta"
                  disabled={bookDisabled || bookBusy}
                  onClick={onBook}
                >
                  {bookBusy ? "Booking…" : primaryActionLabel}
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
