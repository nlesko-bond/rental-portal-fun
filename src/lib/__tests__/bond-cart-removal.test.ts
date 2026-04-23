import { describe, it, expect } from "vitest";
import { bondRootCartItemIdForRemoval } from "@/lib/bond-cart-removal";
import type { OrganizationCartDto } from "@/types/online-booking";

function makeCart(items: unknown[]): OrganizationCartDto {
  return { id: 1, cartItems: items } as unknown as OrganizationCartDto;
}

describe("bondRootCartItemIdForRemoval", () => {
  it("returns null for empty cart", () => {
    expect(bondRootCartItemIdForRemoval(makeCart([]))).toBeNull();
  });

  it("returns the cartItemId of the first rental segment root by metadata description", () => {
    const cart = makeCart([
      {
        id: 1,
        organizationCartItemId: 101,
        metadata: { description: "reservation_type_rental" },
        product: { id: 5, name: "Tennis" },
      },
      {
        id: 2,
        organizationCartItemId: 102,
        metadata: { description: "addon_type" },
        product: { id: 6, name: "Balls" },
      },
    ]);
    expect(bondRootCartItemIdForRemoval(cart)).toBe(101);
  });

  it("falls back to first booking-classified item when no description matches", () => {
    const cart = makeCart([
      {
        id: 999,
        organizationCartItemId: 999,
        product: { id: 10, name: "Court" },
      },
    ]);
    // No metadata description — falls back to booking-kind detection; id != productId so it's valid
    expect(bondRootCartItemIdForRemoval(cart)).toBe(999);
  });

  it("respects cartFlatLineIndices filter", () => {
    const cart = makeCart([
      {
        id: 201,
        organizationCartItemId: 201,
        metadata: { description: "reservation_type_rental" },
        product: { id: 11 },
      },
      {
        id: 202,
        organizationCartItemId: 202,
        metadata: { description: "reservation_type_rental" },
        product: { id: 12 },
      },
    ]);
    // Only consider flat index 1 (second item)
    expect(bondRootCartItemIdForRemoval(cart, [1])).toBe(202);
  });

  it("skips items where id equals productId (Bond product-id ambiguity)", () => {
    const cart = makeCart([
      {
        id: 5,
        product: { id: 5, name: "Court" }, // id === product.id → not a cart-item id
      },
      {
        id: 300,
        organizationCartItemId: 300,
        metadata: { description: "reservation_type_rental" },
        product: { id: 6 },
      },
    ]);
    expect(bondRootCartItemIdForRemoval(cart)).toBe(300);
  });
});
