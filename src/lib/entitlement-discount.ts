/**
 * Apply product `entitlementDiscounts[]` to a schedule **unit** price (Bond slot row).
 * Bond does not always return member-adjusted slot prices; when entitlements list percent/fixed
 * discounts, we mirror catalog behavior for display and checkout line amounts.
 *
 * Handles common shapes; extend when OpenAPI documents `EntitlementDiscountDto` precisely.
 */

const PROMO_NAME_KEYS = [
  "promoGroupName",
  "promotionGroupName",
  "discountGroupName",
  "groupName",
  "promotionName",
  "promoName",
  "couponName",
] as const;

const MEMBERSHIP_NAME_KEYS = [
  "membershipName",
  "membershipProductName",
  "membershipPlanName",
  "planName",
  "memberPlanName",
] as const;

const GENERIC_NAME_KEYS = ["name", "label", "title", "displayName"] as const;

type DiscountOrigin = "promo" | "membership" | "unknown";

function coerceFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function pickFirstString(obj: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

function nestedRecord(obj: Record<string, unknown>, key: string): Record<string, unknown> | null {
  const v = obj[key];
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

/** Promo / coupon group label (not the raw code — use when origin is promo). */
function pickPromoGroupName(
  e: Record<string, unknown>,
  nested: Record<string, unknown> | null,
  reason: Record<string, unknown> | null
): string | null {
  const fromNestedPromo =
    pickFirstString(nested ?? {}, PROMO_NAME_KEYS) ??
    pickFirstString(nestedRecord(nested ?? {}, "promotion") ?? {}, GENERIC_NAME_KEYS) ??
    pickFirstString(nestedRecord(nested ?? {}, "promotionGroup") ?? {}, GENERIC_NAME_KEYS) ??
    pickFirstString(nestedRecord(nested ?? {}, "promo") ?? {}, GENERIC_NAME_KEYS);
  return (
    pickFirstString(e, PROMO_NAME_KEYS) ??
    pickFirstString(nestedRecord(e, "promotionGroup") ?? {}, GENERIC_NAME_KEYS) ??
    fromNestedPromo ??
    pickFirstString(reason ?? {}, [...PROMO_NAME_KEYS, "code", "promoCode"])
  );
}

function pickMembershipDisplayName(
  e: Record<string, unknown>,
  nested: Record<string, unknown> | null,
  reason: Record<string, unknown> | null
): string | null {
  const product = nestedRecord(e, "product") ?? nestedRecord(nested ?? {}, "product");
  const pt = product ? String(product.productType ?? "").toLowerCase() : "";
  const productName =
    product && (pt === "membership" || pt === "pass" || pt === "plan")
      ? pickFirstString(product, ["name", "title", "label"])
      : null;
  const reasonMembership = nestedRecord(reason ?? {}, "membership");
  return (
    pickFirstString(e, MEMBERSHIP_NAME_KEYS) ??
    pickFirstString(nestedRecord(e, "membership") ?? {}, GENERIC_NAME_KEYS) ??
    pickFirstString(nested ?? {}, MEMBERSHIP_NAME_KEYS) ??
    pickFirstString(reason ?? {}, [...MEMBERSHIP_NAME_KEYS, "productName"]) ??
    pickFirstString(reasonMembership ?? {}, GENERIC_NAME_KEYS) ??
    productName
  );
}

function inferDiscountOrigin(
  e: Record<string, unknown>,
  nested: Record<string, unknown> | null,
  reason: Record<string, unknown> | null
): DiscountOrigin {
  const blob = [
    e.discountSource,
    e.source,
    e.sourceType,
    e.type,
    e.discountType,
    e.entitlementType,
    nested?.discountType,
    nested?.type,
    nested?.source,
    reason?.type,
    reason?.reason,
  ]
    .filter((x): x is string => typeof x === "string")
    .join(" ")
    .toLowerCase();

  if (/promo|coupon|code|group|campaign/.test(blob) && !/member/.test(blob)) return "promo";
  if (/member|plan|subscription|entitlement/.test(blob)) return "membership";

  if (e.promoCode || e.promotionCode || e.couponCode) return "promo";
  if (e.membershipId != null || e.membershipProductId != null) return "membership";

  const promoName = pickPromoGroupName(e, nested, reason);
  const memName = pickMembershipDisplayName(e, nested, reason);
  if (promoName && !memName) return "promo";
  if (memName && !promoName) return "membership";

  return "unknown";
}

/**
 * Human-facing name for the thing that triggered the discount: promo **group** or **membership** name when Bond sends them.
 */
export function resolveDiscountTriggerName(
  e: Record<string, unknown>,
  nestedDiscount?: Record<string, unknown> | null,
  reasonObj?: Record<string, unknown> | null
): string | null {
  const nested = nestedDiscount ?? null;
  const reason = reasonObj ?? null;
  const origin = inferDiscountOrigin(e, nested, reason);
  const promo = pickPromoGroupName(e, nested, reason);
  const membership = pickMembershipDisplayName(e, nested, reason);
  const generic =
    pickFirstString(e, GENERIC_NAME_KEYS) ??
    pickFirstString(nested ?? {}, GENERIC_NAME_KEYS) ??
    pickFirstString(reason ?? {}, ["reason", "message", "description"]);

  if (origin === "promo") return promo ?? membership ?? generic;
  if (origin === "membership") return membership ?? promo ?? generic;
  return promo ?? membership ?? generic;
}

function catalogPct(e: Record<string, unknown>): number | null {
  const pct =
    coerceFiniteNumber(e.percentage) ??
    coerceFiniteNumber(e.percent) ??
    coerceFiniteNumber(e.discountPercent) ??
    coerceFiniteNumber(
      typeof e.value === "number" && String(e.discountType ?? e.type ?? "").toLowerCase() === "percent"
        ? e.value
        : null
    );
  return pct != null && Number.isFinite(pct) && pct > 0 ? pct : null;
}

/** Short label for totals UI when Bond only returns a single “discounts” line (name + % from product catalog). */
export function describeEntitlementsForDisplay(entitlements: unknown[] | undefined): string | undefined {
  if (!entitlements?.length) return undefined;
  const parts: string[] = [];
  for (const raw of entitlements) {
    if (!raw || typeof raw !== "object") continue;
    const e = raw as Record<string, unknown>;
    const nested =
      nestedRecord(e, "discount") ??
      nestedRecord(e, "promotion") ??
      nestedRecord(e, "promotionGroup") ??
      null;
    const name = resolveDiscountTriggerName(e, nested, null);
    const pct = catalogPct(e);
    if (pct != null) {
      parts.push(name ? `${name} (${pct}%)` : `${pct}% off`);
    } else if (name) {
      parts.push(name);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/** Collapse duplicate segments like `NICOLEROCKS10 (10%) · NICOLEROCKS10 (10%)` (Bond may echo the same discount twice). */
export function dedupeDiscountCaptionSegments(label: string | undefined): string | undefined {
  if (label == null || label.trim().length === 0) return undefined;
  const bits = label.split(" · ").map((s) => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of bits) {
    const k = b.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(b);
  }
  return out.length > 0 ? out.join(" · ") : undefined;
}

/**
 * One line’s discount caption from Bond `cartItems[]` (and nested `discount` / `discounts[]`).
 */
export function describeCartItemDiscountLabels(it: Record<string, unknown>): string | undefined {
  const parts: string[] = [];

  const formatEntry = (r: Record<string, unknown>): string | null => {
    const nested = r.discount && typeof r.discount === "object" ? (r.discount as Record<string, unknown>) : null;
    const reason = r.reason && typeof r.reason === "object" ? (r.reason as Record<string, unknown>) : null;
    const name = resolveDiscountTriggerName(r, nested, reason);
    const pct =
      coerceFiniteNumber(nested?.percentageValue) ??
      coerceFiniteNumber(r.percentage) ??
      coerceFiniteNumber(r.percent);
    if (pct != null && pct > 0) return name ? `${name} (${pct}%)` : `${pct}% off`;
    if (name) return name;
    return null;
  };

  const raw = it.discounts;
  if (Array.isArray(raw)) {
    for (const d of raw) {
      if (!d || typeof d !== "object") continue;
      const line = formatEntry(d as Record<string, unknown>);
      if (line) parts.push(line);
    }
  }
  if (parts.length === 0 && it.discount && typeof it.discount === "object") {
    const line = formatEntry(it.discount as Record<string, unknown>);
    if (line) parts.push(line);
  }

  const promo = it.promoCode ?? it.promotionCode ?? it.couponCode;
  if (typeof promo === "string" && promo.trim().length > 0) {
    const code = promo.trim();
    const dup = parts.some((p) => p.toLowerCase().includes(code.toLowerCase()));
    if (!dup) parts.push(`Code ${code}`);
  }
  return dedupeDiscountCaptionSegments(parts.length > 0 ? parts.join(" · ") : undefined);
}

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

/**
 * Approximate pre-discount unit price for display (strikethrough) by undoing
 * `applyEntitlementDiscountsToUnitPrice` in reverse entitlement order.
 */
export function reverseEntitlementDiscountsToUnitPrice(
  discountedPrice: number,
  entitlements: unknown[] | undefined
): number {
  if (!Number.isFinite(discountedPrice) || !entitlements?.length) return discountedPrice;
  let price = discountedPrice;
  for (let i = entitlements.length - 1; i >= 0; i--) {
    const raw = entitlements[i];
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
    if (pct != null && Number.isFinite(pct) && pct > 0 && pct < 100) {
      price = price / (1 - Math.min(100, pct) / 100);
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
      price = price + fixed;
    }
  }
  return price;
}
