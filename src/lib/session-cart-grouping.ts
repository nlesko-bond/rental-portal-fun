import { classifyCartItemLineKind } from "@/lib/bond-cart-item-classify";
import { flattenBondCartItemNodes } from "@/lib/checkout-bag-totals";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import type { OrganizationCartDto } from "@/types/online-booking";

function indexRange(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
}

/**
 * Splits flattened `cartItems` into one index list per top-level **booking** line (depth-first pre-order).
 * Preamble lines before the first booking (e.g. cart-level membership) attach to the first segment only.
 */
export function flatLineIndexSegmentsForMergedBookings(cart: OrganizationCartDto): number[][] | null {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return null;
  const flat = flattenBondCartItemNodes(items);
  const bookingStarts: number[] = [];
  for (let i = 0; i < flat.length; i++) {
    if (classifyCartItemLineKind(flat[i]!) === "booking") bookingStarts.push(i);
  }
  if (bookingStarts.length === 0) return null;
  const segments: number[][] = [];
  const first = bookingStarts[0]!;
  const preamble = first > 0 ? indexRange(0, first) : [];
  for (let g = 0; g < bookingStarts.length; g++) {
    const start = bookingStarts[g]!;
    const end = g + 1 < bookingStarts.length ? bookingStarts[g + 1]! : flat.length;
    const core = indexRange(start, end);
    segments.push(g === 0 && preamble.length > 0 ? [...preamble, ...core] : core);
  }
  return segments;
}

export type SessionCartGroupedItem = {
  index: number;
  row: SessionCartSnapshot;
  /** Flattened `cartItems` indices for this subsection (merged Bond cart). */
  cartFlatLineIndices?: number[];
  /** Person label for “booking for” meta when this item is a slice. */
  subsectionBookingForLabel?: string;
};

export type SessionCartGroupedSection = {
  /** Display label (e.g. family member name). */
  label: string;
  /** Original indices in `sessionCartRows` for remove / keys. */
  items: SessionCartGroupedItem[];
};

/**
 * Groups session cart snapshots by person. Merged carts with `reservationGroups` expand into * multiple grouped items (same snapshot `index`) so each participant gets their own section.
 */
export function groupSessionCartSnapshotsByLabel(rows: SessionCartSnapshot[]): SessionCartGroupedSection[] {
  const order: string[] = [];
  const map = new Map<string, SessionCartGroupedItem[]>();

  const append = (label: string, item: SessionCartGroupedItem) => {
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push(item);
  };

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!;
    const rg = row.reservationGroups;
    if (rg && rg.length > 1) {
      const segments = flatLineIndexSegmentsForMergedBookings(row.cart);
      if (segments == null || segments.length !== rg.length) {
        append(row.bookingForLabel?.trim() || "Booking", { index, row });
        continue;
      }
      for (let gi = 0; gi < rg.length; gi++) {
        const subLabel = rg[gi]!.bookingForLabel.trim() || "Booking";
        append(subLabel, {
          index,
          row,
          cartFlatLineIndices: segments[gi],
          subsectionBookingForLabel: subLabel,
        });
      }
      continue;
    }
    append(row.bookingForLabel?.trim() || "Booking", { index, row });
  }
  return order.map((label) => ({ label, items: map.get(label)! }));
}
