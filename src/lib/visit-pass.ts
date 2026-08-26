import type { ExtendedProductDto, SimplePriceDto } from "@/types/online-booking";

const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const DEFAULT_VISIT_COUNT = 1;
const DEFAULT_VISIT_DURATION_MINUTES = 60;
const PACK_PRICE_NAME_RE = /\b(pack|pass)\b/i;
const DEMO_PACK_PRICE_AMOUNT = 150;
const DEMO_PACK_CURRENCY = "USD";

export type VisitPassProduct = {
  productId: number;
  name: string;
  visitCount: number;
  durationMinutes: number;
  packPrice: { amount: number; currency: string } | null;
};

export function isVisitPassProduct(product: ExtendedProductDto | undefined | null): boolean {
  return product?.isPunchPass === true;
}

function durationToMinutes(duration: { amount: number; unit: string } | undefined): number | null {
  if (!duration) return null;
  const amount = duration.amount;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const unit = duration.unit.trim().toLowerCase();
  switch (unit) {
    case "minute":
    case "minutes":
      return amount;
    case "hour":
    case "hours":
      return amount * MINUTES_PER_HOUR;
    case "second":
    case "seconds":
      return amount / SECONDS_PER_MINUTE;
    case "day":
    case "days":
      return amount * MINUTES_PER_DAY;
    case "week":
    case "weeks":
    case "month":
    case "months":
    case "year":
    case "years":
      return null;
    default:
      return null;
  }
}

function finitePrices(prices: SimplePriceDto[] | undefined): SimplePriceDto[] {
  if (!Array.isArray(prices)) return [];
  return prices.filter((row) => Number.isFinite(row.price));
}

/**
 * Pack price **Z** for a visit-pass SKU. Prefers a named Pack/Pass row, else the
 * highest positive price (so a $0 Visit row does not win like catalog min).
 */
export function visitPassPackPrice(product: ExtendedProductDto): { amount: number; currency: string } | null {
  const rows = finitePrices(product.prices);
  if (rows.length === 0) return null;
  const named = rows.find((row) => typeof row.name === "string" && PACK_PRICE_NAME_RE.test(row.name));
  if (named) {
    return { amount: named.price, currency: named.currency };
  }
  const positive = rows.filter((row) => row.price > 0);
  const chosen = positive.length > 0
    ? positive.reduce((best, row) => (row.price > best.price ? row : best))
    : rows[0]!;
  return { amount: chosen.price, currency: chosen.currency };
}

export function parseVisitPassProduct(product: ExtendedProductDto): VisitPassProduct | null {
  if (!isVisitPassProduct(product)) return null;
  const qty = product.quantity;
  const visitCount = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : DEFAULT_VISIT_COUNT;
  const fromDuration = durationToMinutes(product.duration);
  const durationMinutes =
    fromDuration != null && Number.isFinite(fromDuration) && fromDuration > 0
      ? fromDuration
      : DEFAULT_VISIT_DURATION_MINUTES;
  return {
    productId: product.id,
    name: product.name,
    visitCount,
    durationMinutes,
    packPrice: visitPassPackPrice(product) ?? {
      amount: DEMO_PACK_PRICE_AMOUNT,
      currency: DEMO_PACK_CURRENCY,
    },
  };
}

/** One visit is spent per picked slot of the pass duration. */
export function visitsNeededForSlots(slotCount: number): number {
  if (!Number.isFinite(slotCount) || slotCount <= 0) return 0;
  return Math.floor(slotCount);
}

export type VisitPassCheckoutKind = "redeem" | "buyAndRedeem";

/** Checkout payload for a visit-pass SKU: buy a pack then redeem, or redeem only. */
export type VisitPassCheckout = {
  kind: VisitPassCheckoutKind;
  visitsNeeded: number;
  remainingAfter: number;
  packName: string;
  visitCount: number;
  packAmount: number;
  packCurrency: string;
};

/** Max slots in one checkout: remaining visits plus one new pack. */
export function visitPassSlotCap(pass: VisitPassProduct, remaining: number): number {
  const held = Math.max(0, Math.floor(remaining));
  return held + pass.visitCount;
}

const VISIT_METER_MAX_PERCENT = 100;

/** Fill percent for the remaining-visits meter (remaining / total). */
export function visitPassFillPercent(remaining: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const held = Math.max(0, remaining);
  return Math.min(VISIT_METER_MAX_PERCENT, Math.round((held / total) * VISIT_METER_MAX_PERCENT));
}

/**
 * True when the shopper still has visits and this checkout would spend past them
 * (the extra visits buy another pack). First-time buy (0 remaining) is not a warning.
 */
export function visitPassOverflowsHeldVisits(remaining: number, slotCount: number): boolean {
  const held = Math.max(0, Math.floor(remaining));
  return held > 0 && slotCount > held;
}

/**
 * First visit with no remaining visits buys the pack and redeems the picked
 * slots in one checkout. Later visits redeem only, until remaining is short.
 */
export function resolveVisitPassCheckout(
  pass: VisitPassProduct,
  remaining: number,
  slotCount: number
): VisitPassCheckout | null {
  const visitsNeeded = visitsNeededForSlots(slotCount);
  if (visitsNeeded <= 0) return null;
  const remainingBefore = Math.max(0, Math.floor(remaining));
  const packAmount = pass.packPrice?.amount ?? 0;
  const packCurrency = pass.packPrice?.currency ?? DEMO_PACK_CURRENCY;
  const shared = {
    visitsNeeded,
    packName: pass.name,
    visitCount: pass.visitCount,
    packAmount,
    packCurrency,
  };
  if (remainingBefore >= visitsNeeded) {
    return {
      kind: "redeem",
      remainingAfter: remainingBefore - visitsNeeded,
      ...shared,
    };
  }
  const remainingAfter = remainingBefore + pass.visitCount - visitsNeeded;
  if (remainingAfter < 0) return null;
  return {
    kind: "buyAndRedeem",
    remainingAfter,
    ...shared,
  };
}

/** Snapshot of a visit-pass checkout so the bag still shows the pack after slots are cleared. */
export type VisitPassCartPurchase = {
  kind: VisitPassCheckoutKind;
  productId: number;
  packName: string;
  visitCount: number;
  packAmount: number;
  visitsNeeded: number;
  packSubtitle: string;
  visitSubtitle: string;
};

export function visitPassCartPurchaseForSnapshot(
  pass: VisitPassProduct,
  checkout: VisitPassCheckout,
  copy: { packSubtitle: string; visitSubtitle: string }
): VisitPassCartPurchase {
  return {
    kind: checkout.kind,
    productId: pass.productId,
    packName: checkout.packName,
    visitCount: checkout.visitCount,
    packAmount: checkout.kind === "buyAndRedeem" ? checkout.packAmount : 0,
    visitsNeeded: checkout.visitsNeeded,
    packSubtitle: copy.packSubtitle,
    visitSubtitle: copy.visitSubtitle,
  };
}

export function visitPassPackDisplayAmount(purchase: VisitPassCartPurchase | undefined | null): number {
  if (purchase == null || purchase.kind !== "buyAndRedeem") return 0;
  const amount = purchase.packAmount;
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

/** Sum of demo pack amounts on session cart rows when Bond has not invoiced the pack. */
export function visitPassPackDueOnSnapshots(
  rows: ReadonlyArray<{ visitPassPurchase?: VisitPassCartPurchase | null }>
): number {
  return rows.reduce((sum, row) => sum + visitPassPackDisplayAmount(row.visitPassPurchase), 0);
}

export function cartLooksPayable(cart: { price?: unknown; total?: unknown } | null | undefined): boolean {
  if (!cart) return false;
  const price = typeof cart.price === "number" ? cart.price : null;
  const total = typeof cart.total === "number" ? cart.total : null;
  const amount = price != null && Number.isFinite(price) ? price : total;
  return amount != null && Number.isFinite(amount) && amount > 0;
}
