"use client";

import { useTranslations } from "next-intl";
import { formatSlotCurrency } from "@/lib/booking-pricing";

const EPS = 0.005;

/** Identification card icon — reads as “membership / pass” more clearly than a generic doc glyph. */
function IconMembershipCard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2.5 10.5h19" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="13.5" width="5" height="1.8" rx="0.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Compact “Free” + membership hint; custom floating tooltip (not native `title` / browser chrome).
 */
export function SlotMemberPriceLabel({
  amount,
  currency,
  membershipGated,
  membershipGateNames,
}: {
  amount: number;
  currency: string;
  membershipGated: boolean;
  membershipGateNames: readonly string[];
}) {
  const tp = useTranslations("pricing");
  const showMemberFree =
    membershipGated && Number.isFinite(amount) && Math.abs(amount) < EPS;
  const tip =
    membershipGateNames.length > 0
      ? tp("includedWith", { names: membershipGateNames.join(", ") })
      : tp("memberRateIncluded");

  if (!showMemberFree) {
    return <>{formatSlotCurrency(amount, currency)}</>;
  }

  return (
    <span className="cb-slot-member-price group relative inline-flex max-w-full flex-col items-center gap-0.5">
      <span className="cb-slot-member-price__row inline-flex items-center gap-1">
        <span className="cb-slot-member-price__free text-[0.6rem] font-bold uppercase tracking-wide text-[var(--cb-primary)]">
          {tp("memberFree")}
        </span>
        <span className="relative inline-flex">
          {/*
            Must not use <button> here: slot cells are already <button>s (ScheduleCalendarView / matrix).
            Decorative badge + tooltip only; parent button handles activation.
          */}
          <span
            role="img"
            aria-label={tip}
            className="cb-slot-member-price__badge inline-flex h-6 w-6 shrink-0 cursor-default items-center justify-center rounded-md border border-[var(--cb-border)] bg-[var(--cb-bg-surface)] text-[var(--cb-primary)] shadow-sm transition-colors group-hover:border-[var(--cb-primary)] group-hover:bg-[var(--cb-bg-muted)]"
          >
            <IconMembershipCard className="shrink-0" />
          </span>
          <span
            role="tooltip"
            className="pointer-events-none invisible absolute bottom-[calc(100%+6px)] left-1/2 z-[60] w-max max-w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-md border border-[var(--cb-border)] bg-[var(--cb-bg-surface)] px-2.5 py-2 text-left text-[0.65rem] font-normal leading-snug text-[var(--cb-text)] shadow-lg opacity-0 ring-1 ring-black/5 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 dark:ring-white/10"
          >
            {tip}
          </span>
        </span>
      </span>
    </span>
  );
}
