import type { OrganizationCartDto } from "@/types/online-booking";

/**
 * Tab session cart: **not** Bond’s server cart. Rows are appended only after a successful
 * `POST …/online-booking/create` (see `postOnlineBookingCreate`). Approval-only categories
 * defer that call until “Submit request”, so “Add to cart” there does **not** append a row
 * until the backend exposes a persisted cart (e.g. public GET cart / purchase APIs).
 */

/** One human-readable line in the cart (slot, membership, add-on, …). */
export type SessionCartDisplayLine = {
  title: string;
  meta?: string;
  amount: number | null;
  /** Drives labels/badges when expanding for bag + payment. */
  lineKind?: "booking" | "membership" | "addon";
  /** Catalog / promo discount — shown under meta on bag & payment (name, %, code). */
  discountNote?: string;
};

export type SessionCartSnapshot = {
  cart: OrganizationCartDto;
  productName: string;
  /** Who this cart row was created for (snapshot at add-to-cart time). */
  bookingForLabel?: string;
  /** Category required venue approval when this row was added — drives bag labels & line meta. */
  approvalRequired?: boolean;
  /** At add-to-cart time: GET …/required had no unpaid membership for this product (member rate for this rental). */
  participantHasQualifyingMembership?: boolean;
  /** Slot keys (`slotControlKey`) already committed with this cart row — hide from re-selection on the schedule. */
  reservedSlotKeys?: string[];
  /** Optional legacy rows in sessionStorage; prefer Bond `cart.cartItems` when present. */
  displayLines?: SessionCartDisplayLine[];
  /** Human slot summary for pending / synthetic rows (payment step) when Bond cart id is not yet persisted. */
  scheduleSummary?: string;
};

/** Bump when cart row shape or client logic changes so stale tabs don’t keep broken session rows. */
const STORAGE_KEY = "bond-rental-portal-session-carts-v4";

function normalizeDisplayLines(raw: unknown): SessionCartDisplayLine[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: SessionCartDisplayLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const title = typeof r.title === "string" && r.title.length > 0 ? r.title : null;
    if (!title) continue;
    const meta = typeof r.meta === "string" && r.meta.length > 0 ? r.meta : undefined;
    const amount =
      typeof r.amount === "number" && Number.isFinite(r.amount)
        ? r.amount
        : r.amount === null
          ? null
          : null;
    const lk = r.lineKind;
    const lineKind =
      lk === "booking" || lk === "membership" || lk === "addon" ? lk : undefined;
    const discountNote =
      typeof r.discountNote === "string" && r.discountNote.trim().length > 0
        ? r.discountNote.trim()
        : undefined;
    out.push({
      title,
      meta,
      amount,
      ...(lineKind ? { lineKind } : {}),
      ...(discountNote ? { discountNote } : {}),
    });
  }
  return out.length > 0 ? out : undefined;
}

function coerceCartId(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && /^\d+$/.test(raw.trim())) return Number(raw.trim());
  return null;
}

/** Bond / BFF may expose cart id on `id`, `cartId`, or `organizationCartId`. */
function extractPositiveCartIdFromRawCart(rawCart: Record<string, unknown>): number | null {
  for (const key of ["id", "cartId", "organizationCartId"] as const) {
    const n = coerceCartId(rawCart[key]);
    if (n != null && Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Normalize ids on carts returned from `POST …/online-booking/create` so merge (`cartId`) works
 * when Bond uses alternate field names.
 */
export function coerceCartFromApi(cart: OrganizationCartDto): OrganizationCartDto {
  const raw = cart as Record<string, unknown>;
  const id = extractPositiveCartIdFromRawCart(raw);
  if (id != null && id > 0) {
    return { ...cart, id };
  }
  return cart;
}

function normalizeRow(x: unknown, rowIndex: number): SessionCartSnapshot | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (o.cart && typeof o.cart === "object") {
    const rawCart = o.cart as Record<string, unknown>;
    let id = extractPositiveCartIdFromRawCart(rawCart);
    if (id == null) {
      // Bond sometimes omits or stringifies id; keep the row so multi-cart sessionStorage does not drop it.
      id = -(1_000_000 + rowIndex);
    }
    const cart = { ...rawCart, id } as OrganizationCartDto;
    const bookingForLabel =
      typeof o.bookingForLabel === "string" && o.bookingForLabel.trim().length > 0
        ? o.bookingForLabel.trim()
        : undefined;
    const displayLines = normalizeDisplayLines(o.displayLines);
    const rsk = o.reservedSlotKeys;
    const reservedSlotKeys =
      Array.isArray(rsk) && rsk.length > 0 && rsk.every((x) => typeof x === "string") ? rsk : undefined;
    const approvalRequired = o.approvalRequired === true ? true : undefined;
    const participantHasQualifyingMembership =
      o.participantHasQualifyingMembership === true ? true : undefined;
    const scheduleSummary =
      typeof o.scheduleSummary === "string" && o.scheduleSummary.trim().length > 0
        ? o.scheduleSummary.trim()
        : undefined;
    return {
      cart,
      productName: typeof o.productName === "string" && o.productName.length > 0 ? o.productName : "Booking",
      ...(bookingForLabel != null ? { bookingForLabel } : {}),
      ...(approvalRequired === true ? { approvalRequired: true } : {}),
      ...(participantHasQualifyingMembership === true ? { participantHasQualifyingMembership: true } : {}),
      ...(reservedSlotKeys != null ? { reservedSlotKeys } : {}),
      ...(displayLines != null ? { displayLines } : {}),
      ...(scheduleSummary != null ? { scheduleSummary } : {}),
    };
  }
  if (typeof (o as { id?: unknown }).id === "number") {
    return { cart: x as OrganizationCartDto, productName: "Booking" };
  }
  return null;
}

export function loadSessionCartSnapshots(): SessionCartSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row, i) => normalizeRow(row, i)).filter((r): r is SessionCartSnapshot => r != null);
  } catch {
    return [];
  }
}

export function saveSessionCartSnapshots(rows: SessionCartSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* quota / private mode */
  }
}
