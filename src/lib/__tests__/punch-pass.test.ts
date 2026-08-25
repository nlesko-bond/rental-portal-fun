import { describe, expect, it } from "vitest";
import type { ExtendedProductDto } from "@/types/online-booking";
import {
  cartLooksPayable,
  isPunchPassProduct,
  parsePunchPassProduct,
  punchPassPackPrice,
  punchesNeededForSlots,
} from "@/lib/punch-pass";

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

describe("isPunchPassProduct", () => {
  it("is true only when isPunchPass is true", () => {
    expect(isPunchPassProduct(product())).toBe(true);
    expect(isPunchPassProduct(product({ isPunchPass: false }))).toBe(false);
    expect(isPunchPassProduct(undefined)).toBe(false);
  });
});

describe("punchPassPackPrice", () => {
  it("prefers a named Pack row over a cheaper Visit row", () => {
    expect(
      punchPassPackPrice(
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
      punchPassPackPrice(
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

describe("parsePunchPassProduct", () => {
  it("returns null for non-pass products", () => {
    expect(parsePunchPassProduct(product({ isPunchPass: false }))).toBeNull();
  });

  it("reads punch count, duration minutes, and pack price", () => {
    expect(
      parsePunchPassProduct(
        product({
          quantity: 8,
          duration: { amount: 90, unit: "minute" },
        })
      )
    ).toMatchObject({
      productId: 701,
      punchCount: 8,
      durationMinutes: 90,
      packPrice: { amount: 200, currency: "USD" },
    });
  });

  it("uses a demo pack price when Bond omits prices", () => {
    expect(
      parsePunchPassProduct(
        product({
          prices: [],
        })
      )?.packPrice
    ).toEqual({ amount: 150, currency: "USD" });
  });

  it("converts hour duration to minutes and defaults missing quantity", () => {
    expect(
      parsePunchPassProduct(
        product({
          quantity: 0,
          duration: { amount: 1, unit: "hour" },
        })
      )
    ).toMatchObject({ punchCount: 1, durationMinutes: 60 });
  });
});

describe("punchesNeededForSlots", () => {
  it("is one punch per slot", () => {
    expect(punchesNeededForSlots(3)).toBe(3);
    expect(punchesNeededForSlots(0)).toBe(0);
  });
});

describe("cartLooksPayable", () => {
  it("is true when Bond cart price is positive", () => {
    expect(cartLooksPayable({ price: 40 })).toBe(true);
    expect(cartLooksPayable({ price: 0, total: 0 })).toBe(false);
    expect(cartLooksPayable(null)).toBe(false);
  });
});
