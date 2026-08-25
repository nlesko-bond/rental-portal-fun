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

export function cartLooksPayable(cart: { price?: unknown; total?: unknown } | null | undefined): boolean {
  if (!cart) return false;
  const price = typeof cart.price === "number" ? cart.price : null;
  const total = typeof cart.total === "number" ? cart.total : null;
  const amount = price != null && Number.isFinite(price) ? price : total;
  return amount != null && Number.isFinite(amount) && amount > 0;
}
