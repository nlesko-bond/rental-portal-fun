/**
 * Consumer web app host (Squad C “shell” — reservations, invoices in browser).
 * Override per env when staging/production domains differ from API hosts.
 */

const DEFAULT_CONSUMER_ORIGIN = "https://squad-c.bondsports.co";

export function consumerWebOrigin(): string {
  const raw =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_BOND_CONSUMER_WEB_ORIGIN : undefined;
  if (typeof raw === "string") {
    const t = raw.trim().replace(/\/$/, "");
    if (t.length > 0) return t;
  }
  return DEFAULT_CONSUMER_ORIGIN;
}

/** Squad C consumer “My reservations” (logged-in user). */
export function consumerReservationsUrl(): string {
  return `${consumerWebOrigin()}/user/reservations`;
}

/** Deep link to consumer invoice detail (`?o=` org, `?u=` Bond user id). */
export function consumerInvoiceUrl(organizationId: number, userId: number, invoiceId: number): string {
  const o = consumerWebOrigin();
  return `${o}/invoice/${invoiceId}?o=${organizationId}&u=${userId}`;
}
