import type { OrganizationCartDto } from "@/types/online-booking";

export type SessionCartSnapshot = {
  cart: OrganizationCartDto;
  productName: string;
};

const STORAGE_KEY = "bond-rental-portal-session-carts-v2";

function normalizeRow(x: unknown): SessionCartSnapshot | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (o.cart && typeof o.cart === "object" && typeof (o.cart as { id?: unknown }).id === "number") {
    return {
      cart: o.cart as OrganizationCartDto,
      productName: typeof o.productName === "string" && o.productName.length > 0 ? o.productName : "Booking",
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
    return parsed.map(normalizeRow).filter((r): r is SessionCartSnapshot => r != null);
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
