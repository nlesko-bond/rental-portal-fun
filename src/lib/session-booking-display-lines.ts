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
import { describeEntitlementsForDisplay } from "@/lib/entitlement-discount";
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
  return parts.length > 0 ? parts.join(" · ") : undefined;
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
    const lines: SessionCartDisplayLine[] = [];
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
        lines.push({
          title: `${opts.productName} — reservation`,
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
        lines.push({
          title: titleBase,
          meta: `Membership · for ${opts.productName.trim() || "this booking"}`,
          amount,
          lineKind: "membership",
          ...(lineDisc ? { discountNote: lineDisc } : {}),
          ...(strikeAmount != null ? { strikeAmount } : {}),
        });
      } else {
        lines.push({
          title: titleBase,
          meta: schedule,
          amount: fromItem,
          lineKind: "addon",
        });
      }
    }
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
