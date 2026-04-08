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

/** Sum `discounts[].discountAmount` (Bond uses negative savings amounts). */
function sumBondCartDiscountArrayAbs(cart: OrganizationCartDto): number | null {
  const o = cart as Record<string, unknown>;
  const raw = o.discounts;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  let sum = 0;
  let any = false;
  for (const d of raw) {
    if (!d || typeof d !== "object") continue;
    const amt = coerceFiniteNumber((d as Record<string, unknown>).discountAmount);
    if (amt != null) {
      sum += Math.abs(amt);
      any = true;
    }
  }
  return any ? sum : null;
}

/** Single-cart numeric fields Bond may return (names vary by version). */
export function getOrganizationCartNumericBreakdown(cart: OrganizationCartDto): {
  line: number | null;
  discount: number | null;
  tax: number | null;
  fee: number | null;
  total: number | null;
} {
  const o = cart as Record<string, unknown>;
  const fromArray = sumBondCartDiscountArrayAbs(cart);
  const top = coerceFiniteNumber(o.discountAmount);
  const discountAgg =
    fromArray != null && fromArray > 0
      ? fromArray
      : top != null
        ? Math.abs(top)
        : pickNonNegativeNumber(o, DISCOUNT_KEYS);
  return {
    line: lineAmountFromCart(cart),
    discount: discountAgg,
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
  /** Optional second line (e.g. discount `reason.reason` from Bond). */
  detail?: string;
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

function parseAllCartItemLines(cart: OrganizationCartDto): { label: string; amount: number }[] {
  const items = cart.cartItems;
  if (!Array.isArray(items)) return [];
  const out: { label: string; amount: number }[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const it = raw as Record<string, unknown>;
    const product = it.product as Record<string, unknown> | undefined;
    const name =
      product && typeof product.name === "string" && product.name.length > 0
        ? product.name
        : typeof it.productId === "number"
          ? `Product ${it.productId}`
          : "Line item";
    const amt = coerceFiniteNumber(it.subtotal) ?? coerceFiniteNumber(it.price);
    if (amt != null && Math.abs(amt) > 0.0001) out.push({ label: name, amount: Math.abs(amt) });
  }
  return out;
}

/** Each entry in Bond `OrganizationCartDto.discounts[]` (see CartDiscountDto / hosted OpenAPI). */
function parseBondCartDiscountRows(cart: OrganizationCartDto): BondCartPricingDisplayRow[] {
  const o = cart as Record<string, unknown>;
  const raw = o.discounts;
  if (!Array.isArray(raw)) return [];
  const rows: BondCartPricingDisplayRow[] = [];
  for (const d of raw) {
    if (!d || typeof d !== "object") continue;
    const r = d as Record<string, unknown>;
    const amt = coerceFiniteNumber(r.discountAmount);
    const nested = r.discount && typeof r.discount === "object" ? (r.discount as Record<string, unknown>) : null;
    const name = nested && typeof nested.name === "string" ? nested.name : "Discount";
    const pct = coerceFiniteNumber(nested?.percentageValue) ?? coerceFiniteNumber(r.percentage);
    const reason =
      r.reason && typeof r.reason === "object" ? (r.reason as Record<string, unknown>) : null;
    const reasonText = reason && typeof reason.reason === "string" ? reason.reason : undefined;
    const label = pct != null && pct > 0 ? `${name} (${pct}%)` : name;
    if (amt != null && Math.abs(amt) > 0.0001) {
      rows.push({
        label,
        amount: Math.abs(amt),
        variant: "discount",
        detail: reasonText,
      });
    }
  }
  return rows;
}

/**
 * Booking summary: line items (rental + add-ons from `cartItems`) → subtotal → each `discounts[]` row → tax → total.
 * Data is whatever Bond returns on `POST …/online-booking/create` (same JSON the BFF forwards from Bond APIs).
 */
export function getBondCartConfirmSummaryLines(cart: OrganizationCartDto): {
  currency: string;
  rows: BondCartPricingDisplayRow[];
} {
  const base = getBondCartPricingDisplayRows(cart);
  const o = cart as Record<string, unknown>;
  const cur =
    typeof cart.currency === "string" && cart.currency.length > 0
      ? cart.currency
      : typeof o.currency === "string" && o.currency.length > 0
        ? o.currency
        : "USD";

  const itemLines = parseAllCartItemLines(cart);
  const multi = itemLines.length > 1;
  const b = getOrganizationCartNumericBreakdown(cart);
  const cartSub = pickNonNegativeNumber(o, SUBTOTAL_KEYS) ?? b.line;

  const rows: BondCartPricingDisplayRow[] = [];

  if (multi) {
    for (const line of itemLines) {
      rows.push({ label: line.label, amount: line.amount, variant: "default" });
    }
  }

  if (cartSub != null) {
    rows.push({ label: "Subtotal", amount: cartSub, variant: "default" });
  } else if (!multi && itemLines.length === 1) {
    rows.push({ label: itemLines[0]!.label, amount: itemLines[0]!.amount, variant: "default" });
  }

  const discountRows = parseBondCartDiscountRows(cart);
  if (discountRows.length > 0) {
    for (const r of discountRows) rows.push(r);
  } else {
    const agg = sumBondCartDiscountArrayAbs(cart);
    const top = coerceFiniteNumber(o.discountAmount);
    const absVal = agg != null && agg > 0 ? agg : top != null ? Math.abs(top) : null;
    if (absVal != null && absVal > 0.0001) {
      rows.push({ label: "Discounts", amount: absVal, variant: "discount" });
    }
  }

  const tax = pickNonNegativeNumber(o, TAX_KEYS);
  const fee = pickNonNegativeNumber(o, FEE_KEYS);
  if (tax != null && tax > 0) rows.push({ label: "Tax", amount: tax, variant: "muted" });
  if (fee != null && fee > 0) rows.push({ label: "Fees", amount: fee, variant: "muted" });

  const total =
    pickNonNegativeNumber(o, TOTAL_KEYS) ??
    (() => {
      const p = coerceFiniteNumber(o.price);
      return p != null && p >= 0 ? p : null;
    })();

  if (total != null) rows.push({ label: "Total", amount: total, variant: "grand" });
  else if (cartSub != null) rows.push({ label: "Total", amount: cartSub, variant: "grand" });

  if (rows.length === 0) return base;
  return { currency: cur, rows };
}

/** Strike-through vs current price from first non–add-on `cartItems` row (Bond `price` vs `subtotal`). */
export function getBondCartPrimaryLineStrike(cart: OrganizationCartDto): {
  original: number;
  current: number;
} | null {
  const items = cart.cartItems;
  if (!Array.isArray(items)) return null;
  let it: Record<string, unknown> | null = null;
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    if (row.isAddon === true) continue;
    it = row;
    break;
  }
  if (it == null && items[0] && typeof items[0] === "object") it = items[0] as Record<string, unknown>;
  if (it == null) return null;
  const original = coerceFiniteNumber(it.price);
  const current = coerceFiniteNumber(it.subtotal) ?? coerceFiniteNumber(it.price);
  if (current == null) return null;
  if (original != null && original > current + 0.005) return { original, current };
  if (original != null) return { original, current };
  return null;
}
