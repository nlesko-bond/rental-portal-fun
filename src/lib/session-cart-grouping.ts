import { classifyCartItemLineKind, getCartItemMetadataDescription } from "@/lib/bond-cart-item-classify";
import { flattenBondCartItemNodes } from "@/lib/checkout-bag-totals";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import type { OrganizationCartDto } from "@/types/online-booking";
import { parseSlotControlKey } from "@/lib/slot-selection";

const MAX_CART_ITEM_SLOT_SCAN_DEPTH = 4;
const TIME_HH_MM_LENGTH = 5;

function indexRange(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
}

/**
 * Splits flattened `cartItems` into one index list per top-level **booking** line (depth-first pre-order).
 * Preamble lines before the first booking (e.g. cart-level membership) attach to the first segment only.
 */
const RENTAL_SEGMENT_ROOT_DESCRIPTIONS = new Set([
  "reservation_type_rental",
  "reservation_type_lesson",
  "league_registration",
]);

function buildSegmentsFromBookingStarts(
  flat: Record<string, unknown>[],
  bookingStarts: number[]
): number[][] | null {
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

/**
 * Walk a top-level cart item subtree in DFS pre-order, assigning sequential flat indices, while
 * noting whether this subtree roots any rental/lesson/league — used to attribute multi-booker wrappers.
 * Matches the order produced by `flattenBondCartItemNodes`.
 */
type SubtreeInfo = { indices: number[]; hasRentalRoot: boolean };

function walkSubtree(node: Record<string, unknown>, cursor: { i: number }): SubtreeInfo {
  const indices: number[] = [cursor.i];
  cursor.i += 1;
  const desc = getCartItemMetadataDescription(node);
  let hasRental = desc != null && RENTAL_SEGMENT_ROOT_DESCRIPTIONS.has(desc);
  const children = node.children;
  if (Array.isArray(children)) {
    for (const c of children) {
      if (!c || typeof c !== "object") continue;
      const sub = walkSubtree(c as Record<string, unknown>, cursor);
      indices.push(...sub.indices);
      if (sub.hasRentalRoot) hasRental = true;
    }
  }
  return { indices, hasRentalRoot: hasRental };
}

export function flatLineIndexSegmentsForMergedBookings(cart: OrganizationCartDto): number[][] | null {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return null;
  const flat = flattenBondCartItemNodes(items);

  /**
   * Topology-aware: each top-level `cartItems[]` wrapper containing a rental descendant is one segment.
   * Top-level wrappers without any rental (e.g. cart-level membership) go into a preamble attached to segment 0.
   */
  const preamble: number[] = [];
  const rentalSegments: number[][] = [];
  const cursor = { i: 0 };
  for (const node of items) {
    if (!node || typeof node !== "object") {
      cursor.i += 1;
      continue;
    }
    const sub = walkSubtree(node as Record<string, unknown>, cursor);
    if (sub.indices.length === 0) continue;
    if (sub.hasRentalRoot) {
      rentalSegments.push(sub.indices);
    } else {
      preamble.push(...sub.indices);
    }
  }
  if (rentalSegments.length > 0) {
    if (preamble.length > 0 && rentalSegments[0]) rentalSegments[0] = [...preamble, ...rentalSegments[0]];
    return rentalSegments;
  }

  // Fallback: flat linear segmentation via rental-root description, then classifier.
  const rentalRoots: number[] = [];
  for (let i = 0; i < flat.length; i++) {
    const desc = getCartItemMetadataDescription(flat[i]!);
    if (desc != null && RENTAL_SEGMENT_ROOT_DESCRIPTIONS.has(desc)) {
      rentalRoots.push(i);
    }
  }
  if (rentalRoots.length > 0) {
    return buildSegmentsFromBookingStarts(flat, rentalRoots);
  }
  const legacyStarts: number[] = [];
  for (let i = 0; i < flat.length; i++) {
    if (classifyCartItemLineKind(flat[i]!) === "booking") legacyStarts.push(i);
  }
  return buildSegmentsFromBookingStarts(flat, legacyStarts);
}

/** Classifier-only segment starts (original behavior) — used when rental-root segments don’t match `reservationGroups` length. */
function flatLineIndexSegmentsForMergedBookingsLegacy(cart: OrganizationCartDto): number[][] | null {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return null;
  const flat = flattenBondCartItemNodes(items);
  const legacyStarts: number[] = [];
  for (let i = 0; i < flat.length; i++) {
    if (classifyCartItemLineKind(flat[i]!) === "booking") legacyStarts.push(i);
  }
  return buildSegmentsFromBookingStarts(flat, legacyStarts);
}

function collectCartItemStrings(value: unknown, depth: number, out: string[]): void {
  if (depth > MAX_CART_ITEM_SLOT_SCAN_DEPTH || value == null) return;
  if (typeof value === "string") {
    if (value.trim().length > 0) out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectCartItemStrings(item, depth + 1, out);
    return;
  }
  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectCartItemStrings(item, depth + 1, out);
    }
  }
}

function slotSignatures(slotKeys: string[]): { exact: Set<string>; loose: Set<string> } {
  const exact = new Set<string>();
  const loose = new Set<string>();
  for (const key of slotKeys) {
    exact.add(key);
    const parsed = parseSlotControlKey(key);
    if (!parsed) continue;
    loose.add(`${parsed.startDate}|${parsed.startTime.slice(0, TIME_HH_MM_LENGTH)}|${parsed.endTime.slice(0, TIME_HH_MM_LENGTH)}`);
  }
  return { exact, loose };
}

function itemMatchesSlotSignature(item: Record<string, unknown>, signatures: ReturnType<typeof slotSignatures>): boolean {
  const strings: string[] = [];
  collectCartItemStrings(item, 0, strings);
  const joined = strings.join(" ");
  for (const key of signatures.exact) {
    if (joined.includes(key)) return true;
  }
  for (const signature of signatures.loose) {
    const [date, start, end] = signature.split("|");
    if (date && start && end && joined.includes(date) && joined.includes(start) && joined.includes(end)) {
      return true;
    }
  }
  return false;
}

function flatLineIndexSegmentsFromReservationGroups(
  cart: OrganizationCartDto,
  groups: { slotKeys: string[] }[]
): number[][] | null {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0 || groups.length === 0) return null;
  const flat = flattenBondCartItemNodes(items);
  if (flat.length === 0) return null;
  const signatures = groups.map((group) => slotSignatures(group.slotKeys));
  const segments = groups.map((): number[] => []);
  let activeGroupIndex: number | null = null;
  const preamble: number[] = [];

  for (let i = 0; i < flat.length; i++) {
    const item = flat[i]!;
    const matchedIndex = signatures.findIndex((sig) => itemMatchesSlotSignature(item, sig));
    if (matchedIndex >= 0) activeGroupIndex = matchedIndex;
    if (activeGroupIndex == null) preamble.push(i);
    else segments[activeGroupIndex]!.push(i);
  }

  if (preamble.length > 0 && segments[0]) {
    segments[0] = [...preamble, ...segments[0]];
  }

  return segments.every((segment) => segment.length > 0) ? segments : null;
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
      let segments = flatLineIndexSegmentsFromReservationGroups(row.cart, rg);
      if (segments == null || segments.length !== rg.length) {
        segments = flatLineIndexSegmentsForMergedBookings(row.cart);
      }
      if (segments == null || segments.length !== rg.length) {
        segments = flatLineIndexSegmentsForMergedBookingsLegacy(row.cart);
      }
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
