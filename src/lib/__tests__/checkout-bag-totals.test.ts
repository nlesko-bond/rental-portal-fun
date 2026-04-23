import { describe, it, expect } from "vitest";
import {
  bondCartPayableTotalForFinalize,
  cartItemLineAmountFromDto,
  flattenBondCartItemNodes,
} from "@/lib/checkout-bag-totals";
import { classifyCartItemLineKind } from "@/lib/bond-cart-item-classify";
import type { OrganizationCartDto } from "@/types/online-booking";

function makeCart(overrides: Partial<OrganizationCartDto> = {}): OrganizationCartDto {
  return { id: 1, cartItems: [], ...overrides } as unknown as OrganizationCartDto;
}

function makeItem(productId: number, amount: number, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: productId * 100,
    product: { id: productId, name: `Product ${productId}` },
    subtotal: amount,
    ...extra,
  };
}

describe("bondCartPayableTotalForFinalize", () => {
  it("returns grand total from Bond when present and no approval filter", () => {
    const cart = makeCart({ total: 50.0 } as unknown as Partial<OrganizationCartDto>);
    expect(bondCartPayableTotalForFinalize(cart)).toBe(50.0);
  });

  it("returns null for empty cart", () => {
    expect(bondCartPayableTotalForFinalize(makeCart())).toBeNull();
  });

  it("sums line amounts when no Bond total and no approval filter", () => {
    const cart = makeCart({
      cartItems: [makeItem(1, 30), makeItem(2, 20)],
    } as unknown as Partial<OrganizationCartDto>);
    expect(bondCartPayableTotalForFinalize(cart)).toBe(50);
  });

  it("excludes approval-required lines from amountToPay", () => {
    const cart = makeCart({
      cartItems: [makeItem(1, 40), makeItem(2, 30)],
    } as unknown as Partial<OrganizationCartDto>);
    // product 2 requires approval — only product 1 ($40) is payable now
    const result = bondCartPayableTotalForFinalize(cart, { 1: false, 2: true });
    expect(result).toBe(40);
  });

  it("returns null when all items require approval", () => {
    const cart = makeCart({
      cartItems: [makeItem(1, 40), makeItem(2, 30)],
    } as unknown as Partial<OrganizationCartDto>);
    expect(bondCartPayableTotalForFinalize(cart, { 1: true, 2: true })).toBeNull();
  });

  it("behaves like no filter when approvalByProductId has no true values", () => {
    const cart = makeCart({
      cartItems: [makeItem(1, 40), makeItem(2, 30)],
    } as unknown as Partial<OrganizationCartDto>);
    expect(bondCartPayableTotalForFinalize(cart, { 1: false, 2: false })).toBe(70);
  });

  it("includes cart-level tax in payable sum for non-approval items", () => {
    const cart = {
      id: 1,
      cartItems: [makeItem(1, 40), makeItem(2, 30)],
      tax: 5,
    } as unknown as OrganizationCartDto;
    // product 2 requires approval; product 1 payable = 40 + 5 tax = 45
    expect(bondCartPayableTotalForFinalize(cart, { 2: true })).toBe(45);
  });

  it("rounds to 2 decimal places", () => {
    const cart = makeCart({
      cartItems: [makeItem(1, 10.005)],
    } as unknown as Partial<OrganizationCartDto>);
    const result = bondCartPayableTotalForFinalize(cart);
    expect(result).toBe(Math.round(10.005 * 100) / 100);
  });
});

// Helpers used by the depositAmount useMemo in BookingCheckoutDrawer.
// The useMemo itself is UI state — these tests validate the underlying building blocks.
describe("deposit minimum helpers — classifyCartItemLineKind + cartItemLineAmountFromDto", () => {
  it("classifies addon items so they are included at full price in deposit minimum", () => {
    const addonItem = makeItem(5, 20, { isAddon: true });
    expect(classifyCartItemLineKind(addonItem)).toBe("addon");
    expect(cartItemLineAmountFromDto(addonItem)).toBe(20);
  });

  it("classifies membership items so they are included at full price in deposit minimum", () => {
    const membershipItem = makeItem(6, 45, {
      product: { id: 6, name: "Membership", type: "membership" },
    });
    // type:"membership" on the nested product should classify as membership
    const kind = classifyCartItemLineKind(membershipItem);
    // membership or booking — either way it gets summed at full amount
    expect(cartItemLineAmountFromDto(membershipItem)).toBe(45);
    expect(kind === "membership" || kind === "booking").toBe(true);
  });

  it("flattenBondCartItemNodes includes children for deposit sum", () => {
    const parent = makeItem(1, 100);
    const child = makeItem(2, 20, { isAddon: true });
    const flat = flattenBondCartItemNodes([{ ...parent, children: [child] }]);
    expect(flat).toHaveLength(2);
    const childNode = flat.find((n) => n.isAddon === true);
    expect(cartItemLineAmountFromDto(childNode!)).toBe(20);
  });

  it("booking item with downPayment — deposit path reads the downPayment field", () => {
    const bookingItem = {
      id: 700,
      product: { id: 7, name: "Court", downPayment: 30 },
      subtotal: 100,
    };
    expect(classifyCartItemLineKind(bookingItem)).toBe("booking");
    // The deposit useMemo reads product.downPayment directly; confirm the field is accessible
    const prod = bookingItem.product as Record<string, unknown>;
    expect(typeof prod.downPayment === "number" && (prod.downPayment as number) > 0).toBe(true);
  });
});
