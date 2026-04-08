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
};

export type SessionCartSnapshot = {
  cart: OrganizationCartDto;
  productName: string;
  /** Who this cart row was created for (snapshot at add-to-cart time). */
  bookingForLabel?: string;
  /** Optional legacy rows in sessionStorage; prefer Bond `cart.cartItems` when present. */
  displayLines?: SessionCartDisplayLine[];
};

const STORAGE_KEY = "bond-rental-portal-session-carts-v2";

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
    out.push({ title, meta, amount });
  }
  return out.length > 0 ? out : undefined;
}

function coerceCartId(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && /^\d+$/.test(raw.trim())) return Number(raw.trim());
  return null;
}

function normalizeRow(x: unknown, rowIndex: number): SessionCartSnapshot | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (o.cart && typeof o.cart === "object") {
    const rawCart = o.cart as Record<string, unknown>;
    let id = coerceCartId(rawCart.id);
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
    return {
      cart,
      productName: typeof o.productName === "string" && o.productName.length > 0 ? o.productName : "Booking",
      ...(bookingForLabel != null ? { bookingForLabel } : {}),
      ...(displayLines != null ? { displayLines } : {}),
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
