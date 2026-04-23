import {
  classifyCartItemLineKind,
  getCartItemMetadataDescription,
  type CartLineKind,
} from "@/lib/bond-cart-item-classify";
import { flattenBondCartItemNodes } from "@/lib/checkout-bag-totals";
import type { OrganizationCartDto } from "@/types/online-booking";

/** Rental roots — aligned with `session-cart-grouping` segment starts. */
const RENTAL_SEGMENT_ROOT_DESCRIPTIONS = new Set([
  "reservation_type_rental",
  "reservation_type_lesson",
  "league_registration",
]);

export { RENTAL_SEGMENT_ROOT_DESCRIPTIONS };

function coercePositiveInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string" && /^\d+$/.test(v.trim())) {
    const n = Number(v.trim());
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function nestedProductId(it: Record<string, unknown>): number | null {
  const p = it.product;
  if (!p || typeof p !== "object") return null;
  return coercePositiveInt((p as Record<string, unknown>).id);
}

/**
 * Id for `DELETE …/cart/{cartId}/cart-item/{cartItemId}` — Bond expects the **cart line** id, not catalog `product.id`.
 * When `id` duplicates `product.id` / `productId`, DELETE is interpreted as a product id and returns `CART.MISSING_CART_ITEM`.
 */
function resolveBondCartItemLineIdForDelete(it: Record<string, unknown>): number | null {
  for (const key of ["organizationCartItemId", "cartItemId", "lineItemId", "itemId"] as const) {
    const n = coercePositiveInt(it[key]);
    if (n != null) return n;
  }
  const meta =
    it.metadata && typeof it.metadata === "object" ? (it.metadata as Record<string, unknown>) : null;
  if (meta != null) {
    for (const key of ["cartItemId", "organizationCartItemId"] as const) {
      const n = coercePositiveInt(meta[key]);
      if (n != null) return n;
    }
  }
  const topId = coercePositiveInt(it.id);
  const prodNested = nestedProductId(it);
  const topProductId = coercePositiveInt(it.productId);
  if (topId != null) {
    if (prodNested != null && topId === prodNested) return null;
    if (topProductId != null && topId === topProductId) return null;
  }
  return topId;
}

/**
 * Bond id for `DELETE …/cart/{cartId}/cart-item/{cartItemId}` when removing one bag subsection.
 * When `cartFlatLineIndices` is set (merged multi-guest cart), only those flattened line indices are considered.
 */
export function bondRootCartItemIdForRemoval(
  cart: OrganizationCartDto,
  cartFlatLineIndices?: readonly number[]
): number | null {
  const items = cart.cartItems;
  if (!Array.isArray(items) || items.length === 0) return null;
  const flat = flattenBondCartItemNodes(items);
  const allowed =
    cartFlatLineIndices != null && cartFlatLineIndices.length > 0 ? new Set(cartFlatLineIndices) : null;

  for (let i = 0; i < flat.length; i++) {
    if (allowed != null && !allowed.has(i)) continue;
    const it = flat[i]!;
    const desc = getCartItemMetadataDescription(it);
    if (desc != null && RENTAL_SEGMENT_ROOT_DESCRIPTIONS.has(desc)) {
      const id = resolveBondCartItemLineIdForDelete(it);
      if (id != null) return id;
    }
  }
  for (let i = 0; i < flat.length; i++) {
    if (allowed != null && !allowed.has(i)) continue;
    const it = flat[i]!;
    if (classifyCartItemLineKind(it) === "booking") {
      const id = resolveBondCartItemLineIdForDelete(it);
      if (id != null) return id;
    }
  }
  return null;
}

/** Bond line `required: true` (or metadata) — must stay in cart for checkout. */
export function membershipRemovableFromBag(it: Record<string, unknown>): boolean {
  const desc = getCartItemMetadataDescription(it);
  if (desc === "membership_package_child_item") return false;
  if (it.required === true) return false;
  if (it.required === false) return true;
  const meta =
    it.metadata && typeof it.metadata === "object" ? (it.metadata as Record<string, unknown>) : null;
  if (meta?.required === true) return false;
  if (meta?.required === false) return true;
  return false;
}

export type BagRemovePolicy =
  | { kind: "line"; cartItemId: number }
  | { kind: "subsection" };

/** What the bag UI should send to `onRemoveBagLine` for this flattened cart line. */
export function bagRemovePolicyForBondItem(
  it: Record<string, unknown>,
  lineKind: CartLineKind,
  cartItemId: number | null
): BagRemovePolicy | undefined {
  if (cartItemId == null) return undefined;
  if (lineKind === "addon") return { kind: "line", cartItemId };
  if (lineKind === "membership") {
    return membershipRemovableFromBag(it) ? { kind: "line", cartItemId } : undefined;
  }
  const desc = getCartItemMetadataDescription(it);
  if (lineKind === "booking" && desc != null && RENTAL_SEGMENT_ROOT_DESCRIPTIONS.has(desc)) {
    return { kind: "subsection" };
  }
  /** Any rental line removes its segment (rental + attached add-ons) when Bond omits `metadata.description`. */
  if (lineKind === "booking") return { kind: "subsection" };
  return undefined;
}

export function bondCartItemIdFromRecord(it: Record<string, unknown>): number | null {
  return resolveBondCartItemLineIdForDelete(it);
}

/**
 * Cart item ids to DELETE for a subsection (or whole row), **highest flat index first** so nested lines
 * clear before parents. Skips **required** membership lines.
 */
export function bondRemovableCartItemIdsForIndices(
  cart: OrganizationCartDto,
  indices: readonly number[]
): number[] {
  const flat = flattenBondCartItemNodes(cart.cartItems);
  const sortedIdx = [...new Set(indices)].filter((i) => i >= 0 && i < flat.length).sort((a, b) => b - a);
  const out: number[] = [];
  const seen = new Set<number>();
  for (const i of sortedIdx) {
    const it = flat[i]!;
    const kind = classifyCartItemLineKind(it);
    if (kind === "membership" && !membershipRemovableFromBag(it)) continue;
    const id = resolveBondCartItemLineIdForDelete(it);
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function allBondFlatLineIndices(cart: OrganizationCartDto): number[] {
  const flat = flattenBondCartItemNodes(cart.cartItems);
  return flat.map((_, i) => i);
}
