import { describe, expect, it } from "vitest";
import {
  membershipFrequencyLabel,
  type ExtendedRequiredProductNode,
} from "@/lib/required-products-extended";

const baseNode = (overrides: Partial<ExtendedRequiredProductNode> & Record<string, unknown> = {}): ExtendedRequiredProductNode => ({
  id: 1,
  name: "Membership",
  productType: "membership",
  prices: [{ price: 44, currency: "USD", name: "Membership" }],
  ...overrides,
});

describe("membershipFrequencyLabel", () => {
  it("returns null when nothing useful is on the node (Bond required-products payload sans cadence)", () => {
    const node = baseNode({
      endDate: "2200-01-01",
      packages: [],
    } as Record<string, unknown>);
    expect(membershipFrequencyLabel(node)).toBeNull();
  });

  it("ignores far-future endDate sentinels (>= 2100)", () => {
    expect(
      membershipFrequencyLabel(baseNode({ endDate: "2200-01-01" } as Record<string, unknown>))
    ).toBeNull();
    expect(
      membershipFrequencyLabel(baseNode({ expirationDate: "2199-12-31" } as Record<string, unknown>))
    ).toBeNull();
  });

  it("formats a real expirationDate in the past/near-future", () => {
    expect(
      membershipFrequencyLabel(baseNode({ expirationDate: "2026-12-24" } as Record<string, unknown>))
    ).toBe("exp Dec 24, 2026");
  });

  it("maps durationMonths on the node to a cadence label", () => {
    expect(membershipFrequencyLabel(baseNode({ durationMonths: 1 } as Record<string, unknown>))).toBe("month");
    expect(membershipFrequencyLabel(baseNode({ durationMonths: 3 } as Record<string, unknown>))).toBe("quarter");
    expect(membershipFrequencyLabel(baseNode({ durationMonths: 12 } as Record<string, unknown>))).toBe("year");
    expect(membershipFrequencyLabel(baseNode({ durationMonths: 6 } as Record<string, unknown>))).toBe("6 months");
    expect(membershipFrequencyLabel(baseNode({ durationMonths: 24 } as Record<string, unknown>))).toBe("2 years");
  });

  it("reads cadence from packages[].durationMonths when not on the node directly", () => {
    expect(
      membershipFrequencyLabel(baseNode({
        packages: [{ id: 1, name: "Renewal", durationMonths: 12 }],
      } as Record<string, unknown>))
    ).toBe("year");
  });

  it("reads cadence from packages[].renewalInterval enum-style strings", () => {
    expect(
      membershipFrequencyLabel(baseNode({
        packages: [{ id: 1, renewalInterval: "MONTHLY" }],
      } as Record<string, unknown>))
    ).toBe("month");
    expect(
      membershipFrequencyLabel(baseNode({
        packages: [{ id: 1, renewalInterval: "Quarterly" }],
      } as Record<string, unknown>))
    ).toBe("quarter");
    expect(
      membershipFrequencyLabel(baseNode({
        packages: [{ id: 1, renewalInterval: "annually" }],
      } as Record<string, unknown>))
    ).toBe("year");
  });

  it("reads cadence from cart-time resource.membership.durationMonths", () => {
    expect(
      membershipFrequencyLabel(baseNode({
        resource: { membership: { durationMonths: 3 } },
      } as Record<string, unknown>))
    ).toBe("quarter");
  });

  it("never falls back to the product name (was the prior bug)", () => {
    const node = baseNode({
      name: "Gold membership",
      endDate: "2200-01-01",
      prices: [{ price: 115, currency: "USD", name: "Gold membership" }],
    } as Record<string, unknown>);
    expect(membershipFrequencyLabel(node)).toBeNull();
  });
});
