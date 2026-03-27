/**
 * Apply product `entitlementDiscounts[]` to a schedule **unit** price (Bond slot row).
 * Bond does not always return member-adjusted slot prices; when entitlements list percent/fixed
 * discounts, we mirror catalog behavior for display and checkout line amounts.
 *
 * Handles common shapes; extend when OpenAPI documents `EntitlementDiscountDto` precisely.
 */
export function applyEntitlementDiscountsToUnitPrice(unitPrice: number, entitlements: unknown[] | undefined): number {
  if (!Number.isFinite(unitPrice) || !entitlements?.length) return unitPrice;
  let price = unitPrice;
  for (const raw of entitlements) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;
    const pct =
      typeof e.percentage === "number"
        ? e.percentage
        : typeof e.percent === "number"
          ? e.percent
          : typeof e.discountPercent === "number"
            ? e.discountPercent
            : typeof e.value === "number" && String(e.discountType ?? e.type ?? "").toLowerCase() === "percent"
              ? e.value
              : null;
    if (pct != null && Number.isFinite(pct) && pct > 0) {
      price = price * (1 - Math.min(100, pct) / 100);
      continue;
    }
    const fixed =
      typeof e.amount === "number"
        ? e.amount
        : typeof e.discountAmount === "number"
          ? e.discountAmount
          : typeof e.value === "number" && String(e.discountType ?? e.type ?? "").toLowerCase() === "fixed"
            ? e.value
            : null;
    if (fixed != null && Number.isFinite(fixed) && fixed > 0) {
      price = Math.max(0, price - fixed);
    }
  }
  return price;
}
