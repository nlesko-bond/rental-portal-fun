"use client";

import type { ReactNode } from "react";

export type CbCheckoutTotalRowVariant = "default" | "muted" | "discount" | "grand";

const variantClass: Record<CbCheckoutTotalRowVariant, string> = {
  default: "cb-checkout-total-row",
  muted: "cb-checkout-total-row cb-checkout-total-row--muted",
  discount: "cb-checkout-total-row cb-checkout-total-row--discount",
  grand: "cb-checkout-total-row cb-checkout-total-row--grand mt-3",
};

type CbCheckoutTotalRowProps = {
  label: ReactNode;
  value: ReactNode;
  variant?: CbCheckoutTotalRowVariant;
  valueClassName?: string;
};

export function CbCheckoutTotalRow({
  label,
  value,
  variant = "default",
  valueClassName,
}: CbCheckoutTotalRowProps) {
  return (
    <div className={variantClass[variant]}>
      <span>{label}</span>
      {valueClassName ? <span className={valueClassName}>{value}</span> : <span>{value}</span>}
    </div>
  );
}
