import { BondBffError } from "@/lib/bond-json";

export type ConsumerPaymentOptionDto = {
  id?: string | number;
  label?: string;
  /** Bond may use different shapes — normalize in UI. */
  [key: string]: unknown;
};

/** Fee rule on a consumer payment option row (from Bond v4 `options` API). */
export type ConsumerPaymentFeeDto = {
  percentageValue?: number;
  fixValue?: number;
  min?: number | null;
  max?: number | null;
  name?: string;
  type?: string;
  [key: string]: unknown;
};

/** One selectable instrument or org default method for checkout UI. */
export type ConsumerPaymentChoice = {
  /** Stable React / selection key (not necessarily Bond `paymentMethodId`). */
  id: string;
  /** Bond `POST …/cart/{id}/finalize` expects this **integer** (not Stripe `pm_…`). */
  finalizePaymentMethodId: number;
  /** Stripe PaymentMethod id when Bond stores one on the consumer instrument row. */
  stripePaymentMethodId?: string;
  /** Accessible / legacy single-line label. */
  label: string;
  /** Primary row in the payment picker (e.g. `Visa 4242`). */
  displayPrimary: string;
  /** `MM/YY` for cards when Bond sends expiry fields. */
  displayExpiry: string | null;
  /** Bond `isDefault` on the saved instrument. */
  isDefaultPaymentMethod: boolean;
  methodType: string;
  subType: string | null;
  fee: ConsumerPaymentFeeDto | null;
  /** Saved Stripe-style id (`pm_…`) when paying with a card on file. */
  isSavedCard: boolean;
};

function coerceNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function capWord(s: string): string {
  const t = s.trim();
  if (!t.length) return t;
  return t[0]!.toUpperCase() + t.slice(1).toLowerCase();
}

function humanizeMethodType(pmt: string, sub: string | null): string {
  if (pmt === "card") return sub === "credit" ? "Credit card" : "Card";
  if (pmt === "us_bank_account") return "Bank account";
  if (pmt === "gift-card") return "Gift card";
  return pmt.replace(/-/g, " ");
}

/** `MM/YY` for card rows when Bond sends month/year (names vary). */
function formatCardExpiryShort(o: Record<string, unknown>): string | null {
  const m = coerceNum(o.ccExpMonth ?? o.expMonth ?? o.cardExpMonth ?? o.exp_month);
  let y = coerceNum(o.ccExpYear ?? o.expYear ?? o.cardExpYear ?? o.exp_year);
  if (m != null && m >= 1 && m <= 12 && y != null && y > 0) {
    const yy = y >= 100 ? Math.trunc(y) % 100 : Math.trunc(y);
    return `${String(Math.trunc(m)).padStart(2, "0")}/${String(yy).padStart(2, "0")}`;
  }
  const raw =
    (typeof o.expiration === "string" && o.expiration.trim()) ||
    (typeof o.cardExpiration === "string" && o.cardExpiration.trim()) ||
    "";
  if (/^\d{1,2}\/\d{2}$/.test(raw)) {
    const [a, b] = raw.split("/");
    return `${a!.padStart(2, "0")}/${b!}`;
  }
  return null;
}

/**
 * Estimated processing / transaction fee for a subtotal (after line discounts, before this fee).
 * `percentageValue` from Bond is a decimal fraction (e.g. `0.1` = 10%, `0.01` = 1%).
 */
export function computeConsumerPaymentProcessingFee(
  amountAfterDiscountBeforeFee: number,
  fee: ConsumerPaymentFeeDto | null
): number | null {
  if (!fee || amountAfterDiscountBeforeFee <= 0) return null;
  const pct = coerceNum(fee.percentageValue);
  const fix = coerceNum(fee.fixValue) ?? 0;
  let add = fix;
  if (pct != null && pct > 0) {
    const rate = pct > 1 ? pct / 100 : pct;
    add += amountAfterDiscountBeforeFee * rate;
  }
  const min = coerceNum(fee.min);
  const max = coerceNum(fee.max);
  if (min != null && min > 0) add = Math.max(add, min);
  if (max != null && max > 0) add = Math.min(add, max);
  return Math.round(add * 100) / 100;
}

const HIDE_PAYMENT_METHOD_TYPES = new Set([
  "cash",
  "balance",
  "gift-card",
  "gift_card",
  "check",
]);

function inferBondFinalizePaymentMethodId(o: Record<string, unknown>): number | null {
  for (const k of [
    "id",
    "paymentMethodProfileId",
    "consumerPaymentMethodId",
    "bondPaymentMethodId",
    "paymentMethodId",
  ] as const) {
    const raw = o[k];
    if (k === "paymentMethodId" && typeof raw === "string" && raw.startsWith("pm_")) {
      continue;
    }
    const n = coerceNum(raw);
    if (n != null && n > 0 && Number.isInteger(n)) return n;
  }
  return null;
}

/**
 * Human-readable fee rule for labels (e.g. "10% + $0.30"). Does not include computed dollars for the cart.
 */
export function formatConsumerPaymentFeeRuleSummary(fee: ConsumerPaymentFeeDto | null): string | null {
  if (!fee) return null;
  const parts: string[] = [];
  const pct = coerceNum(fee.percentageValue);
  if (pct != null && pct > 0) {
    const displayPct = pct > 1 ? pct : pct * 100;
    const rounded = Math.round(displayPct * 1000) / 1000;
    parts.push(`${rounded}%`);
  }
  const fix = coerceNum(fee.fixValue);
  if (fix != null && fix > 0) {
    parts.push(`$${fix.toFixed(2)}`);
  }
  if (parts.length === 0) return null;
  return parts.join(" + ");
}

/**
 * Flatten Bond `GET …/user/{id}/options?platform=consumer` rows into selectable choices.
 * `finalizePaymentMethodId` is Bond’s integer id for cart finalize (not Stripe `pm_…`).
 */
export function flattenConsumerPaymentChoices(
  raw: ConsumerPaymentOptionDto[]
): ConsumerPaymentChoice[] {
  if (!raw?.length) return [];
  const hasSavedCard = raw.some(
    (row) =>
      row.paymentMethodType === "card" &&
      Array.isArray((row as { options?: unknown }).options) &&
      ((row as { options?: unknown[] }).options?.length ?? 0) > 0
  );
  const out: ConsumerPaymentChoice[] = [];
  for (const row of raw) {
    const r = row as Record<string, unknown>;
    const pmt = typeof r.paymentMethodType === "string" ? r.paymentMethodType : "";
    if (!pmt) continue;
    if (HIDE_PAYMENT_METHOD_TYPES.has(pmt.toLowerCase())) continue;
    const sub = typeof r.subPaymentMethodType === "string" ? r.subPaymentMethodType : null;
    const fee = (r.fee && typeof r.fee === "object" ? r.fee : null) as ConsumerPaymentFeeDto | null;
    const options = r.options;
    if (pmt === "us_bank_account" && (!Array.isArray(options) || options.length === 0)) {
      continue;
    }
    if (pmt === "card" && hasSavedCard && (!Array.isArray(options) || options.length === 0)) {
      continue;
    }
    if (Array.isArray(options) && options.length > 0) {
      for (const opt of options) {
        if (!opt || typeof opt !== "object") continue;
        const o = opt as Record<string, unknown>;
        const finalizeId = inferBondFinalizePaymentMethodId(o);
        if (finalizeId == null) continue;
        const pmStripe = typeof o.paymentMethodId === "string" ? o.paymentMethodId : "";
        const uiId = `bond-pm-${finalizeId}${pmStripe ? `-${pmStripe.slice(-6)}` : ""}`;
        const brand = typeof o.ccBrand === "string" ? o.ccBrand : "Card";
        const last4 = typeof o.ccLast4 === "string" ? o.ccLast4 : "••••";
        const isDef = o.isDefault === true;
        const bankLabel =
          pmt === "us_bank_account"
            ? `${typeof o.bankName === "string" ? o.bankName : "Bank"} ·••• ${last4}`
            : `${capWord(brand)} ·••• ${last4}${isDef ? " · Default" : ""}`;
        const displayPrimary =
          pmt === "us_bank_account"
            ? `${typeof o.bankName === "string" ? o.bankName : "Bank"} ${last4}`
            : `${capWord(brand)} ${last4}`;
        const displayExpiry = pmt === "card" ? formatCardExpiryShort(o) : null;
        out.push({
          id: uiId,
          finalizePaymentMethodId: finalizeId,
          stripePaymentMethodId: pmStripe.length > 0 ? pmStripe : undefined,
          label: bankLabel,
          displayPrimary,
          displayExpiry,
          isDefaultPaymentMethod: pmt === "card" ? isDef : false,
          methodType: pmt,
          subType: sub,
          fee,
          isSavedCard: pmt === "card",
        });
      }
    } else {
      const finalizeId = inferBondFinalizePaymentMethodId(r);
      if (finalizeId == null) continue;
      const id = `bond-${pmt}${sub ? `-${sub}` : ""}-${finalizeId}`;
      const hum = humanizeMethodType(pmt, sub);
      out.push({
        id,
        finalizePaymentMethodId: finalizeId,
        label: hum,
        displayPrimary: hum,
        displayExpiry: null,
        isDefaultPaymentMethod: false,
        methodType: pmt,
        subType: sub,
        fee,
        isSavedCard: false,
      });
    }
  }
  return out;
}

function normalizeOptionsPayload(parsed: unknown): ConsumerPaymentOptionDto[] {
  if (Array.isArray(parsed)) {
    return parsed.filter((x): x is ConsumerPaymentOptionDto => x != null && typeof x === "object");
  }
  if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    const data = o.data;
    if (Array.isArray(data)) {
      return data.filter((x): x is ConsumerPaymentOptionDto => x != null && typeof x === "object");
    }
  }
  return [];
}

/**
 * `GET /api/bond-payment/organization/{orgId}/user/{userId}/options` — cookies only; proxies v4 Bond.
 */
export async function fetchConsumerPaymentOptions(
  orgId: number,
  userId: number
): Promise<ConsumerPaymentOptionDto[]> {
  const path = `/api/bond-payment/organization/${orgId}/user/${userId}/options`;
  const res = await fetch(`${path}?platform=consumer`, {
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const raw = await res.text();
  const text = raw.replace(/^\uFEFF/, "").trim();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new BondBffError(res.status, "Payment options response was not JSON", text);
    }
  }
  if (!res.ok) {
    const msg =
      parsed && typeof parsed === "object" && typeof (parsed as { message?: string }).message === "string"
        ? (parsed as { message: string }).message
        : "Could not load payment methods";
    throw new BondBffError(res.status, msg, parsed);
  }
  return normalizeOptionsPayload(parsed);
}

export function paymentOptionPickId(opt: ConsumerPaymentOptionDto): string | null {
  if (typeof opt.id === "number" && Number.isFinite(opt.id)) return String(opt.id);
  if (typeof opt.id === "string" && opt.id.length > 0) return opt.id;
  return null;
}

export function paymentOptionPickLabel(opt: ConsumerPaymentOptionDto): string {
  if (typeof opt.label === "string" && opt.label.trim().length > 0) return opt.label.trim();
  const id = paymentOptionPickId(opt);
  return id != null ? `Method ${id}` : "Payment method";
}
