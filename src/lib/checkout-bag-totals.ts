import type { OrganizationCartDto } from "@/types/online-booking";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import { groupSessionCartSnapshotsByLabel } from "@/lib/session-cart-grouping";

/**
 * Bond may return these on `OrganizationCartDto` (names vary by version; not all in OpenAPI).
 * We read flexibly and aggregate for checkout display.
 */
const SUBTOTAL_KEYS = ["subtotal", "lineSubtotal", "itemsSubtotal"] as const;
const TAX_KEYS = ["tax", "taxAmount", "taxTotal", "estimatedTax", "salesTax", "totalTax"] as const;
const FEE_KEYS = ["transactionFee", "processingFee", "fees", "feeTotal", "paymentFee"] as const;
const DISCOUNT_KEYS = [
  "discount",
  "discountAmount",
  "discountTotal",
  "memberSavings",
  "entitlementDiscount",
  "totalDiscount",
] as const;
const TOTAL_KEYS = ["total", "totalAmount", "grandTotal", "amountDue", "balance"] as const;

function pickPositiveNumber(obj: Record<string, unknown>, keys: readonly string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return v;
  }
  return null;
}

function lineAmountFromCart(cart: OrganizationCartDto): number | null {
  const o = cart as Record<string, unknown>;
  const sub = pickPositiveNumber(o, SUBTOTAL_KEYS);
  if (sub != null) return sub;
  const price = o.price;
  if (typeof price === "number" && Number.isFinite(price)) return price;
  return null;
}

export type AggregatedBagTotals = {
  /** Sum of per-cart line subtotals (Bond `subtotal` / `price`). */
  lineSubtotal: number | null;
  /** Sum of discount fields when present on carts. */
  discountTotal: number | null;
  /** Sum of tax fields when present on carts. */
  taxTotal: number | null;
  /** Sum of fee fields when present on carts. */
  feeTotal: number | null;
  /** Sum of each cart's `total` when every cart has a total field. */
  cartGrandTotal: number | null;
};

function aggregateCartRecord(cart: OrganizationCartDto): {
  line: number | null;
  discount: number | null;
  tax: number | null;
  fee: number | null;
  total: number | null;
} {
  const o = cart as Record<string, unknown>;
  return {
    line: lineAmountFromCart(cart),
    discount: pickPositiveNumber(o, DISCOUNT_KEYS),
    tax: pickPositiveNumber(o, TAX_KEYS),
    fee: pickPositiveNumber(o, FEE_KEYS),
    total: pickPositiveNumber(o, TOTAL_KEYS),
  };
}

/**
 * Sums numeric breakdown fields across session cart rows. Missing fields stay null (unknown).
 */
export function aggregateBagSnapshots(rows: SessionCartSnapshot[]): AggregatedBagTotals {
  if (rows.length === 0) {
    return {
      lineSubtotal: null,
      discountTotal: null,
      taxTotal: null,
      feeTotal: null,
      cartGrandTotal: null,
    };
  }

  let lineSum = 0;
  let lineAny = false;
  let discountSum = 0;
  let discountAny = false;
  let taxSum = 0;
  let taxAny = false;
  let feeSum = 0;
  let feeAny = false;
  let totalSum = 0;
  let totalAllPresent = true;

  for (const row of rows) {
    const a = aggregateCartRecord(row.cart);
    if (a.line != null) {
      lineSum += a.line;
      lineAny = true;
    }
    if (a.discount != null) {
      discountSum += a.discount;
      discountAny = true;
    }
    if (a.tax != null) {
      taxSum += a.tax;
      taxAny = true;
    }
    if (a.fee != null) {
      feeSum += a.fee;
      feeAny = true;
    }
    if (a.total != null) {
      totalSum += a.total;
    } else {
      totalAllPresent = false;
    }
  }

  return {
    lineSubtotal: lineAny ? lineSum : null,
    discountTotal: discountAny ? discountSum : null,
    taxTotal: taxAny ? taxSum : null,
    feeTotal: feeAny ? feeSum : null,
    cartGrandTotal: totalAllPresent && rows.length > 0 ? totalSum : null,
  };
}

/** Per–family-member aggregates (one Bond cart per “add to cart” submission). */
export function aggregateBagSnapshotsByLabel(rows: SessionCartSnapshot[]): {
  label: string;
  items: { index: number; row: SessionCartSnapshot }[];
  totals: AggregatedBagTotals;
}[] {
  const groups = groupSessionCartSnapshotsByLabel(rows);
  return groups.map((g) => ({
    label: g.label,
    items: g.items,
    totals: aggregateBagSnapshots(g.items.map((x) => x.row)),
  }));
}

/**
 * Best-effort estimated amount due when Bond does not return a single `total` on every cart.
 */
export function estimateAmountDue(
  agg: AggregatedBagTotals,
  opts: { includeProvisionalFees: boolean }
): number | null {
  if (agg.cartGrandTotal != null) return agg.cartGrandTotal;

  const sub = agg.lineSubtotal;
  if (sub == null) return null;

  const afterDiscounts = sub - (agg.discountTotal ?? 0);
  const withTax = afterDiscounts + (agg.taxTotal ?? 0);
  const withFees = withTax + (opts.includeProvisionalFees ? agg.feeTotal ?? 0 : 0);
  return Math.max(0, withFees);
}
