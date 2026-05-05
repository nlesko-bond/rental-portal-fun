import { describe, it, expect } from "vitest";
import { bagApprovalPolicy } from "@/lib/cart-purchase-lines";
import { checkoutCardsFromSnapshot } from "@/lib/checkout-card-model";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import type { OrganizationCartDto } from "@/types/online-booking";

function makeSnap(opts: {
  approvalRequired?: boolean;
  approvalByProductId?: Record<number, boolean>;
}): SessionCartSnapshot {
  return {
    cart: { id: 1, cartItems: [] } as unknown as OrganizationCartDto,
    productName: "Test",
    ...opts,
  };
}

describe("bagApprovalPolicy", () => {
  it("returns all_pay for empty rows", () => {
    expect(bagApprovalPolicy([])).toBe("all_pay");
  });

  it("returns all_pay when no row has approval", () => {
    expect(bagApprovalPolicy([makeSnap({}), makeSnap({ approvalRequired: false })])).toBe("all_pay");
  });

  it("returns all_submission when every row requires approval", () => {
    expect(bagApprovalPolicy([makeSnap({ approvalRequired: true }), makeSnap({ approvalRequired: true })])).toBe(
      "all_submission"
    );
  });

  it("returns mixed when some rows require approval", () => {
    expect(bagApprovalPolicy([makeSnap({ approvalRequired: true }), makeSnap({ approvalRequired: false })])).toBe(
      "mixed"
    );
  });

  it("uses approvalByProductId when present, overriding row-level flag", () => {
    const row = makeSnap({
      approvalByProductId: { 10: true, 20: false },
    });
    expect(bagApprovalPolicy([row])).toBe("mixed");
  });

  it("returns all_submission when all per-product entries are true", () => {
    const row = makeSnap({ approvalByProductId: { 10: true, 20: true } });
    expect(bagApprovalPolicy([row])).toBe("all_submission");
  });

  it("returns all_pay when all per-product entries are false", () => {
    const row = makeSnap({ approvalByProductId: { 10: false, 20: false } });
    expect(bagApprovalPolicy([row])).toBe("all_pay");
  });
});

describe("checkoutCardsFromSnapshot", () => {
  it("shows approval badges from Bond purchaseType without legacy approval metadata", () => {
    const row: SessionCartSnapshot = {
      cart: {
        id: 1,
        cartItems: [
          {
            id: 10,
            productId: 123,
            product: { id: 123, name: "Tennis lessons" },
            metadata: { description: "reservation_type_lesson", purchaseType: "order" },
            subtotal: 80,
          },
        ],
      } as unknown as OrganizationCartDto,
      productName: "Tennis lessons",
    };

    const [card] = checkoutCardsFromSnapshot(row, 0);

    expect(card?.badges).toContainEqual({ kind: "approval", text: "Approval required" });
  });

  it("does not let row-level legacy approval override Bond purchaseType purchase", () => {
    const row: SessionCartSnapshot = {
      cart: {
        id: 1,
        cartItems: [
          {
            id: 10,
            productId: 123,
            product: { id: 123, name: "Court rental" },
            metadata: { description: "reservation_type_rental", purchaseType: "purchase" },
            subtotal: 80,
          },
        ],
      } as unknown as OrganizationCartDto,
      productName: "Court rental",
      approvalRequired: true,
    };

    const [card] = checkoutCardsFromSnapshot(row, 0);

    expect(card?.badges.some((badge) => badge.kind === "approval")).toBe(false);
  });

  it("shows the persisted product discount label when Bond only sends strike and net amounts", () => {
    const row: SessionCartSnapshot = {
      cart: {
        id: 1,
        cartItems: [
          {
            id: 10,
            productId: 123,
            product: { id: 123, name: "Tennis lessons" },
            metadata: { description: "reservation_type_lesson" },
            amount: 80,
            price: 95.01,
          },
        ],
      } as unknown as OrganizationCartDto,
      productName: "Tennis lessons",
      approvalByProductId: { 123: true },
      productDiscountLabelByProductId: { 123: "golden group (30%)" },
    };

    const [card] = checkoutCardsFromSnapshot(row, 0);

    expect(card?.badges).toContainEqual({ kind: "promo", text: "golden group (30%)" });
    expect(card?.baseStrikeAmount).toBe(95.01);
  });
});
