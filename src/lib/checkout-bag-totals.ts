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
  "discountSubtotal",
  "discountTotal",
  "memberSavings",
  "entitlementDiscount",
  "totalDiscount",
] as const;
const TOTAL_KEYS = ["total", "totalAmount", "grandTotal", "amountDue", "balance"] as const;

/** Bond sometimes returns numeric fields as strings; JSON may omit top-level totals when line detail lives on `cartItems`. */
function coerceFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function pickNonNegativeNumber(obj: Record<string, unknown>, keys: readonly string[]): number | null {
  for (const k of keys) {
    const n = coerceFiniteNumber(obj[k]);
    if (n != null && n >= 0) return n;
  }
  return null;
}

function sumCartItemsLineAmount(cart: OrganizationCartDto): number | null {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return null;
  let sum = 0;
  let any = false;
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const it = raw as Record<string, unknown>;
    const n =
      pickNonNegativeNumber(it, ["subtotal", "lineSubtotal", "price"]) ??
      coerceFiniteNumber(it.unitPrice);
    if (n != null && n >= 0) {
      sum += n;
      any = true;
    }
  }
  return any ? sum : null;
}

function lineAmountFromCart(cart: OrganizationCartDto): number | null {
  const o = cart as Record<string, unknown>;
  const sub = pickNonNegativeNumber(o, SUBTOTAL_KEYS);
  if (sub != null) return sub;
  const p = coerceFiniteNumber(o.price);
  if (p != null && p >= 0) return p;
  return sumCartItemsLineAmount(cart);
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

/** Single-cart numeric fields Bond may return (names vary by version). */
export function getOrganizationCartNumericBreakdown(cart: OrganizationCartDto): {
  line: number | null;
  discount: number | null;
  tax: number | null;
  fee: number | null;
  total: number | null;
} {
  const o = cart as Record<string, unknown>;
  return {
    line: lineAmountFromCart(cart),
    discount: pickNonNegativeNumber(o, DISCOUNT_KEYS),
    tax: pickNonNegativeNumber(o, TAX_KEYS),
    fee: pickNonNegativeNumber(o, FEE_KEYS),
    total: pickNonNegativeNumber(o, TOTAL_KEYS),
  };
}

function aggregateCartRecord(cart: OrganizationCartDto): {
  line: number | null;
  discount: number | null;
  tax: number | null;
  fee: number | null;
  total: number | null;
} {
  return getOrganizationCartNumericBreakdown(cart);
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

/** Display rows for one `OrganizationCartDto` after `POST …/online-booking/create` (authoritative when Bond fills fields). */
export type BondCartPricingDisplayRow = {
  label: string;
  amount: number | null;
  variant: "default" | "discount" | "muted" | "grand";
};

export function getBondCartPricingDisplayRows(cart: OrganizationCartDto): {
  currency: string;
  rows: BondCartPricingDisplayRow[];
} {
  const o = cart as Record<string, unknown>;
  const cur =
    typeof cart.currency === "string" && cart.currency.length > 0
      ? cart.currency
      : typeof o.currency === "string" && o.currency.length > 0
        ? o.currency
        : "USD";
  const b = getOrganizationCartNumericBreakdown(cart);
  const rows: BondCartPricingDisplayRow[] = [];

  const line = b.line;
  const totalFromKeys = b.total;
  const cartPrice = coerceFiniteNumber(o.price);
  const total = totalFromKeys ?? (cartPrice != null && cartPrice >= 0 ? cartPrice : null);

  const lineDiffersFromTotal =
    line != null && total != null && Math.abs(line - total) > 0.005;

  if (line != null && (lineDiffersFromTotal || total == null)) {
    rows.push({ label: "Subtotal", amount: line, variant: "default" });
  }
  if (b.discount != null && b.discount > 0) {
    rows.push({ label: "Discounts & savings", amount: b.discount, variant: "discount" });
  }
  if (b.tax != null && b.tax > 0) rows.push({ label: "Tax", amount: b.tax, variant: "muted" });
  if (b.fee != null && b.fee > 0) rows.push({ label: "Fees", amount: b.fee, variant: "muted" });
  if (total != null) {
    rows.push({ label: "Total", amount: total, variant: "grand" });
  } else if (line != null && rows.every((r) => r.variant !== "grand")) {
    rows.push({ label: "Total", amount: line, variant: "grand" });
  }

  if (rows.length === 0) {
    const fallback = cartPrice != null && cartPrice >= 0 ? cartPrice : sumCartItemsLineAmount(cart);
    if (fallback != null) {
      rows.push({ label: "Cart total", amount: fallback, variant: "grand" });
    }
  }

  return { currency: cur, rows };
}
