import { formatPickedSlotLongDate, formatPickedSlotTimeRange } from "@/components/booking/booking-slot-labels";
import { formatDurationPriceBadge } from "@/lib/category-booking-settings";
import { classifyCartItemLineKind } from "@/lib/bond-cart-item-classify";
import { titleFromCartItem } from "@/lib/cart-purchase-lines";
import {
  cartItemLineAmountFromDto,
  computeBondLineStrikeAmount,
  describeCartItemDiscountLabels,
  flattenBondCartItemNodes,
  resolveBondLineDisplayAmounts,
} from "@/lib/checkout-bag-totals";
import { dedupeDiscountCaptionSegments, describeEntitlementsForDisplay } from "@/lib/entitlement-discount";
import type { SessionCartDisplayLine } from "@/lib/session-cart-snapshot";
import { slotDurationMinutes, type PickedSlot } from "@/lib/slot-selection";
import type { ExtendedProductDto, OrganizationCartDto } from "@/types/online-booking";

/** Names of membership products that gate pricing on the catalog (from `requiredProducts`). */
export function membershipGateProductNames(product: ExtendedProductDto | undefined): string[] {
  if (!product?.requiredProducts?.length) return [];
  return product.requiredProducts
    .filter((r) => String(r.productType ?? "").toLowerCase() === "membership")
    .map((r) =>
      typeof r.name === "string" && r.name.trim().length > 0 ? r.name.trim() : `Product ${r.id}`
    );
}

function mergeDiscountLabels(a: string | undefined, b: string | undefined): string | undefined {
  const parts = [a, b].filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
  return dedupeDiscountCaptionSegments(parts.length > 0 ? parts.join(" · ") : undefined);
}

/** Stable catalog id for deduping duplicate flattened Bond rows (e.g. same gate twice). */
function catalogProductIdFromCartItem(it: Record<string, unknown>): number | null {
  for (const k of ["productId", "catalogProductId"] as const) {
    const v = it[k];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  }
  const rootId = it.id;
  if (typeof rootId === "number" && Number.isFinite(rootId) && rootId > 0) return rootId;
  const p = it.product;
  if (p && typeof p === "object") {
    const pr = p as Record<string, unknown>;
    for (const k of ["id", "productId"] as const) {
      const v = pr[k];
      if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    }
  }
  return null;
}

function roundPriceKey(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Groups picked slots by matching list unit (schedule or display) + duration; emits resource line,
 * optional `$X | per Nhr × count` lines when `formatMoney` is set, and `Date | time1, time2` lines.
 * Multi-date groups within the same price/duration get one calendar line per date.
 */
export function buildGroupedScheduleSummaryLines(
  slots: PickedSlot[],
  opts?: { formatMoney?: (amount: number) => string; bookingForLabel?: string }
): string[] {
  if (slots.length === 0) return [];

  const sorted = [...slots].sort((a, b) => {
    const d = a.startDate.localeCompare(b.startDate);
    if (d !== 0) return d;
    return a.startTime.localeCompare(b.startTime);
  });

  const resources = [...new Set(sorted.map((s) => s.resourceName.trim()).filter(Boolean))];
  const resourceLine =
    resources.length === 0 ? "" : resources.length === 1 ? resources[0]! : resources.join(", ");

  type Bucket = { unitKey: number; durationMins: number; slots: PickedSlot[] };
  const buckets = new Map<string, Bucket>();
  for (const s of sorted) {
    const listUnit =
      typeof s.scheduleUnitPrice === "number" && Number.isFinite(s.scheduleUnitPrice) && s.scheduleUnitPrice > 0
        ? s.scheduleUnitPrice
        : typeof s.price === "number" && Number.isFinite(s.price)
          ? s.price
          : 0;
    const dur = Math.max(1, Math.round(slotDurationMinutes(s)));
    const key = `${roundPriceKey(listUnit)}|${dur}`;
    const prev = buckets.get(key);
    if (prev) prev.slots.push(s);
    else buckets.set(key, { unitKey: roundPriceKey(listUnit), durationMins: dur, slots: [s] });
  }

  const priceDurLines: string[] = [];
  const calendarLines: string[] = [];
  const formatMoney = opts?.formatMoney;

  for (const b of buckets.values()) {
    const byDate = new Map<string, PickedSlot[]>();
    for (const s of b.slots) {
      const arr = byDate.get(s.startDate) ?? [];
      arr.push(s);
      byDate.set(s.startDate, arr);
    }
    const dates = [...byDate.keys()].sort();
    const count = b.slots.length;
    const listUnit =
      typeof b.slots[0]!.scheduleUnitPrice === "number" &&
      Number.isFinite(b.slots[0]!.scheduleUnitPrice) &&
      b.slots[0]!.scheduleUnitPrice > 0
        ? b.slots[0]!.scheduleUnitPrice
        : b.slots[0]!.price;

    if (formatMoney && listUnit > 0) {
      priceDurLines.push(
        `${formatMoney(listUnit)} | per ${formatDurationPriceBadge(b.durationMins)} × ${count}`
      );
    }

    for (const date of dates) {
      const daySlots = byDate.get(date)!;
      const longDate = formatPickedSlotLongDate(daySlots[0]!);
      const times = daySlots.map((s) => formatPickedSlotTimeRange(s)).join(", ");
      calendarLines.push(`${longDate} | ${times}`);
    }
  }

  const out: string[] = [];
  if (resourceLine.length > 0) out.push(resourceLine);
  out.push(...priceDurLines, ...calendarLines);

  if (opts?.bookingForLabel && opts.bookingForLabel.trim().length > 0) {
    out.push(`For ${opts.bookingForLabel.trim()}`);
  }

  return out.length > 0 ? out : ["Reservation details"];
}

export function formatScheduleSummaryForBooking(
  slots: PickedSlot[],
  bookingForLabel?: string,
  formatMoney?: (amount: number) => string
): string {
  return buildGroupedScheduleSummaryLines(slots, { formatMoney, bookingForLabel }).join("\n");
}

/** @deprecated Prefer {@link formatScheduleSummaryForBooking} — kept for one-off legacy meta strings. */
function scheduleSummaryFromSlots(slots: PickedSlot[], bookingForLabel?: string): string {
  return formatScheduleSummaryForBooking(slots, bookingForLabel);
}

function mergeKeyForExtraLine(
  kind: "membership" | "addon",
  it: Record<string, unknown>,
  titleBase: string
): string {
  const pid = catalogProductIdFromCartItem(it);
  if (pid != null) return `${kind}:${pid}`;
  return `${kind}:title:${titleBase.trim()}`;
}

function addOrMergeExtraLine(
  bucket: Map<string, SessionCartDisplayLine>,
  order: string[],
  key: string,
  line: SessionCartDisplayLine
): void {
  const prev = bucket.get(key);
  if (prev == null) {
    bucket.set(key, line);
    order.push(key);
    return;
  }
  const a = prev.amount;
  const b = line.amount;
  prev.amount =
    typeof a === "number" && Number.isFinite(a) && typeof b === "number" && Number.isFinite(b)
      ? a + b
      : (b ?? a ?? null);
  const sa = prev.strikeAmount;
  const sb = line.strikeAmount;
  if (typeof sa === "number" && Number.isFinite(sa) && typeof sb === "number" && Number.isFinite(sb)) {
    prev.strikeAmount = sa + sb;
  } else if (sb != null && prev.strikeAmount == null) {
    prev.strikeAmount = sb;
  }
  prev.discountNote = mergeDiscountLabels(prev.discountNote, line.discountNote);
}

/**
 * Human-readable cart lines: when Bond returns `cartItems`, split **reservation** vs **membership** (and add-ons)
 * so totals are not shown as a single ambiguous line. Falls back to one line using cart subtotal.
 */
export function buildBookingDisplayLinesForCart(opts: {
  productName: string;
  slots: PickedSlot[];
  cart: OrganizationCartDto;
  product?: ExtendedProductDto;
  bookingForLabel?: string;
  /** When set, grouped summary includes `$X | per … × n` lines. */
  formatMoney?: (amount: number) => string;
}): SessionCartDisplayLine[] {
  const schedule = formatScheduleSummaryForBooking(opts.slots, opts.bookingForLabel, opts.formatMoney);
  const ent = describeEntitlementsForDisplay(opts.product?.entitlementDiscounts);
  const c = opts.cart;
  const items = c.cartItems;

  if (Array.isArray(items) && items.length > 0) {
    const flat = flattenBondCartItemNodes(items);
    const bookingLines: SessionCartDisplayLine[] = [];
    const extraBucket = new Map<string, SessionCartDisplayLine>();
    const extraOrder: string[] = [];

    for (const raw of flat) {
      if (!raw || typeof raw !== "object") continue;
      const it = raw as Record<string, unknown>;
      const kind = classifyCartItemLineKind(it);
      const fromItem = cartItemLineAmountFromDto(it);
      if (fromItem == null) continue;
      const titleBase = titleFromCartItem(it);
      if (kind === "booking") {
        const lineDisc = describeCartItemDiscountLabels(it);
        const discountNote = mergeDiscountLabels(ent, lineDisc);
        const resolved = resolveBondLineDisplayAmounts(it, "booking");
        const amount = resolved?.net ?? fromItem;
        const strikeAmount = resolved?.strike ?? computeBondLineStrikeAmount(it, amount);
        bookingLines.push({
          title: opts.productName.trim() || titleBase,
          meta: schedule,
          amount,
          lineKind: "booking",
          ...(discountNote ? { discountNote } : {}),
          ...(strikeAmount != null ? { strikeAmount } : {}),
        });
      } else if (kind === "membership") {
        const lineDisc = describeCartItemDiscountLabels(it);
        const resolved = resolveBondLineDisplayAmounts(it, "membership");
        const amount = resolved?.net ?? fromItem;
        const strikeAmount = resolved?.strike ?? computeBondLineStrikeAmount(it, amount);
        const line: SessionCartDisplayLine = {
          title: titleBase,
          meta: `Membership · for ${opts.productName.trim() || "this booking"}`,
          amount,
          lineKind: "membership",
          ...(lineDisc ? { discountNote: lineDisc } : {}),
          ...(strikeAmount != null ? { strikeAmount } : {}),
        };
        addOrMergeExtraLine(extraBucket, extraOrder, mergeKeyForExtraLine("membership", it, titleBase), line);
      } else {
        const line: SessionCartDisplayLine = {
          title: titleBase,
          meta: schedule,
          amount: fromItem,
          lineKind: "addon",
        };
        addOrMergeExtraLine(extraBucket, extraOrder, mergeKeyForExtraLine("addon", it, titleBase), line);
      }
    }
    const lines = [...bookingLines, ...extraOrder.map((k) => extraBucket.get(k)!).filter(Boolean)];
    if (lines.length > 0) return lines;
  }

  const amt =
    typeof c.subtotal === "number" && Number.isFinite(c.subtotal)
      ? c.subtotal
      : typeof c.price === "number" && Number.isFinite(c.price)
        ? c.price
        : null;
  return [
    {
      title: opts.productName,
      meta: schedule,
      amount: amt,
      lineKind: "booking",
      ...(ent ? { discountNote: ent } : {}),
    },
  ];
}
