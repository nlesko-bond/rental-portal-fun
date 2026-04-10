import type { ExtendedProductDto } from "@/types/online-booking";

const EPS = 0.005;

/** Member-only flag or a required “membership” product in the package. */
export function productMembershipGated(product: ExtendedProductDto | undefined): boolean {
  if (!product) return false;
  if (product.memberOnly) return true;
  if (product.isGated === true) return true;
  return (product.requiredProducts ?? []).some(
    (r) => String(r.productType ?? "").toLowerCase() === "membership"
  );
}

/** Currency for slot/matrix cells — always whole dollars/units, never “.00”. */
export function formatSlotCurrency(amount: number, currency: string): string {
  const n = Number(amount);
  const rounded = Number.isFinite(n) ? Math.round(n) : 0;
  try {
    let s = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
    s = s.replace(/\.00(?=\D*$)/, "");
    return s;
  } catch {
    return `${rounded} ${currency}`;
  }
}

export type SlotPriceTier = "standard" | "peak" | "off_peak";

/** True when the product lists more than one price row (schedule-based tiers possible). */
export function productHasVariableSchedulePricing(product: ExtendedProductDto | undefined): boolean {
  const n = product?.prices?.length ?? 0;
  return n > 1;
}

/** Reference unit used to label slots vs catalog (minimum listed price = baseline “standard”). */
export function referenceUnitPrice(product: ExtendedProductDto | undefined): number | null {
  if (!product?.prices?.length) return null;
  const nums = product.prices.map((p) => p.price).filter((x) => Number.isFinite(x));
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

/**
 * Bond `POST …/online-booking/create` slot `price` must be a **positive cash unit** when the venue charges
 * for the slot. Catalog rows can include **$0** (e.g. member list price); `Math.min` of those is wrong — use the
 * cheapest **positive** tier, else fall back to any finite price.
 */
export function cashUnitPriceForBondFallback(product: ExtendedProductDto | undefined): number | null {
  if (!product?.prices?.length) return null;
  const rows = product.prices.map((p) => p.price).filter((x) => Number.isFinite(x));
  if (rows.length === 0) return null;
  const positive = rows.filter((x) => x > 0);
  if (positive.length > 0) return Math.min(...positive);
  return Math.min(...rows);
}

/**
 * Legacy: compare one slot to catalog minimum price — prefer {@link slotPriceTierRelativeToPeers} for schedule grids.
 */
export function slotPriceTier(slotUnitPrice: number, reference: number | null): SlotPriceTier {
  if (reference == null || !Number.isFinite(reference) || !Number.isFinite(slotUnitPrice)) {
    return "standard";
  }
  if (slotUnitPrice > reference + EPS) return "peak";
  if (slotUnitPrice < reference - EPS) return "off_peak";
  return "standard";
}

/**
 * Labels slots vs **peers** on the same resource/day: **peak** = highest price; **off-peak** = lowest when there are
 * 3+ distinct prices; **standard** (Regular) = lower of two prices, or any middle tier when 3+.
 */
export function slotPriceTierRelativeToPeers(peerUnitPrices: number[], slotUnitPrice: number): SlotPriceTier {
  const nums = peerUnitPrices.filter((n) => Number.isFinite(n));
  if (nums.length === 0 || !Number.isFinite(slotUnitPrice)) return "standard";
  const r = (x: number) => Math.round(x * 100) / 100;
  const uniq = [...new Set(nums.map(r))].sort((a, b) => a - b);
  if (uniq.length < 2) return "standard";
  const lo = uniq[0]!;
  const hi = uniq[uniq.length - 1]!;
  const u = r(slotUnitPrice);
  if (uniq.length === 2) {
    if (Math.abs(u - lo) <= EPS) return "standard";
    if (Math.abs(u - hi) <= EPS) return "peak";
    return "standard";
  }
  if (u <= lo + EPS) return "off_peak";
  if (u >= hi - EPS) return "peak";
  return "standard";
}

/**
 * Display amount for a slot row. When the product is pro-rated, Bond often returns a **hourly** unit;
 * multiply by booked hours so changing duration updates the UI. Otherwise use API value as-is.
 */
export function slotDisplayTotalPrice(
  slotUnitPrice: number,
  product: ExtendedProductDto | undefined,
  durationMinutes: number
): number {
  if (!Number.isFinite(slotUnitPrice)) return slotUnitPrice;
  if (!product?.isProRated || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return slotUnitPrice;
  }
  return slotUnitPrice * (durationMinutes / 60);
}

/**
 * Slot/matrix/catalog price string. When the product is membership-gated and the
 * computed total rounds to zero, show “Free for members” instead of “$0”.
 */
export function formatSlotPriceDisplay(
  amount: number,
  currency: string,
  options?: { membershipGated?: boolean }
): string {
  if (
    options?.membershipGated &&
    Number.isFinite(amount) &&
    Math.abs(amount) < EPS
  ) {
    return "Free for members";
  }
  return formatSlotCurrency(amount, currency);
}

/** Lowest listed unit price for catalog chips (whole units). */
export function productCatalogMinUnitPrice(product: ExtendedProductDto): {
  min: number;
  currency: string;
} | null {
  const prices = product.prices ?? [];
  if (prices.length === 0) return null;
  const nums = prices.map((p) => p.price).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return null;
  return { min: Math.min(...nums), currency: prices[0]!.currency };
}

/** True when the catalog minimum is ~$0 and the product is membership-gated. */
export function productCatalogShowsMemberFree(product: ExtendedProductDto): boolean {
  const row = productCatalogMinUnitPrice(product);
  if (!row) return false;
  return productMembershipGated(product) && Math.abs(row.min) < EPS;
}

/** Every listed price is ~$0 (e.g. detail modal “free for members” when fully gated). */
export function productCatalogAllPricesNearZero(product: ExtendedProductDto): boolean {
  const nums = (product.prices ?? []).map((x) => x.price).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return false;
  return nums.every((n) => Math.abs(n) < EPS);
}
