"use client";

import { punchPassFillPercent } from "@/lib/punch-pass";

type Props = {
  remaining: number;
  total: number;
  label: string;
};

/**
 * Remaining-punches meter for an owned punch-pass SKU.
 * Fill is remaining visits; the track is the pack total.
 */
export function PunchPassRemainingMeter({ remaining, total, label }: Props) {
  const held = Math.max(0, Math.floor(remaining));
  const max = Math.max(0, Math.floor(total));
  const fillPercent = punchPassFillPercent(held, max);
  return (
    <div className="cb-punch-meter">
      <span className="cb-punch-meter-label">{label}</span>
      <div
        className="cb-punch-meter-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={held}
        aria-label={label}
      >
        <span className="cb-punch-meter-fill" style={{ width: `${fillPercent}%` }} />
      </div>
    </div>
  );
}
