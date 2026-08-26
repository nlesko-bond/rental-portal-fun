import { describe, expect, it } from "vitest";
import { buildFinalizeCartBody, punchPassCartSkipsBondFinalize, resolveFinalizeAmountToPay } from "@/lib/finalize-cart-body";
import { visitPassPackDueOnSnapshots } from "@/lib/visit-pass";

describe("visitPassPackDueOnSnapshots", () => {
  it("sums buy-and-redeem pack amounts only", () => {
    expect(
      visitPassPackDueOnSnapshots([
        {
          visitPassPurchase: {
            kind: "buyAndRedeem",
            productId: 1,
            packName: "Court 10-pack",
            visitCount: 10,
            packAmount: 150,
            visitsNeeded: 1,
            packSubtitle: "10 visits",
            visitSubtitle: "Included",
          },
        },
        {
          visitPassPurchase: {
            kind: "redeem",
            productId: 1,
            packName: "Court 10-pack",
            visitCount: 10,
            packAmount: 150,
            visitsNeeded: 1,
            packSubtitle: "10 visits",
            visitSubtitle: "1 punch",
          },
        },
      ])
    ).toBe(150);
  });
});

describe("resolveFinalizeAmountToPay", () => {
  it("uses Bond payable when the cart actually charges", () => {
    expect(
      resolveFinalizeAmountToPay({
        bondPayable: 40,
        punchPackDue: 0,
        uiEstimate: 40,
      })
    ).toBe(40);
  });

  it("does not send the demo pack amount when Bond payable is $0", () => {
    expect(
      resolveFinalizeAmountToPay({
        bondPayable: null,
        punchPackDue: 150,
        uiEstimate: 150,
      })
    ).toBeNull();
  });

  it("does not send a UI estimate when a punch pack is on the snapshot", () => {
    expect(
      resolveFinalizeAmountToPay({
        bondPayable: null,
        punchPackDue: 150,
        uiEstimate: 150,
        overrideAmount: 150,
      })
    ).toBeNull();
  });

  it("falls back to the UI estimate when Bond omits totals and there is no pack", () => {
    expect(
      resolveFinalizeAmountToPay({
        bondPayable: null,
        punchPackDue: 0,
        uiEstimate: 88.5,
      })
    ).toBe(88.5);
  });

  it("clamps a deposit override to Bond payable", () => {
    expect(
      resolveFinalizeAmountToPay({
        bondPayable: 170,
        punchPackDue: 0,
        uiEstimate: 170,
        overrideAmount: 73,
        cartMinimum: 73,
      })
    ).toBe(73);
  });
});

describe("buildFinalizeCartBody", () => {
  it("sends amount and payment method when Bond will charge", () => {
    expect(
      buildFinalizeCartBody({
        amountToPay: 40,
        paymentMethodId: 99,
      })
    ).toEqual({ amountToPay: 40, paymentMethodId: 99 });
  });

  it("sends amountToPay 0 without a payment method for a $0 Bond cart", () => {
    expect(
      buildFinalizeCartBody({
        amountToPay: null,
        paymentMethodId: 99,
      })
    ).toEqual({ amountToPay: 0 });
  });
});

describe("punchPassCartSkipsBondFinalize", () => {
  it("skips Bond when the bag is a punch-pass checkout and Bond payable is $0", () => {
    expect(punchPassCartSkipsBondFinalize(true, null)).toBe(true);
    expect(punchPassCartSkipsBondFinalize(true, 0)).toBe(true);
  });

  it("still finalizes through Bond when the cart actually charges", () => {
    expect(punchPassCartSkipsBondFinalize(true, 150)).toBe(false);
    expect(punchPassCartSkipsBondFinalize(false, null)).toBe(false);
  });
});
