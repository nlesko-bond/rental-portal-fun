/** Normalize `GET .../products/:id/user/:userId/required` payloads (shape varies by Bond version). */
export type RequiredProductRow = {
  id: number;
  name?: string;
  productType?: string;
  /** First catalog list price when Bond includes `prices[]` (confirm step / summaries). */
  displayPrice?: { amount: number; currency: string; label?: string };
};

function firstDisplayPriceFromRaw(o: Record<string, unknown>): RequiredProductRow["displayPrice"] {
  const prices = o.prices;
  if (!Array.isArray(prices) || prices.length === 0) return undefined;
  const p0 = prices[0] as Record<string, unknown>;
  const amount = typeof p0.price === "number" ? p0.price : Number(p0.price);
  if (!Number.isFinite(amount)) return undefined;
  const cur = typeof p0.currency === "string" ? p0.currency : "USD";
  const label = typeof p0.name === "string" ? p0.name : undefined;
  return { amount, currency: cur, label };
}

export function parseRequiredProductsResponse(raw: unknown): RequiredProductRow[] {
  const rows: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)
      ? ((raw as { data: unknown[] }).data ?? [])
      : raw && typeof raw === "object" && "requiredProducts" in raw && Array.isArray((raw as { requiredProducts: unknown }).requiredProducts)
        ? ((raw as { requiredProducts: unknown[] }).requiredProducts ?? [])
        : [];
  const out: RequiredProductRow[] = [];
  for (const item of rows) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "number" ? o.id : null;
    if (id == null) continue;
    out.push({
      id,
      name: typeof o.name === "string" ? o.name : undefined,
      productType: typeof o.productType === "string" ? o.productType : undefined,
      displayPrice: firstDisplayPriceFromRaw(o),
    });
  }
  return out;
}
