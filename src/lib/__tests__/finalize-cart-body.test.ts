import { describe, expect, it } from "vitest";
import { resolveFinalizeAmountToPay } from "@/lib/finalize-cart-body";
import { punchPassPackDueOnSnapshots } from "@/lib/punch-pass";

describe("punchPassPackDueOnSnapshots", () => {
  it("sums buy-and-redeem pack amounts only", () => {
    expect(
      punchPassPackDueOnSnapshots([
        {
          punchPassPurchase: {
            kind: "buyAndRedeem",
            productId: 1,
            packName: "Court 10-pack",
            punchCount: 10,
            packAmount: 150,
            punchesNeeded: 1,
            packSubtitle: "10 visits",
            visitSubtitle: "Included",
          },
        },
        {
          punchPassPurchase: {
            kind: "redeem",
            productId: 1,
            packName: "Court 10-pack",
            punchCount: 10,
            packAmount: 150,
            punchesNeeded: 1,
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
