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
  /** Pre-discount list amount when Bond / UI shows strike vs net (promo, member pricing). */
  strikeAmount?: number;
  /** Drives labels/badges when expanding for bag + payment. */
  lineKind?: "booking" | "membership" | "addon";
  /** Catalog / promo discount — shown under meta on bag & payment (name, %, code). */
  discountNote?: string;
};

/** One participant’s reservation inside a merged Bond cart (same `cart.id`). */
export type SessionReservationGroup = {
  bookingForLabel: string;
  slotKeys: string[];
};

export type SessionCartSnapshot = {
  cart: OrganizationCartDto;
  productName: string;
  /** Who this cart row was created for (snapshot at add-to-cart time). */
  bookingForLabel?: string;
  /**
   * When one Bond cart holds multiple adds (merge), each participant’s label + slot keys.
   * Drives per-person bag sections; line assignment uses booking roots in `cartItems` order.
   */
  reservationGroups?: SessionReservationGroup[];
  /** Category required venue approval when this row was added — drives bag labels & line meta. */
  approvalRequired?: boolean;
  /**
   * Per-product approval flag accumulated across merges so mixed carts keep each product's
   * category setting — approval badges and dual CTAs then follow the product, not the cart row.
   */
  approvalByProductId?: Record<number, boolean>;
  /**
   * Per-product online name (the consumer-facing product name the user clicked on the picker).
   * Bond's `cartItem.product.name` echoes the back-office name; the cart UI must show the same
   * label the user just saw on the schedule, so we store the picker name keyed by `productId`
   * and look it up when rendering booking lines. Falls back to Bond's `product.name` when no
   * mapping is present (e.g. legacy session rows from before this field existed).
   */
  productNameByProductId?: Record<number, string>;
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
    const strikeAmount =
      typeof r.strikeAmount === "number" && Number.isFinite(r.strikeAmount) ? r.strikeAmount : undefined;
    out.push({
      title,
      meta,
      amount,
      ...(lineKind ? { lineKind } : {}),
      ...(discountNote ? { discountNote } : {}),
      ...(strikeAmount != null ? { strikeAmount } : {}),
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

/** Real Bond cart id (positive); session rows may use negative placeholders when the API omitted id. */
export function positiveBondCartId(cart: OrganizationCartDto): number | null {
  const id = coerceCartFromApi(cart).id;
  return typeof id === "number" && Number.isFinite(id) && id > 0 ? id : null;
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
    const rawRg = o.reservationGroups;
    let reservationGroups: SessionReservationGroup[] | undefined;
    if (Array.isArray(rawRg)) {
      const acc: SessionReservationGroup[] = [];
      for (const g of rawRg) {
        if (!g || typeof g !== "object") continue;
        const go = g as Record<string, unknown>;
        const lbl =
          typeof go.bookingForLabel === "string" && go.bookingForLabel.trim().length > 0
            ? go.bookingForLabel.trim()
            : "";
        const sk = go.slotKeys;
        const slotKeys =
          Array.isArray(sk) && sk.every((x) => typeof x === "string") ? (sk as string[]) : [];
        if (lbl.length > 0 || slotKeys.length > 0) {
          acc.push({ bookingForLabel: lbl.length > 0 ? lbl : "Booking", slotKeys });
        }
      }
      if (acc.length > 0) reservationGroups = acc;
    }
    const rsk = o.reservedSlotKeys;
    const reservedSlotKeys =
      Array.isArray(rsk) && rsk.length > 0 && rsk.every((x) => typeof x === "string") ? rsk : undefined;
    const approvalRequired = o.approvalRequired === true ? true : undefined;
    let approvalByProductId: Record<number, boolean> | undefined;
    if (o.approvalByProductId && typeof o.approvalByProductId === "object") {
      const acc: Record<number, boolean> = {};
      for (const [k, v] of Object.entries(o.approvalByProductId as Record<string, unknown>)) {
        const id = /^\d+$/.test(k) ? Number(k) : NaN;
        if (Number.isFinite(id) && id > 0 && typeof v === "boolean") acc[id] = v;
      }
      if (Object.keys(acc).length > 0) approvalByProductId = acc;
    }
    let productNameByProductId: Record<number, string> | undefined;
    if (o.productNameByProductId && typeof o.productNameByProductId === "object") {
      const acc: Record<number, string> = {};
      for (const [k, v] of Object.entries(o.productNameByProductId as Record<string, unknown>)) {
        const id = /^\d+$/.test(k) ? Number(k) : NaN;
        if (Number.isFinite(id) && id > 0 && typeof v === "string" && v.trim().length > 0) {
          acc[id] = v.trim();
        }
      }
      if (Object.keys(acc).length > 0) productNameByProductId = acc;
    }
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
      ...(approvalByProductId != null ? { approvalByProductId } : {}),
      ...(productNameByProductId != null ? { productNameByProductId } : {}),
      ...(participantHasQualifyingMembership === true ? { participantHasQualifyingMembership: true } : {}),
      ...(reservedSlotKeys != null ? { reservedSlotKeys } : {}),
      ...(displayLines != null ? { displayLines } : {}),
      ...(reservationGroups != null ? { reservationGroups } : {}),
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
