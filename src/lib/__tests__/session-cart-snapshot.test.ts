import { describe, it, expect } from "vitest";
import { coerceCartFromApi, positiveBondCartId } from "@/lib/session-cart-snapshot";
import type { OrganizationCartDto } from "@/types/online-booking";

function makeCart(fields: Record<string, unknown>): OrganizationCartDto {
  return fields as unknown as OrganizationCartDto;
}

describe("coerceCartFromApi", () => {
  it("returns cart unchanged when id is already positive", () => {
    const cart = makeCart({ id: 5, cartItems: [] });
    expect(coerceCartFromApi(cart).id).toBe(5);
  });

  it("promotes cartId to id when id is missing", () => {
    const cart = makeCart({ cartId: 10, cartItems: [] });
    expect(coerceCartFromApi(cart).id).toBe(10);
  });

  it("promotes organizationCartId to id", () => {
    const cart = makeCart({ organizationCartId: 20, cartItems: [] });
    expect(coerceCartFromApi(cart).id).toBe(20);
  });

  it("prefers id over cartId", () => {
    const cart = makeCart({ id: 3, cartId: 9, cartItems: [] });
    expect(coerceCartFromApi(cart).id).toBe(3);
  });

  it("does not set id when all sources are non-positive", () => {
    const cart = makeCart({ id: 0, cartItems: [] });
    // id=0 is not positive; no other source; result should have no positive id
    const result = coerceCartFromApi(cart);
    expect(result.id).toBeFalsy();
  });
});

describe("positiveBondCartId", () => {
  it("returns positive id", () => {
    expect(positiveBondCartId(makeCart({ id: 7 }))).toBe(7);
  });

  it("returns null for id=0", () => {
    expect(positiveBondCartId(makeCart({ id: 0 }))).toBeNull();
  });

  it("returns null for negative id", () => {
    expect(positiveBondCartId(makeCart({ id: -5 }))).toBeNull();
  });

  it("resolves via cartId when id missing", () => {
    expect(positiveBondCartId(makeCart({ cartId: 15 }))).toBe(15);
  });
});
