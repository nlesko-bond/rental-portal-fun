import { describe, it, expect } from "vitest";
import { bagApprovalPolicy } from "@/lib/cart-purchase-lines";
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
