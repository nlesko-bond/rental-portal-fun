/** Normalize `GET .../products/:id/user/:userId/required` payloads (shape varies by Bond version). */
export type RequiredProductRow = { id: number; name?: string; productType?: string };

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
    });
  }
  return out;
}
