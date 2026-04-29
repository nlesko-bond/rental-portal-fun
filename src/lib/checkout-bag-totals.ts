/** Display-only parsing of `OrganizationCartDto` (BFF → Bond). No invented prices — only `coerce` + key fallbacks. */
import type { OrganizationCartDto } from "@/types/online-booking";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import {
  groupSessionCartSnapshotsByLabel,
  type SessionCartGroupedItem,
} from "@/lib/session-cart-grouping";
import {
  type CartLineKind,
  classifyCartItemLineKind,
  getCartItemMetadataDescription,
  receiptBadgeForCartLine,
} from "@/lib/bond-cart-item-classify";
import { describeCartItemDiscountLabels, resolveDiscountTriggerName } from "@/lib/entitlement-discount";

/** Minimum absolute amount to show a split bucket row (avoids noisy zero-ish floats). */
export const BOND_KIND_LINE_MIN = 0.005;

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

/** One cart line amount — prefers line totals / `amount` before raw `price` (Bond often keeps list price in `price` and net in `amount`). */
function getCartItemLineAmount(it: Record<string, unknown>): number | null {
  for (const k of ["subtotal", "lineSubtotal", "lineTotal", "total", "amount", "price"] as const) {
    const n = coerceFiniteNumber(it[k]);
    if (n != null && Number.isFinite(n)) return Math.abs(n);
  }
  const unit = coerceFiniteNumber(it.unitPrice);
  const qRaw =
    coerceFiniteNumber(it.quantity) ?? coerceFiniteNumber(it.lineQuantity) ?? coerceFiniteNumber(it.units);
  const q = qRaw != null && qRaw > 0 ? qRaw : 1;
  if (unit != null && Number.isFinite(unit)) return Math.abs(unit * q);
  return null;
}

/** Same line amount rules as receipt rows — for cart lists (`cart-purchase-lines.ts`). */
export function cartItemLineAmountFromDto(raw: unknown): number | null {
  if (!raw || typeof raw !== "object") return null;
  return getCartItemLineAmount(raw as Record<string, unknown>);
}

export { describeCartItemDiscountLabels } from "./entitlement-discount";

function sumLineDiscountSavingsFromBond(it: Record<string, unknown>): number | null {
  let sum = 0;
  let any = false;
  const raw = it.discounts;
  if (Array.isArray(raw) && raw.length > 0) {
    for (const d of raw) {
      if (!d || typeof d !== "object") continue;
      const disc = coerceFiniteNumber((d as Record<string, unknown>).discountAmount);
      if (disc != null && Math.abs(disc) > 0.0001) {
        sum += Math.abs(disc);
        any = true;
      }
    }
  }
  if (!any && it.discount && typeof it.discount === "object") {
    const disc = coerceFiniteNumber((it.discount as Record<string, unknown>).discountAmount);
    if (disc != null && Math.abs(disc) > 0.0001) {
      sum += Math.abs(disc);
      any = true;
    }
  }
  return any ? sum : null;
}

/** Percent from Bond line `discounts[]` or lone `discount` (same shapes as `describeCartItemDiscountLabels`). */
function extractPercentFromBondDiscounts(it: Record<string, unknown>): number | null {
  const tryEntry = (r: Record<string, unknown>): number | null => {
    const nested =
      r.discount && typeof r.discount === "object" ? (r.discount as Record<string, unknown>) : null;
    const p =
      coerceFiniteNumber(nested?.percentageValue) ??
      coerceFiniteNumber(nested?.percentage) ??
      coerceFiniteNumber(r.percentageValue) ??
      coerceFiniteNumber(r.percentage) ??
      coerceFiniteNumber(r.percent);
    if (p != null && p > 0 && p <= 100) return p;
    return null;
  };
  const raw = it.discounts;
  if (Array.isArray(raw)) {
    for (const d of raw) {
      if (!d || typeof d !== "object") continue;
      const p = tryEntry(d as Record<string, unknown>);
      if (p != null) return p;
    }
  }
  if (it.discount && typeof it.discount === "object") {
    const p = tryEntry(it.discount as Record<string, unknown>);
    if (p != null) return p;
  }
  return null;
}

/**
 * When Bond sends **line** `discounts[]` with both a **percentage** and **discountAmount**, derive list + net so the UI
 * matches “X% off” (e.g. 10% → strike from savings/0.1, net = strike − savings). Falls back to {@link computeBondLineStrikeAmount} when not reconcilable.
 */
export function resolveBondLineDisplayAmounts(
  it: Record<string, unknown>,
  kind: CartLineKind
): { strike: number; net: number } | null {
  if (kind !== "booking" && kind !== "membership") return null;
  const savings = sumLineDiscountSavingsFromBond(it);
  if (savings == null || savings <= 0.005) return null;
  const pct = extractPercentFromBondDiscounts(it);
  if (pct == null || pct <= 0 || pct > 100) return null;

  const strikeFromSavings = savings / (pct / 100);
  if (!Number.isFinite(strikeFromSavings) || strikeFromSavings <= 0.005) return null;

  const expectedSavings = strikeFromSavings * (pct / 100);
  if (Math.abs(expectedSavings - savings) > 0.05) return null;

  const net = strikeFromSavings - savings;
  if (!Number.isFinite(net) || net < -0.005) return null;

  return { strike: strikeFromSavings, net: net < 0 ? 0 : net };
}

/**
 * List / pre-discount price for a Bond cart line: explicit list fields, `price` above line amount, or amount + line `discounts[]` savings.
 */
export function computeBondLineStrikeAmount(it: Record<string, unknown>, lineAmount: number): number | undefined {
  if (!Number.isFinite(lineAmount) || lineAmount < 0) return undefined;
  const explicit =
    coerceFiniteNumber(it.originalPrice) ??
    coerceFiniteNumber(it.listPrice) ??
    coerceFiniteNumber(it.grossPrice) ??
    coerceFiniteNumber(it.priceBeforeDiscount) ??
    null;
  if (explicit != null && explicit > lineAmount + 0.005) return Math.abs(explicit);

  const priceField = coerceFiniteNumber(it.price);
  if (priceField != null && priceField > lineAmount + 0.005) return Math.abs(priceField);

  const savings = sumLineDiscountSavingsFromBond(it);
  if (savings != null && savings > 0.005) return lineAmount + savings;

  return undefined;
}

/** Sum cart line amounts by Bond line kind (reservation vs membership vs add-on) for pricing footers. */
export function sumBondCartLineKindsFromCart(cart: OrganizationCartDto): {
  rentals: number;
  memberships: number;
  addons: number;
} {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) {
    return { rentals: 0, memberships: 0, addons: 0 };
  }
  const flat = flattenBondCartItemNodes(items);
  let rentals = 0;
  let memberships = 0;
  let addons = 0;
  for (const raw of flat) {
    if (!raw || typeof raw !== "object") continue;
    const it = raw as Record<string, unknown>;
    const n = cartItemLineAmountFromDto(it);
    if (n == null) continue;
    const k = classifyCartItemLineKind(it);
    if (k === "membership") memberships += n;
    else if (k === "addon") addons += n;
    else rentals += n;
  }
  return { rentals, memberships, addons };
}

/**
 * Bond often returns a **tree**: top-level `cartItems[]` may be wrappers (`productId` null) with priced lines under
 * `children[]` (court rental, add-ons, etc.). Depth-first pre-order — parent before descendants.
 */
export function flattenBondCartItemNodes(nodes: unknown[] | undefined): Record<string, unknown>[] {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];
  const out: Record<string, unknown>[] = [];
  for (const raw of nodes) {
    if (!raw || typeof raw !== "object") continue;
    const it = raw as Record<string, unknown>;
    out.push(it);
    const ch = it.children;
    if (Array.isArray(ch) && ch.length > 0) {
      out.push(...flattenBondCartItemNodes(ch));
    }
  }
  return out;
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
  const flat = flattenBondCartItemNodes(items);
  let sum = 0;
  let any = false;
  for (const it of flat) {
    const n = getCartItemLineAmount(it);
    if (n != null && n >= 0) {
      sum += n;
      any = true;
    }
  }
  return any ? sum : null;
}

/**
 * Roll up **gross** (pre–line-discount) subtotal, **net** charges, and savings so the footer can show
 * “Subtotal → Discount → Total” without double-counting (net-only subtotal would duplicate the discount row).
 */
function sumCartItemsGrossNetDiscountForTotals(cart: OrganizationCartDto): {
  lineGross: number | null;
  lineNet: number | null;
  lineDiscount: number | null;
} {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) {
    return { lineGross: null, lineNet: null, lineDiscount: null };
  }
  const flat = flattenBondCartItemNodes(items);
  let grossSum = 0;
  let netSum = 0;
  let discSum = 0;
  let any = false;
  let anyDisc = false;
  for (const raw of flat) {
    if (!raw || typeof raw !== "object") continue;
    const it = raw as Record<string, unknown>;
    const kind = classifyCartItemLineKind(it);
    if (kind === "booking" || kind === "membership") {
      const fromItem = getCartItemLineAmount(it);
      if (fromItem == null) continue;
      const resolved = resolveBondLineDisplayAmounts(it, kind);
      const priceField = coerceFiniteNumber(it.price);
      const amountField = coerceFiniteNumber(it.amount);
      let lineAmount = resolved?.net ?? fromItem;
      if (
        resolved == null &&
        amountField != null &&
        priceField != null &&
        priceField > amountField + 0.005
      ) {
        lineAmount = Math.abs(amountField);
      }
      const listHint =
        coerceFiniteNumber(it.listPrice) ??
        coerceFiniteNumber(it.originalPrice) ??
        coerceFiniteNumber(it.grossPrice) ??
        coerceFiniteNumber(it.priceBeforeDiscount);
      let strikeAmount = resolved?.strike ?? computeBondLineStrikeAmount(it, lineAmount);
      if (strikeAmount == null && listHint != null && listHint > lineAmount + 0.005) {
        strikeAmount = listHint;
      }
      if (
        strikeAmount == null &&
        priceField != null &&
        lineAmount != null &&
        priceField > lineAmount + 0.005
      ) {
        strikeAmount = Math.abs(priceField);
      }
      const gross = strikeAmount ?? lineAmount;
      grossSum += gross;
      netSum += lineAmount;
      if (gross > lineAmount + 0.005) {
        discSum += gross - lineAmount;
        anyDisc = true;
      }
      any = true;
      continue;
    }
    const addonAmt = getCartItemLineAmount(it);
    if (addonAmt == null) continue;
    grossSum += addonAmt;
    netSum += addonAmt;
    any = true;
  }
  return {
    lineGross: any ? grossSum : null,
    lineNet: any ? netSum : null,
    lineDiscount: anyDisc ? discSum : null,
  };
}

function lineAmountFromCart(cart: OrganizationCartDto): number | null {
  const sumLines = sumCartItemsLineAmount(cart);
  const o = cart as Record<string, unknown>;
  const sub = pickNonNegativeNumber(o, SUBTOTAL_KEYS);
  if (sumLines != null && sub != null && Math.abs(sumLines - sub) > 0.05) {
    return sumLines;
  }
  if (sub != null) return sub;
  const p = coerceFiniteNumber(o.price);
  if (p != null && p >= 0) return p;
  return sumLines;
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

/** Sum `taxes[].price` when Bond sends a `taxes` array instead of a single `tax` field. */
function sumTaxesArrayPrice(o: Record<string, unknown>): number | null {
  const raw = o.taxes;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  let sum = 0;
  let any = false;
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const n = coerceFiniteNumber((t as Record<string, unknown>).price);
    if (n != null) {
      sum += Math.abs(n);
      any = true;
    }
  }
  return any ? sum : null;
}

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

/** Cart-level discount missing but line `discounts[]` / `discount` carry savings (common on `OrganizationCartDto`). */
function sumCartItemLineDiscountSavings(cart: OrganizationCartDto): number | null {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return null;
  const flat = flattenBondCartItemNodes(items);
  let sum = 0;
  let any = false;
  for (const it of flat) {
    const s = sumLineDiscountSavingsFromBond(it);
    if (s != null && s > 0.0001) {
      sum += s;
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
  const rollup = sumCartItemsGrossNetDiscountForTotals(cart);
  const fromArray = sumBondCartDiscountArrayAbs(cart);
  const top = coerceFiniteNumber(o.discountAmount);
  const fromKeys = pickNonNegativeNumber(o, DISCOUNT_KEYS);
  const fromLineItems = sumCartItemLineDiscountSavings(cart);
  const discountAgg =
    fromArray != null && fromArray > 0
      ? fromArray
      : top != null
        ? Math.abs(top)
        : fromKeys != null
          ? fromKeys
          : fromLineItems != null && fromLineItems > 0.0001
            ? fromLineItems
            : rollup.lineDiscount != null && rollup.lineDiscount > 0.005
              ? rollup.lineDiscount
              : null;
  const line =
    rollup.lineGross != null ? rollup.lineGross : lineAmountFromCart(cart);
  return {
    line,
    discount: discountAgg,
    tax: pickNonNegativeNumber(o, TAX_KEYS) ?? sumTaxesArrayPrice(o),
    fee: pickNonNegativeNumber(o, FEE_KEYS),
    total: pickNonNegativeNumber(o, TOTAL_KEYS),
  };
}

/**
 * Single place to read **subtotal / discounts / tax / fees / total** from `OrganizationCartDto`
 * after `POST …/online-booking/create` (or preview). Prefer this over ad-hoc field reads in UI.
 */
export function getBondCartTotalsSummary(cart: OrganizationCartDto): {
  currency: string;
  lineSubtotal: number | null;
  discountTotal: number | null;
  taxTotal: number | null;
  feeTotal: number | null;
  grandTotal: number | null;
  /** True when `grandTotal` came from Bond top-level total-style fields. */
  totalFromBond: boolean;
} {
  const b = getOrganizationCartNumericBreakdown(cart);
  const o = cart as Record<string, unknown>;
  const currency =
    typeof cart.currency === "string" && cart.currency.length > 0
      ? cart.currency
      : typeof o.currency === "string" && o.currency.length > 0
        ? o.currency
        : "USD";
  const total = b.total;
  return {
    currency,
    lineSubtotal: b.line,
    discountTotal: b.discount,
    taxTotal: b.tax,
    feeTotal: b.fee,
    grandTotal: total ?? null,
    totalFromBond: total != null,
  };
}

/** Extract `product.id` from a Bond cart item — used to match against `approvalByProductId`. */
function cartItemProductId(it: Record<string, unknown>): number | null {
  const prod = it.product as Record<string, unknown> | undefined;
  const pid = typeof prod?.id === "number" ? prod.id : null;
  return pid != null && Number.isFinite(pid) && pid > 0 ? pid : null;
}

/** Round to 2 decimal places (matches the rest of the cart math). */
function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

function finiteNonNegative(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return null;
  return n;
}

/**
 * Per-item approval classification.
 *
 * Bond's `OrganizationCartItemDto` carries `metadata.purchaseType: "order" | "purchase"` —
 * `"order"` means the item is gated on facility approval and won't be charged unless approved.
 * Older payloads omit it; we fall back to the snapshot's `approvalByProductId` map (set at
 * add-to-cart time from the category's `requireApproval` flag).
 *
 * The historical `cartHasApprovalSplit = (minimumPrice < price)` heuristic was wrong — that
 * comparison is also true for any deposit-required cart, so deposit-only categories were being
 * shown as "approval split", which surfaced a bogus orange "Approval items" totals box.
 */
function isApprovalCartItem(
  it: Record<string, unknown>,
  approvalByProductId: Record<number, boolean> | undefined,
): boolean {
  const meta =
    it.metadata && typeof it.metadata === "object"
      ? (it.metadata as Record<string, unknown>)
      : null;
  const pt = meta?.purchaseType ?? it.purchaseType;
  if (pt === "order") return true;
  if (pt === "purchase") return false;
  const pid = cartItemProductId(it);
  if (pid != null && approvalByProductId?.[pid] === true) return true;
  return false;
}

type ApprovalSplitInfo = {
  /** True when at least one cart item is classified as approval. */
  hasApprovalItems: boolean;
  /** True when the cart is **mixed** — at least one approval AND at least one purchasable item. */
  hasMixedSplit: boolean;
  /** Sum of approval-classified line amounts (best-effort; null when no approval items). */
  approvalAmount: number | null;
  /** Sum of purchasable (non-approval) line amounts (best-effort; null when no purchasable items). */
  purchasableAmount: number | null;
};

/** Walk all cart items once and split them into approval vs purchasable buckets. */
function classifyCartApproval(
  cart: OrganizationCartDto,
  approvalByProductId?: Record<number, boolean>,
): ApprovalSplitInfo {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) {
    return { hasApprovalItems: false, hasMixedSplit: false, approvalAmount: null, purchasableAmount: null };
  }
  const flat = flattenBondCartItemNodes(items);
  let approvalAmount = 0;
  let purchasableAmount = 0;
  let approvalCount = 0;
  let purchasableCount = 0;
  for (const it of flat) {
    const amt = getCartItemLineAmount(it) ?? 0;
    if (isApprovalCartItem(it, approvalByProductId)) {
      approvalAmount += amt;
      approvalCount += 1;
    } else {
      purchasableAmount += amt;
      purchasableCount += 1;
    }
  }
  return {
    hasApprovalItems: approvalCount > 0,
    hasMixedSplit: approvalCount > 0 && purchasableCount > 0,
    approvalAmount: approvalCount > 0 ? roundCents(approvalAmount) : null,
    purchasableAmount: purchasableCount > 0 ? roundCents(purchasableAmount) : null,
  };
}

/**
 * "Pay full" amount — what the user is actually charged when paying in full from the bag.
 *
 * For a non-mixed cart we return Bond's whole-cart `price` (full payable). For a **mixed** cart
 * (some items require approval, some don't) we return `cart.price - approvalAmount` so the user
 * is not asked to pay for items still pending facility approval (this preserves proportional
 * tax / fees that Bond rolled into `cart.price`).
 *
 * When `cart.price` isn't on the payload (older / pending shapes), returns `null` so callers
 * like `bondCartPayableTotalForFinalize` can fall back to a line-walk sum that explicitly adds
 * cart-level tax / discount / fee.
 *
 * Note: Bond's `minimumPrice` / `minimumDownpayment` are the *minimum chargeable amount*
 * (i.e. the deposit), not "purchasable items minus approval items". Using `minimumPrice` for
 * "Pay full" caused the "Pay deposit" amount to show up where "Pay full" belonged.
 */
export function cartChargeableTotal(
  cart: OrganizationCartDto,
  approvalByProductId?: Record<number, boolean>,
): number | null {
  const split = classifyCartApproval(cart, approvalByProductId);
  if (split.hasApprovalItems && split.purchasableAmount == null) {
    return null;
  }
  const total = finiteNonNegative(cart.price);
  if (split.hasMixedSplit) {
    if (total == null || total <= BOND_KIND_LINE_MIN || split.approvalAmount == null) {
      return null;
    }
    const remaining = total - split.approvalAmount;
    if (remaining <= BOND_KIND_LINE_MIN) return null;
    return roundCents(remaining);
  }
  if (total == null || total <= BOND_KIND_LINE_MIN) return null;
  return roundCents(total);
}

/**
 * "Pay minimum due" amount — the **smallest `amountToPay` Bond will accept** on
 * `POST .../finalize`.
 *
 * Bond's contract (verified by the live `CART.INVALID_PAYMENT_AMOUNT` rejection on cart 296785):
 *   - `cart.price`         → full cart total (used for "Pay full")
 *   - `cart.minimumPrice`  → minimum amount Bond will accept on finalize (used for "Pay min")
 *   - `cart.downpayment`   → informational accounting field (deposit total)
 *   - `cart.minimumDownpayment` → informational accounting field; NOT the value to send
 *
 * Sending `minimumDownpayment` got us a 400 even when it equaled what the UI displayed. Bond
 * gates finalize on `minimumPrice`, so that's the value the cart "Pay min" button must use both
 * for display and for the request body.
 *
 * Two signals must agree before we expose a minimum payment option:
 *   1. **The product is configured for a deposit** (`cart.downpayment` or per-item
 *      `product.downpayment` on a booking line) — guards against carts where Bond's
 *      `minimumPrice` is just the add-on subtotal with no real deposit.
 *   2. **`minimumPrice` is genuinely lower than `price`** — otherwise "Pay min" and "Pay full"
 *      would land on the same number and the button is redundant.
 *
 * Returns `null` when either signal is missing.
 */
export function cartChargeableMinimum(cart: OrganizationCartDto): number | null {
  if (!productHasDownpayment(cart)) return null;
  const price = finiteNonNegative(cart.price);
  const minPrice = finiteNonNegative(cart.minimumPrice);
  if (minPrice == null || minPrice <= BOND_KIND_LINE_MIN) return null;
  if (price != null && price <= minPrice + BOND_KIND_LINE_MIN) return null;
  return roundCents(minPrice);
}

/**
 * True when at least one booking item in the cart has a non-zero deposit configured (either at
 * the cart level via `cart.downpayment` or on the per-item product). Add-on / membership lines
 * are excluded — only the rental booking opts a cart into the deposit flow.
 */
function productHasDownpayment(cart: OrganizationCartDto): boolean {
  const o = cart as Record<string, unknown>;
  const cartLevel =
    finiteNonNegative(cart.downpayment) ??
    finiteNonNegative((o as { downPayment?: unknown }).downPayment);
  if (cartLevel != null && cartLevel > BOND_KIND_LINE_MIN) return true;

  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return false;
  const flat = flattenBondCartItemNodes(items);
  for (const raw of flat) {
    if (!raw || typeof raw !== "object") continue;
    const it = raw as Record<string, unknown>;
    if (classifyCartItemLineKind(it) !== "booking") continue;
    const prod = (it.product as Record<string, unknown> | undefined) ?? null;
    const dp =
      finiteNonNegative(prod?.downpayment) ??
      finiteNonNegative(prod?.downPayment) ??
      finiteNonNegative(it.downpayment) ??
      finiteNonNegative(it.downPayment);
    if (dp != null && dp > BOND_KIND_LINE_MIN) return true;
  }
  return false;
}

/**
 * Dollar amount of approval-required items in the cart. Drives the "Approval items" subtotal
 * box on the mixed (deposit + approval) cart state. Returns `null` when the cart has no
 * approval items.
 */
export function cartApprovalSubtotal(
  cart: OrganizationCartDto,
  approvalByProductId?: Record<number, boolean>,
): number | null {
  return classifyCartApproval(cart, approvalByProductId).approvalAmount;
}

/**
 * True when the cart has **both** approval-required AND purchasable items. Use to switch the bag
 * rendering into the split / mixed state (state 1.3 in the cart designs).
 *
 * Pure-approval carts (`bagPolicy === "all_submission"`) and pure-purchasable carts return false.
 */
export function cartHasApprovalSplit(
  cart: OrganizationCartDto,
  approvalByProductId?: Record<number, boolean>,
): boolean {
  return classifyCartApproval(cart, approvalByProductId).hasMixedSplit;
}

/**
 * Dollar amount to send as `amountToPay` on `POST …/cart/{id}/finalize`.
 * Uses **Bond cart fields only** (including cart-level fees), not client-estimated card-processing fees.
 *
 * Routes through `cartChargeableTotal` (which now does per-item approval classification) so mixed
 * carts pay only the purchasable subset and pure deposit carts pay the full price.
 *
 * **Defensive fallback:** when the cart has no items / no payload data, keeps the historical
 * `approvalByProductId` line-walk path so in-flight carts don't regress.
 */
export function bondCartPayableTotalForFinalize(
  cart: OrganizationCartDto,
  approvalByProductId?: Record<number, boolean>
): number | null {
  const fromSpec = cartChargeableTotal(cart, approvalByProductId);
  if (fromSpec != null) return fromSpec;

  const hasApprovalFilter =
    approvalByProductId != null && Object.values(approvalByProductId).some(Boolean);

  if (!hasApprovalFilter) {
    const summary = getBondCartTotalsSummary(cart);
    if (summary.grandTotal != null && summary.grandTotal > BOND_KIND_LINE_MIN) {
      return Math.round(summary.grandTotal * 100) / 100;
    }
    const b = getOrganizationCartNumericBreakdown(cart);
    if (b.line == null) return null;
    const afterDisc = Math.max(0, b.line - (b.discount ?? 0));
    const withTax = afterDisc + (b.tax ?? 0);
    const withBondFees = withTax + (b.fee ?? 0);
    if (withBondFees <= BOND_KIND_LINE_MIN) return null;
    return Math.round(withBondFees * 100) / 100;
  }

  // Mixed cart: sum only payable (non-approval) line amounts line-by-line.
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return null;
  const flat = flattenBondCartItemNodes(items);
  let payableSum = 0;
  let any = false;
  for (const it of flat) {
    const pid = cartItemProductId(it);
    if (pid != null && approvalByProductId![pid] === true) continue;
    const amt = getCartItemLineAmount(it);
    if (amt == null) continue;
    payableSum += amt;
    any = true;
  }
  if (!any || payableSum <= BOND_KIND_LINE_MIN) return null;

  const b = getOrganizationCartNumericBreakdown(cart);
  const afterDisc = Math.max(0, payableSum - (b.discount ?? 0));
  const withTax = afterDisc + (b.tax ?? 0);
  const withFees = withTax + (b.fee ?? 0);
  if (withFees <= BOND_KIND_LINE_MIN) return null;
  return Math.round(withFees * 100) / 100;
}

/**
 * One session row: prefer **display line** strike/net (matches bag line items) over raw cart DTO rollup.
 */
export function aggregateSessionCartRowTotals(row: SessionCartSnapshot): {
  line: number | null;
  discount: number | null;
  tax: number | null;
  fee: number | null;
  total: number | null;
} {
  const base = getOrganizationCartNumericBreakdown(row.cart);
  const dl = row.displayLines;
  if (!dl || dl.length === 0) return base;
  let gross = 0;
  let net = 0;
  let count = 0;
  for (const l of dl) {
    if (typeof l.amount !== "number" || !Number.isFinite(l.amount)) continue;
    count++;
    net += l.amount;
    const s =
      typeof l.strikeAmount === "number" &&
      Number.isFinite(l.strikeAmount) &&
      l.strikeAmount > l.amount + 0.005
        ? l.strikeAmount
        : l.amount;
    gross += s;
  }
  if (count === 0) return base;
  const impliedDisc = Math.max(0, gross - net);
  if (impliedDisc > 0.005) {
    return {
      line: gross,
      discount: impliedDisc,
      tax: base.tax,
      fee: base.fee,
      total: base.total,
    };
  }
  return {
    line: net,
    discount: base.discount,
    tax: base.tax,
    fee: base.fee,
    total: base.total,
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
    const a = aggregateSessionCartRowTotals(row);
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
    discountTotal:
      discountAny && discountSum > BOND_KIND_LINE_MIN ? discountSum : null,
    taxTotal: taxAny ? taxSum : null,
    feeTotal: feeAny ? feeSum : null,
    cartGrandTotal: totalAllPresent && rows.length > 0 ? totalSum : null,
  };
}

/** Per–family-member aggregates (one Bond cart per “add to cart” submission). */
export function aggregateBagSnapshotsByLabel(rows: SessionCartSnapshot[]): {
  label: string;
  items: SessionCartGroupedItem[];
  totals: AggregatedBagTotals;
}[] {
  const groups = groupSessionCartSnapshotsByLabel(rows);
  return groups.map((g) => {
    const seen = new Set<number>();
    const uniqueRows = g.items.filter((it) => {
      if (seen.has(it.index)) return false;
      seen.add(it.index);
      return true;
    });
    return {
      label: g.label,
      items: g.items,
      totals: aggregateBagSnapshots(uniqueRows.map((x) => x.row)),
    };
  });
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

/** One display row per `OrganizationCartDto.taxes[]` entry (`name`, `rate`, `price`). */
function cartTaxRowsFromDto(cart: OrganizationCartDto): BondCartPricingDisplayRow[] {
  const o = cart as Record<string, unknown>;
  const raw = o.taxes;
  if (!Array.isArray(raw)) return [];
  const out: BondCartPricingDisplayRow[] = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const r = t as Record<string, unknown>;
    const name = typeof r.name === "string" && r.name.length > 0 ? r.name : "Tax";
    const price = coerceFiniteNumber(r.price);
    if (price == null || Math.abs(price) < 0.0001) continue;
    const rate = coerceFiniteNumber(r.rate);
    const detail = rate != null ? `${rate}%` : undefined;
    out.push({ label: name, amount: Math.abs(price), variant: "muted", detail });
  }
  return out;
}

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
  const taxLineRows = cartTaxRowsFromDto(cart);
  if (taxLineRows.length > 0) {
    for (const tr of taxLineRows) rows.push(tr);
  } else if (b.tax != null && b.tax > 0) {
    rows.push({ label: "Tax", amount: b.tax, variant: "muted" });
  }
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

/** Each entry in Bond `OrganizationCartDto.discounts[]` (see CartDiscountDto / hosted OpenAPI). */
function parseBondCartDiscountRows(cart: OrganizationCartDto): BondCartPricingDisplayRow[] {
  const o = cart as Record<string, unknown>;
  const raw = o.discounts;
  if (!Array.isArray(raw)) return [];
  const rows: BondCartPricingDisplayRow[] = [];
  const seenEntryIds = new Set<number>();
  const seenDiscountIds = new Set<number>();
  for (const d of raw) {
    if (!d || typeof d !== "object") continue;
    const r = d as Record<string, unknown>;
    const entryId = coerceFiniteNumber(r.id);
    if (entryId != null) {
      if (seenEntryIds.has(entryId)) continue;
      seenEntryIds.add(entryId);
    } else {
      const discountId = coerceFiniteNumber(r.discountId);
      if (discountId != null) {
        if (seenDiscountIds.has(discountId)) continue;
        seenDiscountIds.add(discountId);
      }
    }
    const amt = coerceFiniteNumber(r.discountAmount);
    const nested = r.discount && typeof r.discount === "object" ? (r.discount as Record<string, unknown>) : null;
    const reason =
      r.reason && typeof r.reason === "object" ? (r.reason as Record<string, unknown>) : null;
    const reasonText = reason && typeof reason.reason === "string" ? reason.reason : undefined;
    const displayName =
      resolveDiscountTriggerName(r, nested, reason) ??
      (nested && typeof nested.name === "string" && nested.name.length > 0 ? nested.name : "Discount");
    const pct = coerceFiniteNumber(nested?.percentageValue) ?? coerceFiniteNumber(r.percentage);
    const label = pct != null && pct > 0 ? `${displayName} (${pct}%)` : displayName;
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

export type BondCartReceiptLineItem = {
  id: string;
  title: string;
  amount: number;
  /** List price before line discount (when Bond sends `price` > `subtotal`). */
  strikeAmount?: number;
  /** Booking vs add-on vs membership — prefers `metadata.description` when Bond sends it. */
  kind: CartLineKind;
  /** e.g. Add-on, Slot add-on, Membership — from `kind` + `metadata.description`. */
  badge?: string;
  /** Promo / membership label from Bond line `discounts[]` when present. */
  discountNote?: string;
};

/**
 * One box per priced line — walks `cartItems[]` **and** nested `children[]` (Bond reservation tree).
 */
export function getBondCartReceiptLineItems(cart: OrganizationCartDto): BondCartReceiptLineItem[] {
  const items = cart.cartItems;
  if (!Array.isArray(items)) return [];
  const flat = flattenBondCartItemNodes(items);
  const out: BondCartReceiptLineItem[] = [];
  for (let i = 0; i < flat.length; i++) {
    const it = flat[i]!;
    const id =
      typeof it.id === "number" && Number.isFinite(it.id)
        ? String(it.id)
        : typeof it.ordinal === "number" && Number.isFinite(it.ordinal)
          ? `ord-${it.ordinal}-${i}`
          : `line-${i}`;
    const product = it.product as Record<string, unknown> | undefined;
    const title =
      product && typeof product.name === "string" && product.name.length > 0
        ? product.name
        : typeof it.productId === "number"
          ? `Product ${it.productId}`
          : "Line item";
    const netBond = getCartItemLineAmount(it);
    if (netBond == null) continue;
    const kind = classifyCartItemLineKind(it);
    const desc = getCartItemMetadataDescription(it);
    const badge = receiptBadgeForCartLine(kind, desc);
    /** Promo labels: rental + membership lines — Bond may echo the same promo on add-on rows; we hide on add-ons only. */
    const resolved = kind === "booking" || kind === "membership" ? resolveBondLineDisplayAmounts(it, kind) : null;
    const amount = resolved?.net ?? netBond;
    const strike =
      resolved?.strike ??
      (kind === "booking" || kind === "membership" ? computeBondLineStrikeAmount(it, amount) : undefined);
    const discountNote =
      kind === "booking" || kind === "membership"
        ? describeCartItemDiscountLabels(it)
        : undefined;
    out.push({
      id,
      title,
      amount,
      ...(strike != null ? { strikeAmount: strike } : {}),
      kind,
      badge,
      ...(discountNote ? { discountNote } : {}),
    });
  }
  return out;
}

/** Sums `cartItems[]` across session bag rows by Bond line kind (rentals vs `isAddon` vs membership product type). */
export function aggregateBagCartLineBuckets(rows: SessionCartSnapshot[]): {
  bookings: number;
  addons: number;
  memberships: number;
  fromLineItems: boolean;
} {
  let bookings = 0;
  let addons = 0;
  let memberships = 0;
  let fromLineItems = false;
  for (const row of rows) {
    const c = row.cart;
    const lines = getBondCartReceiptLineItems(c);
    if (lines.length > 0) {
      fromLineItems = true;
      for (const l of lines) {
        if (l.kind === "membership") memberships += l.amount;
        else if (l.kind === "addon") addons += l.amount;
        else bookings += l.amount;
      }
    } else {
      const b = getOrganizationCartNumericBreakdown(c);
      if (b.line != null && b.line > 0.0001) bookings += b.line;
    }
  }
  return { bookings, addons, memberships, fromLineItems };
}

function sumCartItemLineAmounts(cart: OrganizationCartDto): number | null {
  const lines = getBondCartReceiptLineItems(cart);
  if (lines.length === 0) return null;
  const sum = lines.reduce((s, x) => s + x.amount, 0);
  return sum > 0.0001 ? sum : null;
}

/**
 * Bottom receipt: **Subtotal** = sum of all `cartItems` (courts + add-ons + membership lines), then discounts, tax, total.
 * Does not repeat line items — use with `getBondCartReceiptLineItems`.
 */
export function getBondCartReceiptSummaryRows(cart: OrganizationCartDto): {
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

  const sumLines = sumCartItemLineAmounts(cart);
  const b = getOrganizationCartNumericBreakdown(cart);
  const cartSubApi = pickNonNegativeNumber(o, SUBTOTAL_KEYS);

  const rows: BondCartPricingDisplayRow[] = [];

  const merchandiseSub =
    sumLines != null && sumLines > 0.0001 ? sumLines : cartSubApi ?? b.line ?? null;
  if (merchandiseSub != null) {
    rows.push({ label: "Subtotal", amount: merchandiseSub, variant: "default" });
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

  const taxLineRows = cartTaxRowsFromDto(cart);
  if (taxLineRows.length > 0) {
    for (const tr of taxLineRows) rows.push(tr);
  } else {
    const tax = b.tax ?? pickNonNegativeNumber(o, TAX_KEYS);
    if (tax != null && tax > 0) rows.push({ label: "Tax", amount: tax, variant: "muted" });
  }
  const fee = pickNonNegativeNumber(o, FEE_KEYS);
  if (fee != null && fee > 0) rows.push({ label: "Fees", amount: fee, variant: "muted" });

  const total =
    pickNonNegativeNumber(o, TOTAL_KEYS) ??
    (() => {
      const p = coerceFiniteNumber(o.price);
      return p != null && p >= 0 ? p : null;
    })();

  if (total != null) rows.push({ label: "Total", amount: total, variant: "grand" });
  else if (merchandiseSub != null) rows.push({ label: "Total", amount: merchandiseSub, variant: "grand" });

  return { currency: cur, rows };
}

/**
 * @deprecated Prefer `getBondCartReceiptLineItems` + `getBondCartReceiptSummaryRows` for booking summary.
 */
export function getBondCartConfirmSummaryLines(cart: OrganizationCartDto): {
  currency: string;
  rows: BondCartPricingDisplayRow[];
} {
  const items = getBondCartReceiptLineItems(cart);
  const summary = getBondCartReceiptSummaryRows(cart);
  const cur = summary.currency;
  const rows: BondCartPricingDisplayRow[] = [];
  for (const it of items) {
    rows.push({ label: it.badge ? `${it.title} (${it.badge})` : it.title, amount: it.amount, variant: "default" });
  }
  for (const r of summary.rows) rows.push(r);
  return { currency: cur, rows };
}

/** Strike-through vs current price from first non–add-on priced row (walks `children[]`). */
export function getBondCartPrimaryLineStrike(cart: OrganizationCartDto): {
  original: number;
  current: number;
} | null {
  const items = cart.cartItems;
  if (!Array.isArray(items)) return null;
  const flat = flattenBondCartItemNodes(items);
  let it: Record<string, unknown> | null = null;
  for (const row of flat) {
    if (row.isAddon === true) continue;
    if (getCartItemLineAmount(row) == null) continue;
    it = row;
    break;
  }
  if (it == null) return null;
  const original = coerceFiniteNumber(it.price);
  const current = coerceFiniteNumber(it.subtotal) ?? coerceFiniteNumber(it.price);
  if (current == null) return null;
  if (original != null && original > current + 0.005) return { original, current };
  if (original != null) return { original, current };
  return null;
}
