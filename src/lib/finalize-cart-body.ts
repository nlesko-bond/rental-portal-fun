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

/** Inputs for `buildFinalizeCartBody` — Bond charge vs $0 visit. */
export type BuildFinalizeCartBodyArgs = {
  amountToPay: number | null;
  paymentMethodId?: number | null;
};

/**
 * Bond `POST …/finalize` body. Empty `{}` 500s; a payment method on a $0 cart also 500s.
 * Chargeable carts send amount + method. Zero-dollar carts send `amountToPay: 0` only.
 */
export function buildFinalizeCartBody(args: BuildFinalizeCartBodyArgs): Record<string, unknown> {
  const amount = args.amountToPay;
  if (amount != null && amount > BOND_KIND_LINE_MIN) {
    const body: Record<string, unknown> = { amountToPay: amount };
    if (args.paymentMethodId != null) body.paymentMethodId = args.paymentMethodId;
    return body;
  }
  return { amountToPay: 0 };
}

/** Mutation result when punch-pass checkout completes without calling Bond `finalize`. */
export const PUNCH_PASS_LOCAL_FINALIZE = { punchPassLocalComplete: true as const };

/**
 * Bond `finalize` 500s on punchCard carts for every body we have tried (`{}`,
 * payment method, `amountToPay: 0`). Skip that call when the bag is a punch-pass
 * checkout and Bond has nothing to charge.
 */
export function punchPassCartSkipsBondFinalize(
  isPunchPassCheckout: boolean,
  bondPayable: number | null
): boolean {
  if (!isPunchPassCheckout) return false;
  return bondPayable == null || bondPayable <= BOND_KIND_LINE_MIN;
}
