import { describe, expect, it } from "vitest";
import type { ExtendedProductDto } from "@/types/online-booking";
import {
  cartLooksPayable,
  isVisitPassProduct,
  parseVisitPassProduct,
  visitPassCartPurchaseForSnapshot,
  visitPassPackDisplayAmount,
  visitPassPackPrice,
  visitPassFillPercent,
  visitPassOverflowsHeldVisits,
  visitPassSlotCap,
  visitsNeededForSlots,
  resolveVisitPassCheckout,
} from "@/lib/visit-pass";

function product(overrides: Partial<ExtendedProductDto> = {}): ExtendedProductDto {
  return {
    id: 701,
    organizationId: 1,
    name: "Court 10-pack",
    quantity: 10,
    prices: [{ id: 1, organizationId: 1, name: "Pack", price: 200, currency: "USD" }],
    isAll: false,
    isPunchPass: true,
    isProRated: false,
    ...overrides,
  };
}

describe("isVisitPassProduct", () => {
  it("is true only when isPunchPass is true", () => {
    expect(isVisitPassProduct(product())).toBe(true);
    expect(isVisitPassProduct(product({ isPunchPass: false }))).toBe(false);
    expect(isVisitPassProduct(undefined)).toBe(false);
  });
});

describe("visitPassPackPrice", () => {
  it("prefers a named Pack row over a cheaper Visit row", () => {
    expect(
      visitPassPackPrice(
        product({
          prices: [
            { id: 1, organizationId: 1, name: "Visit", price: 0, currency: "USD" },
            { id: 2, organizationId: 1, name: "Pack", price: 200, currency: "USD" },
          ],
        })
      )
    ).toEqual({ amount: 200, currency: "USD" });
  });

  it("uses the highest positive price when names are missing", () => {
    expect(
      visitPassPackPrice(
        product({
          prices: [
            { id: 1, organizationId: 1, price: 0, currency: "USD" },
            { id: 2, organizationId: 1, price: 150, currency: "USD" },
            { id: 3, organizationId: 1, price: 40, currency: "USD" },
          ],
        })
      )
    ).toEqual({ amount: 150, currency: "USD" });
  });
});

describe("parseVisitPassProduct", () => {
  it("returns null for non-pass products", () => {
    expect(parseVisitPassProduct(product({ isPunchPass: false }))).toBeNull();
  });

  it("reads punch count, duration minutes, and pack price", () => {
    expect(
      parseVisitPassProduct(
        product({
          quantity: 8,
          duration: { amount: 90, unit: "minute" },
        })
      )
    ).toMatchObject({
      productId: 701,
      visitCount: 8,
      durationMinutes: 90,
      packPrice: { amount: 200, currency: "USD" },
    });
  });

  it("uses a demo pack price when Bond omits prices", () => {
    expect(
      parseVisitPassProduct(
        product({
          prices: [],
        })
      )?.packPrice
    ).toEqual({ amount: 150, currency: "USD" });
  });

  it("converts hour duration to minutes and defaults missing quantity", () => {
    expect(
      parseVisitPassProduct(
        product({
          quantity: 0,
          duration: { amount: 1, unit: "hour" },
        })
      )
    ).toMatchObject({ visitCount: 1, durationMinutes: 60 });
  });
});

describe("visitsNeededForSlots", () => {
  it("is one punch per slot", () => {
    expect(visitsNeededForSlots(3)).toBe(3);
    expect(visitsNeededForSlots(0)).toBe(0);
  });
});

describe("resolveVisitPassCheckout", () => {
  const pass = parseVisitPassProduct(product())!;

  it("returns null with no slots", () => {
    expect(resolveVisitPassCheckout(pass, 0, 0)).toBeNull();
  });

  it("buys the pack and redeems picked slots when remaining is 0", () => {
    expect(resolveVisitPassCheckout(pass, 0, 2)).toMatchObject({
      kind: "buyAndRedeem",
      visitsNeeded: 2,
      remainingAfter: 8,
      packAmount: 200,
    });
  });

  it("redeems only when remaining covers the slots", () => {
    expect(resolveVisitPassCheckout(pass, 8, 2)).toMatchObject({
      kind: "redeem",
      visitsNeeded: 2,
      remainingAfter: 6,
    });
  });

  it("buys another pack when remaining is short", () => {
    expect(resolveVisitPassCheckout(pass, 1, 3)).toMatchObject({
      kind: "buyAndRedeem",
      visitsNeeded: 3,
      remainingAfter: 8,
    });
  });
});

describe("visitPassFillPercent", () => {
  it("fills remaining over pack total", () => {
    expect(visitPassFillPercent(7, 10)).toBe(70);
    expect(visitPassFillPercent(0, 10)).toBe(0);
    expect(visitPassFillPercent(10, 10)).toBe(100);
  });

  it("clamps empty or invalid totals", () => {
    expect(visitPassFillPercent(3, 0)).toBe(0);
    expect(visitPassFillPercent(12, 10)).toBe(100);
  });
});

describe("visitPassOverflowsHeldVisits", () => {
  it("warns only when extra visits would buy another pack", () => {
    expect(visitPassOverflowsHeldVisits(2, 3)).toBe(true);
    expect(visitPassOverflowsHeldVisits(2, 2)).toBe(false);
    expect(visitPassOverflowsHeldVisits(0, 1)).toBe(false);
  });
});

describe("visitPassSlotCap", () => {
  it("allows remaining punches plus one new pack", () => {
    const pass = parseVisitPassProduct(product())!;
    expect(visitPassSlotCap(pass, 0)).toBe(10);
    expect(visitPassSlotCap(pass, 4)).toBe(14);
  });
});

describe("visitPassCartPurchaseForSnapshot", () => {
  const pass = parseVisitPassProduct(product())!;

  it("keeps the pack amount only for buy-and-redeem", () => {
    const buy = resolveVisitPassCheckout(pass, 0, 2)!;
    expect(
      visitPassPackDisplayAmount(
        visitPassCartPurchaseForSnapshot(pass, buy, { packSubtitle: "10 visits", visitSubtitle: "Included" })
      )
    ).toBe(200);
    const redeem = resolveVisitPassCheckout(pass, 8, 2)!;
    expect(
      visitPassPackDisplayAmount(
        visitPassCartPurchaseForSnapshot(pass, redeem, { packSubtitle: "10 visits", visitSubtitle: "1 punch" })
      )
    ).toBe(0);
  });
});

describe("cartLooksPayable", () => {
  it("is true when Bond cart price is positive", () => {
    expect(cartLooksPayable({ price: 40 })).toBe(true);
    expect(cartLooksPayable({ price: 0, total: 0 })).toBe(false);
    expect(cartLooksPayable(null)).toBe(false);
  });
});
