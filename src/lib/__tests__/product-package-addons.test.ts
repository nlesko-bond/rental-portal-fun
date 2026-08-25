import { describe, expect, it } from "vitest";
import {
  estimateSelectedAddonsTotal,
  type PackageAddonLine,
} from "@/lib/product-package-addons";

const slot = {
  key: "court-1",
  startDate: "2026-08-28",
  endDate: "2026-08-28",
  startTime: "14:45:00",
  endTime: "15:45:00",
};

function addon(overrides: Partial<PackageAddonLine> & Pick<PackageAddonLine, "id" | "level">): PackageAddonLine {
  return {
    name: "Add-on",
    prices: [{ id: 1, organizationId: 1, price: 12, currency: "USD" }],
    ...overrides,
  };
}

describe("estimateSelectedAddonsTotal", () => {
  it("sums reservation add-ons by quantity", () => {
    expect(
      estimateSelectedAddonsTotal({
        addons: [addon({ id: 1, name: "Towel", level: "reservation", packagePrice: 8 })],
        selectedIds: new Set([1]),
        slots: [slot],
        targeting: {},
        quantities: new Map([[1, 2]]),
      })
    ).toBe(16);
  });

  it("charges slot add-ons only on targeted slots", () => {
    const second = { ...slot, key: "court-2" };
    expect(
      estimateSelectedAddonsTotal({
        addons: [addon({ id: 2, name: "Lights", level: "slot" })],
        selectedIds: new Set([2]),
        slots: [slot, second],
        targeting: { 2: { all: false, keys: ["court-1"] } },
      })
    ).toBe(12);
  });

  it("ignores add-ons that are not selected", () => {
    expect(
      estimateSelectedAddonsTotal({
        addons: [addon({ id: 3, name: "Ball machine", level: "reservation" })],
        selectedIds: new Set(),
        slots: [slot],
        targeting: {},
      })
    ).toBe(0);
  });
});
