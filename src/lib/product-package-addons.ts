import type { ExtendedProductDto, SimplePriceDto } from "@/types/online-booking";
import { slotDurationMinutes } from "@/lib/slot-selection";

/** Bond `packages[].level` for optional add-ons (`isAddon: true`). */
export type AddonBillingLevel = "reservation" | "slot" | "hour";

/** Normalized add-on from `product.packages` where `isAddon === true`, plus legacy discovery paths. */
export type PackageAddonLine = {
  id: number;
  name: string;
  description?: string;
  prices: SimplePriceDto[];
  level: AddonBillingLevel;
  /** Upsell price on the package row when present (may differ from nested `product.prices`). */
  packagePrice?: number;
};

function numId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizePrices(v: unknown): SimplePriceDto[] {
  if (!Array.isArray(v)) return [];
  const out: SimplePriceDto[] = [];
  for (const p of v) {
    if (!p || typeof p !== "object") continue;
    const o = p as Record<string, unknown>;
    const id = numId(o.id);
    const orgId = numId(o.organizationId) ?? 0;
    const price = typeof o.price === "number" ? o.price : Number(o.price);
    const currency = typeof o.currency === "string" ? o.currency : "USD";
    if (id == null || !Number.isFinite(price)) continue;
    out.push({
      id,
      organizationId: orgId,
      name: typeof o.name === "string" ? o.name : undefined,
      price,
      currency,
      startDate: typeof o.startDate === "string" ? o.startDate : undefined,
      endDate: typeof o.endDate === "string" ? o.endDate : undefined,
    });
  }
  return out;
}

export function parseAddonBillingLevel(v: unknown): AddonBillingLevel {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "slot" || s === "slots" || s === "timeslot" || s === "time_slot") return "slot";
  if (s === "hour" || s === "hours") return "hour";
  if (s === "reservation" || s === "booking" || s === "session" || s === "visit") return "reservation";
  return "reservation";
}

export function addonLevelLabel(level: AddonBillingLevel): string {
  if (level === "reservation") return "Per reservation";
  if (level === "slot") return "Per slot";
  return "Per hour";
}

export function addonPriceSuffixForLevel(level: AddonBillingLevel): string {
  if (level === "reservation") return " / reservation";
  if (level === "slot") return " / slot";
  return " / hr";
}

/** Strip HTML for card copy (Bond descriptions are often rich text). */
export function plainAddonDescription(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const t = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Display amount + currency for an add-on: prefer package `price`, then nested product prices.
 */
export function resolveAddonDisplayPrice(a: PackageAddonLine): { price: number; currency: string } | null {
  if (typeof a.packagePrice === "number" && Number.isFinite(a.packagePrice)) {
    const cur = a.prices[0]?.currency ?? "USD";
    return { price: a.packagePrice, currency: cur };
  }
  const pr = a.prices[0];
  if (!pr || !Number.isFinite(pr.price)) return null;
  return { price: pr.price, currency: pr.currency };
}

/**
 * Estimated charge for one time slot: flat for `slot` level; `hour` rate × slot duration in hours.
 */
export function addonEstimatedChargeForSlot(
  addon: PackageAddonLine,
  slot: { startDate: string; endDate: string; startTime: string; endTime: string }
): { amount: number; currency: string } | null {
  const base = resolveAddonDisplayPrice(addon);
  if (!base) return null;
  if (addon.level === "hour") {
    const hrs = slotDurationMinutes(slot) / 60;
    if (!Number.isFinite(hrs) || hrs <= 0) return null;
    return { amount: base.price * hrs, currency: base.currency };
  }
  if (addon.level === "slot") {
    return { amount: base.price, currency: base.currency };
  }
  return null;
}

function ingestProductLike(
  raw: unknown,
  seen: Set<number>,
  out: PackageAddonLine[],
  level: AddonBillingLevel,
  packagePrice?: number
): void {
  if (!raw || typeof raw !== "object") return;
  const o = raw as Record<string, unknown>;
  const inner = o.product ?? o.addon ?? o.productDto;
  if (inner && typeof inner === "object") {
    ingestProductLike(inner, seen, out, level, packagePrice);
    return;
  }
  const id = numId(o.id);
  if (id == null || seen.has(id)) return;
  const name =
    typeof o.name === "string"
      ? o.name.trim()
      : typeof o.title === "string"
        ? o.title.trim()
        : "";
  const prices = normalizePrices(o.prices);
  seen.add(id);
  out.push({
    id,
    name: name || `Add-on ${id}`,
    description: typeof o.description === "string" ? o.description : undefined,
    prices,
    level,
    packagePrice,
  });
}

function ingestIsAddonPackage(pkg: Record<string, unknown>, seen: Set<number>, out: PackageAddonLine[]): void {
  if (pkg.isAddon !== true) return;
  const packagePrice =
    typeof pkg.price === "number" && Number.isFinite(pkg.price) ? pkg.price : undefined;
  const level = parseAddonBillingLevel(pkg.level);
  const inner = pkg.product;
  if (inner && typeof inner === "object") {
    ingestProductLike(inner, seen, out, level, packagePrice);
  }
}

/** Only `packages` rows with `isAddon: true` (and nested package arrays). */
function walkAddonPackagesOnly(packages: unknown[], seen: Set<number>, out: PackageAddonLine[], depth: number): void {
  if (depth <= 0) return;
  for (const pkg of packages) {
    if (!pkg || typeof pkg !== "object") continue;
    const pk = pkg as Record<string, unknown>;
    if (pk.isAddon === true) ingestIsAddonPackage(pk, seen, out);
    const nested = pk.nestedPackages ?? pk.packages ?? pk.children;
    if (Array.isArray(nested)) walkAddonPackagesOnly(nested, seen, out, depth - 1);
  }
}

export type PackageAddonsOptions = {
  /** When true, also merges `requiredProducts` (memberships, etc.). Default true. */
  includeRequired?: boolean;
};

/**
 * Pulls optional add-ons from Bond category product payloads.
 * **Booking UI:** pass `{ includeRequired: false }` so optional add-ons come from `packages` only.
 */
export function packageAddonsFromProduct(
  product: ExtendedProductDto,
  opts?: PackageAddonsOptions
): PackageAddonLine[] {
  const includeRequired = opts?.includeRequired !== false;
  const seen = new Set<number>();
  const out: PackageAddonLine[] = [];

  const pkgs = (product as Record<string, unknown>).packages;
  if (Array.isArray(pkgs)) walkAddonPackagesOnly(pkgs, seen, out, 8);

  const top = (product as Record<string, unknown>).packageAddons;
  if (Array.isArray(top)) {
    for (const item of top) ingestProductLike(item, seen, out, "reservation", undefined);
  }

  if (includeRequired) {
    for (const rp of product.requiredProducts ?? []) {
      ingestProductLike(rp, seen, out, "reservation", undefined);
    }
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function isMembershipRef(o: Record<string, unknown>): boolean {
  const pt = String(o.productType ?? o.type ?? "").toLowerCase();
  return pt === "membership";
}

const TOP_LEVEL_ADDON_KEYS = [
  "optionalAddons",
  "optionalAddOns",
  "addonProducts",
  "addOnProducts",
  "linkedProducts",
  "packageAddons",
] as const;

/**
 * Optional add-ons for the booking flow: `packages` entries with `isAddon: true` (with `level`),
 * plus common top-level arrays and non-membership required products (defaults to per-reservation).
 */
export function bookingOptionalAddons(product: ExtendedProductDto): PackageAddonLine[] {
  const seen = new Set<number>();
  const out: PackageAddonLine[] = [];
  const root = product as Record<string, unknown>;

  const pkgs = root.packages;
  if (Array.isArray(pkgs)) walkAddonPackagesOnly(pkgs, seen, out, 8);

  const pkgAddons = root.packageAddons;
  if (Array.isArray(pkgAddons)) {
    for (const item of pkgAddons) ingestProductLike(item, seen, out, "reservation", undefined);
  }

  for (const key of TOP_LEVEL_ADDON_KEYS) {
    const arr = root[key];
    if (Array.isArray(arr)) {
      for (const item of arr) ingestProductLike(item, seen, out, "reservation", undefined);
    }
  }

  for (const rp of product.requiredProducts ?? []) {
    const o = rp as Record<string, unknown>;
    if (isMembershipRef(o)) continue;
    ingestProductLike(rp, seen, out, "reservation", undefined);
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function partitionAddonsByLevel(addons: PackageAddonLine[]): {
  reservation: PackageAddonLine[];
  slotOrHour: PackageAddonLine[];
} {
  const reservation: PackageAddonLine[] = [];
  const slotOrHour: PackageAddonLine[] = [];
  for (const a of addons) {
    if (a.level === "reservation") reservation.push(a);
    else slotOrHour.push(a);
  }
  return { reservation, slotOrHour };
}

/** @deprecated Prefer `addonPriceSuffixForLevel(a.level)`. */
export type AddonPriceKind = "per_hour" | "per_reservation" | "unknown";

/** @deprecated Prefer `addonPriceSuffixForLevel`. */
export function inferAddonPriceKind(price: SimplePriceDto | undefined, productIsProRated?: boolean): AddonPriceKind {
  if (!price) return "unknown";
  const n = (price.name ?? "").toLowerCase();
  if (/hour|hr\b|60\s*min|per\s*hour/i.test(n)) return "per_hour";
  if (/session|booking|reservation|visit|event|flat|one[-\s]?time/i.test(n)) return "per_reservation";
  if (productIsProRated) return "per_hour";
  return "unknown";
}

/** @deprecated Prefer `addonPriceSuffixForLevel`. */
export function formatAddonPriceSuffix(kind: AddonPriceKind): string {
  if (kind === "per_hour") return "/ hr";
  if (kind === "per_reservation") return "/ reservation";
  return "";
}
