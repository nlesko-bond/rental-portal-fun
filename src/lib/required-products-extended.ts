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

export type MembershipDisplaySummary = {
  audienceLabel: string | null;
  modeLabel: "Fixed" | "Renews" | null;
  detailLabel: string | null;
  frequencyLabel: string | null;
};

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

/** "9999-..." / "2199-..." / "2200-..." dates Bond uses as "no expiration" sentinels. */
const FAR_FUTURE_YEAR_THRESHOLD = 2100;
const MONTHS_IN_QUARTER = 3;
const MONTHS_IN_YEAR = 12;

/** True if `iso` parses to a year >= 2100 (Bond's "no real expiration" sentinel). */
function isFarFutureSentinelDate(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getUTCFullYear() >= FAR_FUTURE_YEAR_THRESHOLD;
}

/** `durationMonths` / `lengthMonths` / `months` etc. → `"month"` / `"quarter"` / `"year"` / `"N months"`. */
function monthsToCadenceLabel(months: number | null): string | null {
  if (months == null || !Number.isFinite(months) || months <= 0) return null;
  if (months === 1) return "month";
  if (months === MONTHS_IN_QUARTER) return "quarter";
  if (months === MONTHS_IN_YEAR) return "year";
  if (months % MONTHS_IN_YEAR === 0) return `${months / MONTHS_IN_YEAR} years`;
  return `${months} months`;
}

function monthsToRenewalCadenceLabel(months: number | null): string | null {
  if (months == null || !Number.isFinite(months) || months <= 0) return null;
  if (months === 1) return "monthly";
  if (months === MONTHS_IN_QUARTER) return "quarterly";
  if (months === MONTHS_IN_YEAR) return "annually";
  return `every ${months} months`;
}

/** Bond-style renewal-interval enum value (`"MONTHLY"` / `"QUARTERLY"` / `"YEARLY"` / etc.) → cadence label. */
function intervalEnumToCadenceLabel(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith("month")) return "month";
  if (s.startsWith("quarter")) return "quarter";
  if (s.startsWith("year") || s.startsWith("annual")) return "year";
  if (s.startsWith("week")) return "week";
  if (s.startsWith("day")) return "day";
  return null;
}

function intervalEnumToRenewalCadenceLabel(raw: string | null): string | null {
  const compact = intervalEnumToCadenceLabel(raw);
  if (compact === "month") return "monthly";
  if (compact === "quarter") return "quarterly";
  if (compact === "year") return "annually";
  return compact;
}

function formatUtcDateLabel(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const mmm = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${mmm} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function nestedRecord(o: Record<string, unknown> | undefined | null, key: string): Record<string, unknown> | null {
  const v = o?.[key];
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function candidateMembershipRecords(node: Record<string, unknown>): Record<string, unknown>[] {
  const product = nestedRecord(node, "product");
  const resource = nestedRecord(node, "resource") ?? nestedRecord(product, "resource");
  const membership = nestedRecord(node, "membership") ?? nestedRecord(resource, "membership") ?? nestedRecord(product, "membership");
  const metadata = nestedRecord(node, "metadata") ?? nestedRecord(product, "metadata") ?? nestedRecord(membership, "metadata");
  const settings = nestedRecord(node, "settings") ?? nestedRecord(product, "settings") ?? nestedRecord(membership, "settings");
  const options = nestedRecord(node, "options") ?? nestedRecord(product, "options") ?? nestedRecord(membership, "options");
  const packages = Array.isArray(node.packages) ? node.packages : Array.isArray(product?.packages) ? product.packages : [];
  const packageRecords = packages.filter(
    (record): record is Record<string, unknown> => record != null && typeof record === "object" && !Array.isArray(record)
  );
  return [membership, metadata, settings, options, resource, product, node, ...packageRecords].filter((record): record is Record<string, unknown> => record != null);
}

function pickFirstNumberFromRecords(records: readonly Record<string, unknown>[], keys: readonly string[]): number | null {
  for (const record of records) {
    const value = pickNumber(record, keys);
    if (value != null) return value;
  }
  return null;
}

function pickFirstStringFromRecords(records: readonly Record<string, unknown>[], keys: readonly string[]): string | null {
  for (const record of records) {
    const value = pickString(record, keys);
    if (value != null) return value;
  }
  return null;
}

function pickFirstBooleanFromRecords(records: readonly Record<string, unknown>[], keys: readonly string[]): boolean | null {
  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "boolean") return value;
    }
  }
  return null;
}

function prettyEnumLabel(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/[_-]+/g, " ")
    .replace(/\bgating\b/gi, "")
    .replace(/\bmembership\b/gi, "")
    .trim();
  if (!cleaned || /^(fixed|rolling|recurring|renews?|monthly|quarterly|annual|annually|yearly)$/i.test(cleaned)) return null;
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

function realExpirationLabel(records: readonly Record<string, unknown>[]): string | null {
  const raw = pickFirstStringFromRecords(records, ["expirationDate", "validUntil", "expiresAt", "endDate"]);
  if (!raw || isFarFutureSentinelDate(raw)) return null;
  const formatted = formatUtcDateLabel(raw);
  return formatted ? `Expires: ${formatted}` : null;
}

function renewalCadenceLabelFromRecords(records: readonly Record<string, unknown>[]): string | null {
  const months = pickFirstNumberFromRecords(records, ["durationMonths", "months", "lengthMonths", "renewalMonths"]);
  const monthsLabel = monthsToRenewalCadenceLabel(months);
  if (monthsLabel) return monthsLabel;
  return intervalEnumToRenewalCadenceLabel(
    pickFirstStringFromRecords(records, ["interval", "recurrenceInterval", "renewalInterval", "cadence", "frequency"])
  );
}

/**
 * Returns a customer-facing **renewal-period** label for a membership product:
 *   - `"month"` / `"quarter"` / `"year"` / `"N months"` when Bond exposes a real cadence
 *     (looked up across `packages[]` first — that's where Bond stores membership renewal
 *     packages — then a few legacy `resource.membership.*` shapes for cart-time payloads)
 *   - `null` when no real cadence can be derived (caller renders the price without the
 *     "/ period" suffix rather than fabricating a sentinel like "exp Dec 31, 2199")
 *
 * Bond's `endDate` on a membership product is a far-future sentinel (`2200-01-01`) for any
 * auto-renewing membership, so we **never** treat `endDate` as an expiration display. A real
 * fixed-end-date membership would have `endDate < year 2100`.
 */
export function membershipFrequencyLabel(node: ExtendedRequiredProductNode): string | null {
  const o = node as Record<string, unknown>;
  const product = (o.product as Record<string, unknown> | undefined) ?? null;
  const resource = (o.resource ?? product?.resource) as Record<string, unknown> | undefined;
  const membership = (resource?.membership ?? o.membership) as Record<string, unknown> | undefined;

  const months =
    pickNumber(membership, ["durationMonths", "months", "lengthMonths"]) ??
    pickNumber(o, ["durationMonths"]);
  const monthsLabel = monthsToCadenceLabel(months);
  if (monthsLabel) return monthsLabel;

  const intervalLabel = intervalEnumToCadenceLabel(
    pickString(membership, ["interval", "recurrenceInterval", "renewalInterval", "cadence", "frequency"]) ??
    pickString(o, ["interval", "recurrenceInterval", "renewalInterval", "cadence", "frequency"])
  );
  if (intervalLabel) return intervalLabel;

  const packages = Array.isArray(o.packages) ? (o.packages as Array<Record<string, unknown>>) : [];
  for (const pkg of packages) {
    const pkgMonths =
      pickNumber(pkg, ["durationMonths", "lengthMonths", "months"]);
    const pkgMonthsLabel = monthsToCadenceLabel(pkgMonths);
    if (pkgMonthsLabel) return pkgMonthsLabel;
    const pkgIntervalLabel = intervalEnumToCadenceLabel(
      pickString(pkg, ["renewalInterval", "recurrenceInterval", "interval", "cadence", "frequency"])
    );
    if (pkgIntervalLabel) return pkgIntervalLabel;
  }

  const realExpiration = pickString(membership, ["expirationDate", "validUntil", "expiresAt", "endDate"])
    ?? pickString(product, ["expirationDate", "validUntil", "expiresAt", "endDate"])
    ?? pickString(o, ["expirationDate", "validUntil", "expiresAt", "endDate"]);
  if (realExpiration && !isFarFutureSentinelDate(realExpiration)) {
    const formatted = formatUtcDateLabel(realExpiration);
    if (formatted) return `exp ${formatted}`;
  }
  return null;
}

export function membershipDisplaySummary(node: Record<string, unknown>): MembershipDisplaySummary {
  const records = candidateMembershipRecords(node);
  const productSubType = typeof node.productSubType === "string" ? node.productSubType : null;
  const audienceLabel = prettyEnumLabel(
    pickFirstStringFromRecords(records, ["customerType", "audience", "audienceType", "memberType", "membershipType", "memberCategory", "membershipCategory", "productSubType", "type"]) ??
      productSubType
  );
  const expirationLabel = realExpirationLabel(records);
  const cadenceLabel = renewalCadenceLabelFromRecords(records);
  const rawMode = pickFirstStringFromRecords(records, ["membershipType", "billingType", "membershipBillingType", "renewalType", "subscriptionType", "renewalMode"]);
  const autoRenews = pickFirstBooleanFromRecords(records, ["autoRenew", "autoRenews", "isRecurring", "recurring", "renews", "isRolling", "rolling"]);
  const isFixed = pickFirstBooleanFromRecords(records, ["isFixed", "fixed"]);
  const rawModeText = rawMode?.toLowerCase() ?? "";
  const modeLabel =
    expirationLabel || isFixed === true || rawModeText.includes("fixed")
      ? "Fixed"
      : autoRenews === true || rawModeText.includes("rolling") || rawModeText.includes("recurr") || rawModeText.includes("renew") || cadenceLabel
        ? "Renews"
        : null;
  return {
    audienceLabel,
    modeLabel,
    detailLabel: modeLabel === "Fixed" ? expirationLabel : cadenceLabel,
    frequencyLabel: membershipFrequencyLabel(node as ExtendedRequiredProductNode),
  };
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
