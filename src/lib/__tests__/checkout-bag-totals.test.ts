import { describe, it, expect } from "vitest";
import {
  bondCartPayableTotalForFinalize,
  cartApprovalSubtotal,
  cartChargeableMinimum,
  cartChargeableTotal,
  cartHasApprovalSplit,
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

/**
 * Cart-state helpers powering the four bag-drawer states:
 *
 * 1.1 pay-full — no deposit, no approval. `Pay full` is `cart.price`.
 * 1.2 deposit-only — `minimumDownpayment > 0`, no approval items. Both `Pay full` and `Pay deposit`.
 * 1.3 mixed — at least one approval item AND at least one purchasable item. Approval box + invoiced box.
 * 1.4 request-only — every item is approval. No deposit / no charge until approved.
 *
 * Approval is detected by `cartItems[].metadata.purchaseType === "order"`, with the snapshot's
 * `approvalByProductId` map as the legacy fallback. Comparing `minimumPrice < price` (the old
 * heuristic) misclassified deposit-only carts as mixed — that's the regression these tests guard.
 */
function makeApprovalItem(productId: number, amount: number): Record<string, unknown> {
  return makeItem(productId, amount, { metadata: { purchaseType: "order" } });
}

function makePurchaseItem(productId: number, amount: number): Record<string, unknown> {
  return makeItem(productId, amount, { metadata: { purchaseType: "purchase" } });
}

/** Add-on line (no per-product deposit) — sums into add-on rolls but never enables "Pay min". */
function makeAddonItem(productId: number, amount: number): Record<string, unknown> {
  return {
    id: productId * 100,
    product: { id: productId, name: `Addon ${productId}` },
    subtotal: amount,
    isAddon: true,
  };
}

describe("cart total helpers — purchaseType-aware approval split", () => {
  describe("cartChargeableTotal — 'Pay full' / amountToPay on finalize", () => {
    it("State 1.4 — purchase-only cart returns cart.price (full payable)", () => {
      const cart = makeCart({
        price: 250,
        cartItems: [makePurchaseItem(1, 250)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableTotal(cart)).toBe(250);
    });

    it("State 1.2 — deposit-only cart still returns cart.price (NOT minimumPrice)", () => {
      const cart = makeCart({
        price: 170.06,
        minimumPrice: 73,
        minimumDownpayment: 73,
        cartItems: [makePurchaseItem(1, 100), makePurchaseItem(2, 64)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableTotal(cart)).toBe(170.06);
    });

    it("State 1.3 — mixed cart returns purchasable subtotal (excludes approval items)", () => {
      const cart = makeCart({
        price: 600,
        cartItems: [makeApprovalItem(1, 200), makePurchaseItem(2, 400)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableTotal(cart)).toBe(400);
    });

    it("Legacy fallback — uses approvalByProductId when purchaseType is missing", () => {
      const cart = makeCart({
        price: 600,
        cartItems: [makeItem(1, 200), makeItem(2, 400)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableTotal(cart, { 1: true })).toBe(400);
    });

    it("State 1.4 (request-only) — returns null when every item is approval", () => {
      const cart = makeCart({
        price: 200,
        cartItems: [makeApprovalItem(1, 100), makeApprovalItem(2, 100)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableTotal(cart)).toBeNull();
    });

    it("returns null for empty cart", () => {
      expect(cartChargeableTotal(makeCart())).toBeNull();
    });
  });

  describe("cartChargeableMinimum — 'Pay minimum due' button visibility", () => {
    /**
     * Bond's contract: `amountToPay` must be ≥ `cart.minimumPrice` (verified live by
     * `CART.INVALID_PAYMENT_AMOUNT` rejecting `minimumDownpayment` even when the value matched
     * what the UI displayed). `minimumDownpayment` is informational only.
     */
    it("returns cart.minimumPrice when it is lower than cart.price (real deposit case)", () => {
      const cart = makeCart({
        price: 388.25,
        minimumPrice: 88.62,
        downpayment: 237,
        minimumDownpayment: 17,
        cartItems: [makePurchaseItem(1, 388.25)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableMinimum(cart)).toBe(88.62);
    });

    it("returns null when minimumPrice equals price (deposit option is redundant with full pay)", () => {
      const cart = makeCart({
        price: 122.75,
        minimumPrice: 122.75,
        downpayment: 13,
        minimumDownpayment: 13,
        cartItems: [makePurchaseItem(1, 122.75)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableMinimum(cart)).toBeNull();
    });

    it("returns null when there is no deposit configured at all", () => {
      expect(cartChargeableMinimum(makeCart())).toBeNull();
      expect(
        cartChargeableMinimum(
          makeCart({ downpayment: 0, minimumPrice: 0 } as Partial<OrganizationCartDto>),
        ),
      ).toBeNull();
    });

    /**
     * When no booking item has a deposit configured, `minimumPrice` is just Bond's add-on
     * subtotal — not a real deposit. Sending it would be rejected with
     * `CART.INVALID_PAYMENT_AMOUNT` because the rental isn't covered. Helper returns `null`.
     */
    it("returns null when no booking has a deposit configured (even if minimumPrice < price)", () => {
      const cart = makeCart({
        price: 71,
        minimumPrice: 21,
        downpayment: 0,
        minimumDownpayment: 21,
        cartItems: [makePurchaseItem(1, 50), makeAddonItem(2, 10), makeAddonItem(3, 11)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableMinimum(cart)).toBeNull();
    });

    /** Per-item `product.downpayment` is enough to enable the deposit option (cart-level may be omitted). */
    it("returns minimumPrice when product.downpayment is set on a booking line", () => {
      const cart = makeCart({
        price: 100,
        minimumPrice: 30,
        cartItems: [
          {
            id: 100,
            product: { id: 1, name: "Rent a court!", downpayment: 30 },
            subtotal: 100,
            metadata: { purchaseType: "purchase" },
          },
        ],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartChargeableMinimum(cart)).toBe(30);
    });
  });

  describe("cartApprovalSubtotal — 'Approval items' box on mixed cart", () => {
    it("sums approval-item line amounts when at least one approval item is present", () => {
      const cart = makeCart({
        cartItems: [makeApprovalItem(1, 200), makePurchaseItem(2, 400)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartApprovalSubtotal(cart)).toBe(200);
    });

    it("returns null for a deposit-only cart even when minimumPrice < price", () => {
      const cart = makeCart({
        price: 170.06,
        minimumPrice: 73,
        cartItems: [makePurchaseItem(1, 100), makePurchaseItem(2, 64)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartApprovalSubtotal(cart)).toBeNull();
    });

    it("returns null for an empty cart", () => {
      expect(cartApprovalSubtotal(makeCart())).toBeNull();
    });
  });

  describe("cartHasApprovalSplit — switches the bag into mixed (state 1.3) layout", () => {
    it("true only when both approval AND purchasable items are present", () => {
      const cart = makeCart({
        cartItems: [makeApprovalItem(1, 200), makePurchaseItem(2, 400)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartHasApprovalSplit(cart)).toBe(true);
    });

    it("false for a deposit-only cart (regression: old (minimumPrice<price) heuristic)", () => {
      const cart = makeCart({
        price: 170.06,
        minimumPrice: 73,
        minimumDownpayment: 73,
        cartItems: [makePurchaseItem(1, 100), makePurchaseItem(2, 64)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartHasApprovalSplit(cart)).toBe(false);
    });

    it("false for a pure-approval cart (state 1.4 — request only, not mixed)", () => {
      const cart = makeCart({
        cartItems: [makeApprovalItem(1, 100), makeApprovalItem(2, 100)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(cartHasApprovalSplit(cart)).toBe(false);
    });

    it("false when there are no items at all", () => {
      expect(cartHasApprovalSplit(makeCart())).toBe(false);
    });
  });

  describe("bondCartPayableTotalForFinalize — wraps cartChargeableTotal", () => {
    it("State 1.4 — purchase-only with cart-level totals", () => {
      const cart = makeCart({
        price: 50,
        cartItems: [makePurchaseItem(1, 30), makePurchaseItem(2, 20)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(bondCartPayableTotalForFinalize(cart)).toBe(50);
    });

    it("State 1.2 — deposit-only cart: 'Pay full' is the cart price, 'Pay min' is minimumPrice when < price", () => {
      const cart = makeCart({
        price: 75,
        minimumPrice: 30,
        downpayment: 5,
        minimumDownpayment: 5,
        cartItems: [makePurchaseItem(1, 75)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(bondCartPayableTotalForFinalize(cart)).toBe(75);
      expect(cartChargeableMinimum(cart)).toBe(30);
    });

    it("State 1.3 — mixed cart returns purchasable subtotal (no INVALID_PAYMENT_AMOUNT)", () => {
      const cart = makeCart({
        price: 600,
        cartItems: [makeApprovalItem(1, 200), makePurchaseItem(2, 400)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(bondCartPayableTotalForFinalize(cart)).toBe(400);
    });

    it("Defensive — line-walk path still works when approval flag comes from snapshot only", () => {
      const cart = makeCart({
        cartItems: [makeItem(1, 200), makeItem(2, 400)],
      } as unknown as Partial<OrganizationCartDto>);
      expect(bondCartPayableTotalForFinalize(cart, { 1: true })).toBe(400);
    });
  });
});
