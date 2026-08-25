"use client";

const MAX_VISIBLE_PUNCH_STAMPS = 10;

type Props = {
  remaining: number;
  total: number;
};

/**
 * Decorative remaining-visit stamps for the prototype punch-pass ticket.
 */
export function PunchPassStampRow({ remaining, total }: Props) {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeRemaining = Math.max(0, Math.min(safeTotal, Math.floor(remaining)));
  const shown = Math.min(safeTotal, MAX_VISIBLE_PUNCH_STAMPS);
  if (shown === 0) return null;
  const filled = Math.min(safeRemaining, shown);
  return (
    <span className="cb-punch-stamps" aria-hidden>
      {Array.from({ length: shown }, (_, index) => (
        <span
          key={index}
          className={index < filled ? "cb-punch-stamp cb-punch-stamp--remaining" : "cb-punch-stamp"}
        />
      ))}
    </span>
  );
}
