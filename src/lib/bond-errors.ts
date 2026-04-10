import { BondBffError } from "./bond-json";

export type BondApiErrorBody = {
  statusCode?: number;
  code?: string;
  message?: string;
  path?: string;
  timestamp?: string;
};

export function asBondApiErrorBody(body: unknown): BondApiErrorBody | null {
  if (!body || typeof body !== "object") return null;
  return body as BondApiErrorBody;
}

/** User-facing line: message plus code when useful. */
export function formatBondUserMessage(err: BondBffError): string {
  const body = asBondApiErrorBody(err.body);
  const code = body?.code;
  const base = err.message || "Request failed";
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
export function formatIllegalPriceMessage(message: string, context?: ConsumerBookingErrorContext): string | null {
  const t = message.trim();
  if (!t) return null;
  if (!/illegal\s+price/i.test(t)) return null;
  const who = context?.customerLabel?.trim() || "this guest";
  const prod = context?.productName?.trim() || "this service";
  const base = `Price issue with ${who} on ${prod}. Try different times or add-ons, or contact the venue if this keeps happening.`;
  if (context?.mergingIntoExistingCart) {
    return `${base} Adding to an existing cart can use different unit prices than the schedule; try finishing this booking first or starting a new cart.`;
  }
  return base;
}

/** Map unknown errors (e.g. query failures) to the same friendly copy as {@link formatConsumerBookingError}. */
export function formatConsumerBookingErrorUnknown(err: unknown, context?: ConsumerBookingErrorContext): string {
  if (err instanceof BondBffError) return formatConsumerBookingError(err, context);
  if (err instanceof Error) {
    const fromMsg = formatIllegalPriceMessage(err.message, context);
    if (fromMsg) return fromMsg;
    const m = err.message.trim();
    if (m.length > 0 && m.length <= 220) return m;
    if (m.length > 220) return `${m.slice(0, 217)}…`;
  }
  return "Something went wrong. Please try again.";
}

/**
 * Short, non-technical copy for checkout / booking flows (hides internal codes).
 * Pass `context` when the message should name the customer or venue (e.g. eligibility errors).
 */
export function formatConsumerBookingError(
  err: BondBffError,
  context?: ConsumerBookingErrorContext
): string {
  if (err.status === 401 || err.status === 403) {
    return "Something went wrong. Please try again.";
  }
  const body = asBondApiErrorBody(err.body);
  const code = body?.code;
  const rawMsg = typeof body?.message === "string" ? body.message : "";

  const illegalFromBody = formatIllegalPriceMessage(rawMsg, context);
  if (illegalFromBody) return illegalFromBody;
  const illegalFromErr = formatIllegalPriceMessage(err.message ?? "", context);
  if (illegalFromErr) return illegalFromErr;

  if (code === "ONLINE_BOOKING.INVALID_PRODUCT") {
    const reservedEligibility =
      /reserved|everyone|specific memberships|specific clients/i.test(rawMsg) ||
      /must be reserved/i.test(rawMsg);
    if (reservedEligibility) {
      const who = context?.customerLabel?.trim() || "This account";
      const org =
        context?.orgName?.trim() ||
        "the venue";
      return `${who} isn’t eligible for this product. Try a different service or contact ${org} if you believe this is a mistake.`;
    }
    return "We couldn’t complete this booking with the selected options. Try different times or remove some add-ons, or contact the venue if this keeps happening.";
  }
  if (code === "SCHEDULE.MINIMUM_NOTICE_VIOLATION") {
    return formatBondUserMessage(err);
  }
  const raw = err.message || "Something went wrong. Please try again.";
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
