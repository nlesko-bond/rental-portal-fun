"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore, type CSSProperties } from "react";
import { IconCartShopping } from "./booking-icons";

type Props = {
  slotCount: number;
  error: string | null;
  onClear: () => void;
  /** `--cb-*` variables from `resolveBookingThemeStyle` so tokens apply on `body` portal. */
  themeStyle: CSSProperties;
  /** Same classes as main `.consumer-booking` (e.g. `consumer-booking--light`) so tokens match forced theme */
  appearanceClass?: string;
  /** Hide bar while checkout drawer is open — user is already in the booking flow */
  suppressed?: boolean;
  onBook?: () => void;
  bookBusy?: boolean;
  bookDisabled?: boolean;
  checkoutMessage?: string | null;
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
  error,
  onClear,
  themeStyle,
  appearanceClass = "",
  suppressed = false,
  onBook,
  bookBusy,
  bookDisabled,
  checkoutMessage,
}: Props) {
  const isClient = useIsClient();

  if (!isClient || typeof document === "undefined") return null;

  if (suppressed) return null;

  const show = slotCount > 0 || (error != null && error.length > 0);
  if (!show) return null;

  const wrapCls = `consumer-booking ${appearanceClass} cb-selection-portal`.trim();

  return createPortal(
    <div className={wrapCls} style={themeStyle}>
      {error && slotCount === 0 ? <p className="cb-selection-err">{error}</p> : null}
      {slotCount > 0 ? (
        <div className="cb-selection-cluster">
          <div className="cb-selection-fab-row">
            <div className="cb-selection-fab" aria-hidden>
              <IconCartShopping className="text-[var(--cb-primary)]" />
            </div>
          </div>
          <div className="cb-selection-bar cb-selection-bar--unified" role="status">
            <div className="cb-selection-actions">
              <button type="button" className="cb-selection-clearlink" onClick={onClear}>
                Clear
              </button>
              <button
                type="button"
                className="cb-selection-book cb-selection-book--unified"
                disabled={bookDisabled || bookBusy || slotCount === 0}
                onClick={onBook}
              >
                {bookBusy
                  ? "Booking…"
                  : `${slotCount} slot${slotCount === 1 ? "" : "s"} selected — Book now →`}
              </button>
            </div>
          </div>
          {checkoutMessage ? (
            <p className="cb-selection-ok-below mt-2 max-w-lg text-center text-sm text-[var(--cb-text-muted)]">
              {checkoutMessage}
            </p>
          ) : null}
          {error ? <p className="cb-selection-err-below">{error}</p> : null}
        </div>
      ) : null}
    </div>,
    document.body
  );
}
