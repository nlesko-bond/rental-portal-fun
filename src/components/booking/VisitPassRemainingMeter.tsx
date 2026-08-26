"use client";

import { visitPassFillPercent } from "@/lib/visit-pass";

type Props = {
  remaining: number;
  total: number;
  label: string;
};

/**
 * Remaining-visits meter for an owned visit-pass SKU.
 * Fill is remaining visits; the track is the pack total.
 */
export function VisitPassRemainingMeter({ remaining, total, label }: Props) {
  const held = Math.max(0, Math.floor(remaining));
  const max = Math.max(0, Math.floor(total));
  const fillPercent = visitPassFillPercent(held, max);
  return (
    <div className="cb-visit-meter">
      <span className="cb-visit-meter-label">{label}</span>
      <div
        className="cb-visit-meter-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={held}
        aria-label={label}
      >
        <span className="cb-visit-meter-fill" style={{ width: `${fillPercent}%` }} />
      </div>
    </div>
  );
}
