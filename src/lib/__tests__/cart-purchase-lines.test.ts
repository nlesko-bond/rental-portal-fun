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

  it("keeps original product names when a merged cart contains multiple booking products", () => {
    const row: SessionCartSnapshot = {
      cart: {
        id: 1,
        cartItems: [
          {
            id: 10,
            productId: 111,
            product: { id: 111, name: "Back-office reservation" },
            metadata: { description: "reservation_type_rental" },
            subtotal: 50,
          },
          {
            id: 11,
            productId: 222,
            product: { id: 222, name: "Back-office reservation" },
            metadata: { description: "reservation_type_rental" },
            subtotal: 60,
          },
        ],
      } as unknown as OrganizationCartDto,
      productName: "Most recent booking",
      productNameByProductId: {
        111: "Batting Cage",
        222: "Party Room",
      },
    };

    const cards = checkoutCardsFromSnapshot(row, 0);

    expect(cards.map((card) => card.title)).toEqual(["Batting Cage", "Party Room"]);
  });

  it("only exposes slot unit math when the booking has multiple slots", () => {
    const singleSlotRow: SessionCartSnapshot = {
      cart: {
        id: 1,
        currency: "USD",
        cartItems: [
          {
            id: 10,
            productId: 111,
            product: { id: 111, name: "Batting Cage" },
            metadata: { description: "reservation_type_rental" },
            subtotal: 50,
          },
        ],
      } as unknown as OrganizationCartDto,
      productName: "Batting Cage",
      reservedSlotKeys: ["1-2026-12-25-08:00:00-09:00:00"],
    };
    const multiSlotRow: SessionCartSnapshot = {
      ...singleSlotRow,
      reservedSlotKeys: [
        "1-2026-12-25-08:00:00-09:00:00",
        "1-2026-12-25-09:00:00-10:00:00",
      ],
    };

    expect(checkoutCardsFromSnapshot(singleSlotRow, 0)[0]?.unitSubtitle).toBeNull();
    expect(checkoutCardsFromSnapshot(multiSlotRow, 0)[0]?.unitSubtitle).toContain("x 2");
  });

  it("prepends the punch-pass pack purchase above the Bond $0 visit", () => {
    const row: SessionCartSnapshot = {
      cart: {
        id: 9,
        cartItems: [
          {
            id: 20,
            productId: 1089823,
            product: { id: 1089823, name: "Court 10-pack", downPayment: 1 },
            metadata: { description: "reservation_type_rental" },
            subtotal: 0,
          },
        ],
      } as unknown as OrganizationCartDto,
      productName: "Court 10-pack",
      punchPassPurchase: {
        kind: "buyAndRedeem",
        productId: 1089823,
        packName: "Court 10-pack",
        punchCount: 10,
        packAmount: 150,
        punchesNeeded: 1,
        packSubtitle: "10 visits on this pass",
        visitSubtitle: "Included visit",
      },
    };

    const cards = checkoutCardsFromSnapshot(row, 0);
    expect(cards).toHaveLength(2);
    expect(cards[0]?.title).toBe("Court 10-pack");
    expect(cards[0]?.itemTotal).toBe(150);
    expect(cards[0]?.unitSubtitle).toBe("10 visits on this pass");
    expect(cards[0]?.badges.some((badge) => badge.kind === "deposit_optional")).toBe(false);
    expect(cards[1]?.itemTotal).toBe(0);
    expect(cards[1]?.unitSubtitle).toBe("Included visit");
    expect(cards[1]?.badges.some((badge) => badge.kind === "deposit_optional")).toBe(false);
  });

  it("does not double the pack when Bond already invoiced it", () => {
    const row: SessionCartSnapshot = {
      cart: {
        id: 9,
        price: 150,
        cartItems: [
          {
            id: 20,
            productId: 1089823,
            product: { id: 1089823, name: "Court 10-pack" },
            metadata: { description: "punch_pass" },
            subtotal: 150,
          },
          {
            id: 21,
            productId: 1089823,
            product: { id: 1089823, name: "Court 10-pack" },
            metadata: { description: "reservation_type_rental" },
            subtotal: 0,
          },
        ],
      } as unknown as OrganizationCartDto,
      productName: "Court 10-pack",
      punchPassPurchase: {
        kind: "buyAndRedeem",
        productId: 1089823,
        packName: "Court 10-pack",
        punchCount: 10,
        packAmount: 150,
        punchesNeeded: 1,
        packSubtitle: "10 visits on this pass",
        visitSubtitle: "Included visit",
      },
    };

    const cards = checkoutCardsFromSnapshot(row, 0);
    const priced = cards.filter((card) => card.itemTotal === 150);
    expect(priced).toHaveLength(1);
  });
});
