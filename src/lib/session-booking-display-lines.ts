import { formatPickedSlotTimeRange } from "@/components/booking/booking-slot-labels";
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
import type { PickedSlot } from "@/lib/slot-selection";
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

export function formatScheduleSummaryForBooking(slots: PickedSlot[], bookingForLabel?: string): string {
  return scheduleSummaryFromSlots(slots, bookingForLabel);
}

function scheduleSummaryFromSlots(slots: PickedSlot[], bookingForLabel?: string): string {
  const slotMeta = slots
    .map((s) => `${s.resourceName} · ${formatPickedSlotTimeRange(s)}`)
    .join(" · ");
  const parts = [
    slotMeta,
    bookingForLabel && bookingForLabel.trim().length > 0 ? `For ${bookingForLabel.trim()}` : undefined,
  ].filter((x): x is string => typeof x === "string" && x.length > 0);
  const s = parts.join(" · ");
  return s.length > 0 ? s : "Reservation details";
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
}): SessionCartDisplayLine[] {
  const schedule = scheduleSummaryFromSlots(opts.slots, opts.bookingForLabel);
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
