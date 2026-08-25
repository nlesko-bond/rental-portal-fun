import { BOND_KIND_LINE_MIN } from "@/lib/checkout-bag-totals";

const CURRENCY_CENTS = 100;

/** Inputs for `resolveFinalizeAmountToPay` — Bond cart vs demo pack vs UI estimate. */
export type ResolveFinalizeAmountToPayArgs = {
  bondPayable: number | null;
  punchPackDue: number;
  uiEstimate: number | null;
  overrideAmount?: number;
  cartMinimum?: number | null;
};

/**
 * Dollar amount to send as `amountToPay` on Bond `finalize`. Never sends the demo
 * punch-pack price: Bond's cart is the $0 visit, and a payment method on $0 500s.
 */
export function resolveFinalizeAmountToPay(args: ResolveFinalizeAmountToPayArgs): number | null {
  const { bondPayable, punchPackDue, uiEstimate, overrideAmount, cartMinimum } = args;
  let amount = bondPayable;
  if (overrideAmount != null && overrideAmount > 0 && bondPayable != null && bondPayable > 0) {
    const requestedAmount = Math.round(overrideAmount * CURRENCY_CENTS) / CURRENCY_CENTS;
    const normalizedMinimum =
      cartMinimum != null && requestedAmount <= cartMinimum + BOND_KIND_LINE_MIN
        ? cartMinimum
        : requestedAmount;
    amount = Math.min(normalizedMinimum, bondPayable);
  }
  if (amount == null && punchPackDue <= 0 && uiEstimate != null && Number.isFinite(uiEstimate) && uiEstimate > 0) {
    amount = Math.round(uiEstimate * CURRENCY_CENTS) / CURRENCY_CENTS;
  }
  if (amount == null || amount <= 0) return null;
  return amount;
}
