import { cartItemLineAmountFromDto, flattenBondCartItemNodes } from "@/lib/checkout-bag-totals";
import type { OrganizationCartDto } from "@/types/online-booking";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";

export type CartPurchaseDisplayLine = {
  key: string;
  title: string;
  meta: string;
  amount: number | null;
};

function titleFromCartItem(o: Record<string, unknown>): string {
  if (typeof o.name === "string" && o.name.length > 0) return o.name;
  if (typeof o.title === "string" && o.title.length > 0) return o.title;
  const p = o.product;
  if (p && typeof p === "object") {
    const pr = p as Record<string, unknown>;
    if (typeof pr.name === "string" && pr.name.length > 0) return pr.name;
  }
  return "Item";
}

function metaForCartLine(cartId: number, bookingBit: string): string {
  return `${cartId !== 0 ? `Cart #${cartId}` : "Pending submission"}${bookingBit}`;
}

/**
 * Renders one or more purchase rows per session snapshot: prefers client `displayLines`
 * from add-to-cart, then Bond `cartItems`, then a single line from `productName` / totals.
 */
export function expandSnapshotForPurchaseList(row: SessionCartSnapshot, rowIndex: number): CartPurchaseDisplayLine[] {
  const c = row.cart as OrganizationCartDto;
  const cartId = c.id;
  const bookingBit =
    typeof row.bookingForLabel === "string" && row.bookingForLabel.length > 0
      ? ` · ${row.bookingForLabel}`
      : "";

  const saved = row.displayLines;
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map((line, j) => ({
      key: `snap-${rowIndex}-saved-${j}-${cartId}`,
      title: line.title,
      meta:
        typeof line.meta === "string" && line.meta.trim().length > 0
          ? line.meta
          : metaForCartLine(cartId, bookingBit),
      amount: line.amount,
    }));
  }

  const items = c.cartItems;
  if (Array.isArray(items) && items.length > 0) {
    const flat = flattenBondCartItemNodes(items);
    const lines: CartPurchaseDisplayLine[] = [];
    flat.forEach((o, i) => {
      const fromItem = cartItemLineAmountFromDto(o);
      if (fromItem == null) return;
      const title = titleFromCartItem(o);
      lines.push({
        key: `snap-${rowIndex}-item-${i}-${cartId}`,
        title,
        meta: metaForCartLine(cartId, bookingBit),
        amount: fromItem,
      });
    });
    if (lines.length > 0) return lines;
  }

  const lineTotal =
    typeof c.subtotal === "number" && Number.isFinite(c.subtotal)
      ? c.subtotal
      : typeof c.price === "number" && Number.isFinite(c.price)
        ? c.price
        : null;

  return [
    {
      key: `snap-${rowIndex}-main-${cartId}`,
      title: row.productName,
      meta: metaForCartLine(cartId, bookingBit),
      amount: lineTotal,
    },
  ];
}

/** Line items for FAB / labels (Bond `cartItems`, optional `displayLines`, or one row per cart). */
export function countSessionCartLineItems(rows: SessionCartSnapshot[]): number {
  return rows.reduce((acc, row, i) => acc + expandSnapshotForPurchaseList(row, i).length, 0);
}
