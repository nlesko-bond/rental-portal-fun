import { BondBffError } from "./bond-json";

export type BondApiErrorBody = {
  statusCode?: number;
  code?: string;
  message?: string | string[] | Record<string, unknown>;
  path?: string;
  timestamp?: string;
};

export type ErrorsTranslator = (key: string, values?: Record<string, string | number>) => string;

export function asBondApiErrorBody(body: unknown): BondApiErrorBody | null {
  if (!body || typeof body !== "object") return null;
  return body as BondApiErrorBody;
}

function bondApiMessageString(body: BondApiErrorBody | null): string {
  if (body && typeof body === "object" && "Message" in body) {
    const cap = (body as { Message?: unknown }).Message;
    if (typeof cap === "string" && cap.length > 0) return cap;
  }
  const m = body?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length > 0) {
    const lines = m.filter((x): x is string => typeof x === "string");
    if (lines.length > 0) return lines.join("; ");
  }
  if (m != null && typeof m === "object" && !Array.isArray(m)) {
    const o = m as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.length > 0) return o.message;
    const s = JSON.stringify(m);
    if (s !== "{}" && s !== "null") return s;
  }
  return "";
}

/** User-facing line: message plus code when useful. */
export function formatBondUserMessage(err: BondBffError, t: ErrorsTranslator): string {
  const body = asBondApiErrorBody(err.body);
  const code = body?.code;
  const base = err.message || t("requestFailed");
  if (code && !base.includes(code)) {
    return `${base} (${code})`;
  }
  return base;
}

export type ConsumerBookingErrorContext = {
  /** Person the booking is for (e.g. first name or "You"). */
  customerLabel?: string;
  /** Organization / venue display name from the portal. */
  orgName?: string;
  /** Product / service display name (replaces numeric ids in pricing errors). */
  productName?: string;
  /** `POST …/online-booking/create` includes `cartId` — Bond may price slots differently than GET schedule. */
  mergingIntoExistingCart?: boolean;
};

/**
 * Bond sometimes returns messages like `Illegal price: $100 for user '213759' of product '89453'`.
 * The dollar amount is **Bond’s expected unit price** for that slot in context — not necessarily what the
 * schedule grid showed. **GET …/schedule** has no `cartId`; **create** with `cartId` can apply tiered or
 * cart-level rules, so declared `price` on each segment must match Bond’s engine, not only the matrix cell.
 * Never surface raw ids — use guest + product labels from context.
 */
export function formatIllegalPriceMessage(
  message: string,
  t: ErrorsTranslator,
  context?: ConsumerBookingErrorContext
): string | null {
  const tmsg = message.trim();
  if (!tmsg) return null;
  if (!/illegal\s+price/i.test(tmsg)) return null;
  const who = context?.customerLabel?.trim() || t("guestFallback");
  const prod = context?.productName?.trim() || t("serviceFallback");
  let base = t("illegalPrice", { who, prod });
  if (context?.mergingIntoExistingCart) {
    base += t("illegalPriceMerge");
  }
  return base;
}

/** Map unknown errors (e.g. query failures) to the same friendly copy as {@link formatConsumerBookingError}. */
export function formatConsumerBookingErrorUnknown(
  err: unknown,
  t: ErrorsTranslator,
  context?: ConsumerBookingErrorContext
): string {
  if (err instanceof BondBffError) return formatConsumerBookingError(err, t, context);
  if (err instanceof Error) {
    const fromMsg = formatIllegalPriceMessage(err.message, t, context);
    if (fromMsg) return fromMsg;
    const m = err.message.trim();
    if (m.length > 0 && m.length <= 220) return m;
    if (m.length > 220) return `${m.slice(0, 217)}…`;
  }
  return t("somethingWrong");
}

/**
 * Short, non-technical copy for checkout / booking flows (hides internal codes).
 * Pass `context` when the message should name the customer or venue (e.g. eligibility errors).
 */
export function formatConsumerBookingError(
  err: BondBffError,
  t: ErrorsTranslator,
  context?: ConsumerBookingErrorContext
): string {
  if (err.status === 401 || err.status === 403) {
    return t("somethingWrong");
  }
  const body = asBondApiErrorBody(err.body);
  const code = body?.code;
  const rawMsg = bondApiMessageString(body);

  const illegalFromBody = formatIllegalPriceMessage(rawMsg, t, context);
  if (illegalFromBody) return illegalFromBody;
  const illegalFromErr = formatIllegalPriceMessage(err.message ?? "", t, context);
  if (illegalFromErr) return illegalFromErr;

  if (code === "ONLINE_BOOKING.TOO_SOON") {
    return t("bookingTooSoon");
  }
  if (code === "ONLINE_BOOKING.MAX_HOURS_EXCEEDED") {
    const who = context?.customerLabel?.trim() || t("guestFallback");
    return t("maxBookableHoursForDay", { who });
  }
  if (code === "ONLINE_BOOKING.INVALID_PRODUCT") {
    const reservedEligibility =
      /reserved|everyone|specific memberships|specific clients/i.test(rawMsg) ||
      /must be reserved/i.test(rawMsg);
    if (reservedEligibility) {
      const who = context?.customerLabel?.trim() || t("thisAccount");
      const org = context?.orgName?.trim() || t("venueFallback");
      return t("notEligible", { who, org });
    }
    return t("invalidProductGeneric");
  }
  if (code === "SCHEDULE.MINIMUM_NOTICE_VIOLATION") {
    return formatBondUserMessage(err, t);
  }
  const raw = err.message || t("somethingWrong");
  if (raw.length > 220) return `${raw.slice(0, 217)}…`;
  return raw;
}

export function extractEarliestBookableInstantFromNoticeMessage(message: string): string | null {
  const quoted = message.match(/which\s+is\s+["']([^"']+)["']/i);
  if (quoted?.[1]) return normalizeInstant(quoted[1]);
  const iso = message.match(/(\d{4}-\d{2}-\d{2}[tT]\d{2}:\d{2}:\d{2}(?:\.\d+)?)/);
  if (iso?.[1]) return normalizeInstant(iso[1]);
  return null;
}

function normalizeInstant(s: string): string {
  return s.trim().replace("t", "T");
}

/** Calendar key Bond uses in `dates[]` — notice payloads usually include it as the date prefix of the instant. */
export function calendarDateKeyFromNoticeInstant(iso: string): string {
  return normalizeInstant(iso).slice(0, 10);
}

export function isScheduleMinimumNoticeViolation(err: unknown): err is BondBffError {
  if (!(err instanceof BondBffError) || err.status !== 400) return false;
  const b = asBondApiErrorBody(err.body);
  return b?.code === "SCHEDULE.MINIMUM_NOTICE_VIOLATION";
}
