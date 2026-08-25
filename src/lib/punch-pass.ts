import type { ExtendedProductDto, SimplePriceDto } from "@/types/online-booking";

const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const DEFAULT_PUNCH_COUNT = 1;
const DEFAULT_PUNCH_DURATION_MINUTES = 60;
const PACK_PRICE_NAME_RE = /\b(pack|pass)\b/i;
const DEMO_PACK_PRICE_AMOUNT = 150;
const DEMO_PACK_CURRENCY = "USD";

export type PunchPassProduct = {
  productId: number;
  name: string;
  punchCount: number;
  durationMinutes: number;
  packPrice: { amount: number; currency: string } | null;
};

export function isPunchPassProduct(product: ExtendedProductDto | undefined | null): boolean {
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
 * Pack price **Z** for a punch-pass SKU. Prefers a named Pack/Pass row, else the
 * highest positive price (so a $0 Visit row does not win like catalog min).
 */
export function punchPassPackPrice(product: ExtendedProductDto): { amount: number; currency: string } | null {
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

export function parsePunchPassProduct(product: ExtendedProductDto): PunchPassProduct | null {
  if (!isPunchPassProduct(product)) return null;
  const qty = product.quantity;
  const punchCount = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : DEFAULT_PUNCH_COUNT;
  const fromDuration = durationToMinutes(product.duration);
  const durationMinutes =
    fromDuration != null && Number.isFinite(fromDuration) && fromDuration > 0
      ? fromDuration
      : DEFAULT_PUNCH_DURATION_MINUTES;
  return {
    productId: product.id,
    name: product.name,
    punchCount,
    durationMinutes,
    packPrice: punchPassPackPrice(product) ?? {
      amount: DEMO_PACK_PRICE_AMOUNT,
      currency: DEMO_PACK_CURRENCY,
    },
  };
}

/** One punch is spent per picked slot of the pass duration. */
export function punchesNeededForSlots(slotCount: number): number {
  if (!Number.isFinite(slotCount) || slotCount <= 0) return 0;
  return Math.floor(slotCount);
}

export type PunchPassCheckoutKind = "redeem" | "buyAndRedeem";

/** Checkout payload for a punch-pass SKU: buy a pack then redeem, or redeem only. */
export type PunchPassCheckout = {
  kind: PunchPassCheckoutKind;
  punchesNeeded: number;
  remainingAfter: number;
  packName: string;
  punchCount: number;
  packAmount: number;
  packCurrency: string;
};

/** Max slots in one checkout: remaining punches plus one new pack. */
export function punchPassSlotCap(pass: PunchPassProduct, remaining: number): number {
  const held = Math.max(0, Math.floor(remaining));
  return held + pass.punchCount;
}

/**
 * First visit with no remaining punches buys the pack and redeems the picked
 * slots in one checkout. Later visits redeem only, until remaining is short.
 */
export function resolvePunchPassCheckout(
  pass: PunchPassProduct,
  remaining: number,
  slotCount: number
): PunchPassCheckout | null {
  const punchesNeeded = punchesNeededForSlots(slotCount);
  if (punchesNeeded <= 0) return null;
  const remainingBefore = Math.max(0, Math.floor(remaining));
  const packAmount = pass.packPrice?.amount ?? 0;
  const packCurrency = pass.packPrice?.currency ?? DEMO_PACK_CURRENCY;
  const shared = {
    punchesNeeded,
    packName: pass.name,
    punchCount: pass.punchCount,
    packAmount,
    packCurrency,
  };
  if (remainingBefore >= punchesNeeded) {
    return {
      kind: "redeem",
      remainingAfter: remainingBefore - punchesNeeded,
      ...shared,
    };
  }
  const remainingAfter = remainingBefore + pass.punchCount - punchesNeeded;
  if (remainingAfter < 0) return null;
  return {
    kind: "buyAndRedeem",
    remainingAfter,
    ...shared,
  };
}

/** Snapshot of a punch-pass checkout so the bag still shows the pack after slots are cleared. */
export type PunchPassCartPurchase = {
  kind: PunchPassCheckoutKind;
  productId: number;
  packName: string;
  punchCount: number;
  packAmount: number;
  punchesNeeded: number;
  packSubtitle: string;
  visitSubtitle: string;
};

export function punchPassCartPurchaseForSnapshot(
  pass: PunchPassProduct,
  checkout: PunchPassCheckout,
  copy: { packSubtitle: string; visitSubtitle: string }
): PunchPassCartPurchase {
  return {
    kind: checkout.kind,
    productId: pass.productId,
    packName: checkout.packName,
    punchCount: checkout.punchCount,
    packAmount: checkout.kind === "buyAndRedeem" ? checkout.packAmount : 0,
    punchesNeeded: checkout.punchesNeeded,
    packSubtitle: copy.packSubtitle,
    visitSubtitle: copy.visitSubtitle,
  };
}

export function punchPassPackDisplayAmount(purchase: PunchPassCartPurchase | undefined | null): number {
  if (purchase == null || purchase.kind !== "buyAndRedeem") return 0;
  const amount = purchase.packAmount;
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

/** Sum of demo pack amounts on session cart rows when Bond has not invoiced the pack. */
export function punchPassPackDueOnSnapshots(
  rows: ReadonlyArray<{ punchPassPurchase?: PunchPassCartPurchase | null }>
): number {
  return rows.reduce((sum, row) => sum + punchPassPackDisplayAmount(row.punchPassPurchase), 0);
}

export function cartLooksPayable(cart: { price?: unknown; total?: unknown } | null | undefined): boolean {
  if (!cart) return false;
  const price = typeof cart.price === "number" ? cart.price : null;
  const total = typeof cart.total === "number" ? cart.total : null;
  const amount = price != null && Number.isFinite(price) ? price : total;
  return amount != null && Number.isFinite(amount) && amount > 0;
}
