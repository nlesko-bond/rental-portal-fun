/**
 * `GET .../products/{productId}/user/{userId}/required` → `ExtendedRequiredProductDto[]` (OpenAPI).
 * Used for membership gating: top-level siblings are typically OR options; nested `requiredProducts` are AND.
 */

export type ExtendedRequiredProductNode = {
  id: number;
  name?: string;
  productType?: string;
  productSubType?: string;
  prices?: Array<{ price?: number; currency?: string; name?: string }>;
  requiredProducts?: ExtendedRequiredProductNode[];
  required?: boolean;
  isGated?: boolean;
} & Record<string, unknown>;

export function parseExtendedRequiredProductsList(raw: unknown): ExtendedRequiredProductNode[] {
  const rows: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)
      ? ((raw as { data: unknown[] }).data ?? [])
      : [];
  const out: ExtendedRequiredProductNode[] = [];
  for (const item of rows) {
    const n = normalizeNode(item);
    if (n) out.push(n);
  }
  return out;
}

function normalizeNode(item: unknown): ExtendedRequiredProductNode | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : null;
  if (id == null) return null;
  const nestedRaw = o.requiredProducts;
  const nested: ExtendedRequiredProductNode[] = [];
  if (Array.isArray(nestedRaw)) {
    for (const c of nestedRaw) {
      const cn = normalizeNode(c);
      if (cn) nested.push(cn);
    }
  }
  return {
    ...o,
    id,
    name: typeof o.name === "string" ? o.name : undefined,
    productType: typeof o.productType === "string" ? o.productType : undefined,
    productSubType: typeof o.productSubType === "string" ? o.productSubType : undefined,
    prices: Array.isArray(o.prices) ? (o.prices as ExtendedRequiredProductNode["prices"]) : undefined,
    requiredProducts: nested.length > 0 ? nested : undefined,
    required: typeof o.required === "boolean" ? o.required : undefined,
    isGated: typeof o.isGated === "boolean" ? o.isGated : undefined,
  } as ExtendedRequiredProductNode;
}

/** Bond `ProductTypesEnum.membership` or gating subtype. */
export function isMembershipRequiredProduct(n: ExtendedRequiredProductNode): boolean {
  const t = String(n.productType ?? "").toLowerCase();
  if (t === "membership") return true;
  const st = String(n.productSubType ?? "").toLowerCase();
  return st.includes("gating_membership");
}

export function partitionMembershipVsOtherRequired(
  nodes: ExtendedRequiredProductNode[]
): { membershipOptions: ExtendedRequiredProductNode[]; otherRequired: ExtendedRequiredProductNode[] } {
  const membershipOptions: ExtendedRequiredProductNode[] = [];
  const otherRequired: ExtendedRequiredProductNode[] = [];
  for (const n of nodes) {
    if (isMembershipRequiredProduct(n)) membershipOptions.push(n);
    else otherRequired.push(n);
  }
  return { membershipOptions, otherRequired };
}

/** All product ids in this node and nested `requiredProducts` (AND chain). */
export function collectProductAndNestedIds(node: ExtendedRequiredProductNode): number[] {
  const ids: number[] = [node.id];
  const nested = node.requiredProducts;
  if (!Array.isArray(nested)) return ids;
  for (const c of nested) {
    ids.push(...collectProductAndNestedIds(c));
  }
  return ids;
}

/** Best-effort first recurring price label for display. */
export function primaryListPrice(node: ExtendedRequiredProductNode): { amount: number; currency: string; label?: string } | null {
  const prices = node.prices;
  if (!Array.isArray(prices) || prices.length === 0) return null;
  const p0 = prices[0] as Record<string, unknown>;
  const amount = typeof p0.price === "number" ? p0.price : Number(p0.price);
  if (!Number.isFinite(amount)) return null;
  const currency = typeof p0.currency === "string" ? p0.currency : "USD";
  const name = typeof p0.name === "string" ? p0.name : undefined;
  return { amount, currency, label: name };
}

/** Read a finite positive number from a record by candidate keys. */
function pickNumber(o: Record<string, unknown> | undefined | null, keys: readonly string[]): number | null {
  if (!o) return null;
  for (const k of keys) {
    const v = o[k];
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** Read the first non-empty string from a record by candidate keys. */
function pickString(o: Record<string, unknown> | undefined | null, keys: readonly string[]): string | null {
  if (!o) return null;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

/**
 * Returns a customer-facing **renewal-period or expiration** label for a membership product:
 *   - `"month"` / `"quarter"` / `"year"` / `"3 months"` for recurring memberships
 *   - `"exp Dec 24, 2026"` for fixed-price-until-date memberships
 *   - `null` when nothing useful can be derived
 *
 * Reads from common Bond shapes (`product.resource.membership.durationMonths`,
 * `expirationDate` / `endDate`, etc.) — falls back to nothing rather than echoing the product
 * name (which the old `prices[0].name` path was doing and is what the membership UI was
 * accidentally displaying).
 */
export function membershipFrequencyLabel(node: ExtendedRequiredProductNode): string | null {
  const o = node as Record<string, unknown>;
  const product = (o.product as Record<string, unknown> | undefined) ?? null;
  const resource = (o.resource ?? product?.resource) as Record<string, unknown> | undefined;
  const membership = (resource?.membership ?? o.membership) as Record<string, unknown> | undefined;

  const months =
    pickNumber(membership, ["durationMonths", "months", "lengthMonths"]) ??
    pickNumber(o, ["durationMonths"]);
  if (months != null) {
    if (months === 1) return "month";
    if (months === 3) return "quarter";
    if (months === 12) return "year";
    if (months % 12 === 0) return `${months / 12} years`;
    return `${months} months`;
  }

  const expirationDate =
    pickString(membership, ["expirationDate", "endDate", "validUntil", "expiresAt"]) ??
    pickString(product, ["expirationDate", "endDate", "validUntil", "expiresAt"]) ??
    pickString(o, ["expirationDate", "endDate", "validUntil", "expiresAt"]);
  if (expirationDate) {
    const d = new Date(expirationDate);
    if (!Number.isNaN(d.getTime())) {
      const mmm = d.toLocaleString("en-US", { month: "short" });
      return `exp ${mmm} ${d.getDate()}, ${d.getFullYear()}`;
    }
  }
  return null;
}

/** List/catalog unit price for a product id in the extended required tree (includes `required: false` satisfied rows). */
export function unitPriceForRequiredProductInTree(
  nodes: ExtendedRequiredProductNode[],
  productId: number
): number | undefined {
  function walk(n: ExtendedRequiredProductNode): number | undefined {
    if (n.id === productId) {
      const p = primaryListPrice(n);
      return p?.amount;
    }
    for (const c of n.requiredProducts ?? []) {
      const v = walk(c);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  for (const n of nodes) {
    const v = walk(n);
    if (v !== undefined) return v;
  }
  return undefined;
}

/** IDs Bond marks as already satisfied (`required: false`), including nested nodes. */
export function collectSatisfiedRequiredProductIds(nodes: ExtendedRequiredProductNode[]): Set<number> {
  const out = new Set<number>();
  function walk(n: ExtendedRequiredProductNode) {
    if (n.required === false) out.add(n.id);
    const nested = n.requiredProducts;
    if (Array.isArray(nested)) for (const c of nested) walk(c);
  }
  for (const n of nodes) walk(n);
  return out;
}

export function sumNodeTotalUsd(node: ExtendedRequiredProductNode): number {
  let sum = 0;
  const p = primaryListPrice(node);
  if (p) sum += p.amount;
  const nested = node.requiredProducts;
  if (Array.isArray(nested)) {
    for (const c of nested) {
      sum += sumNodeTotalUsd(c);
    }
  }
  return sum;
}
