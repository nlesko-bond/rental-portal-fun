/** Best-effort fields from `POST …/cart/{id}/finalize` (`GenericResponseDto` + `SimpleInvoiceDto` / variants). */
export type FinalizeSuccessDisplay = {
  /** Display + copy — prefer numeric Bond invoice `id` when present. */
  invoiceRef?: string;
  /** Bond invoice primary key (`data.id`) for Squad C deep links. */
  invoiceNumericId?: number;
  reservationRef?: string;
};

/** Consumer invoice screen on Squad C (`invoiceId` path segment + org + user query params). */
export function buildSquadCInvoicePortalUrl(
  organizationId: number,
  userId: number,
  invoiceId: number
): string {
  return `https://squad-c.bondsports.co/invoice/${invoiceId}?o=${organizationId}&u=${userId}`;
}

export function parseFinalizeCartResponse(raw: unknown): FinalizeSuccessDisplay {
  if (raw == null || typeof raw !== "object") return {};
  const root = raw as Record<string, unknown>;
  const data =
    root.data != null && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const str = (k: string): string | undefined =>
    typeof data[k] === "string" && (data[k] as string).length > 0 ? (data[k] as string) : undefined;

  const invoiceIdDigits = ((): string | undefined => {
    const s = str("invoiceId");
    if (s != null && /^\d+$/.test(s.trim())) return s.trim();
    return undefined;
  })();

  let invoiceNumericId: number | undefined =
    typeof data.id === "number" && Number.isFinite(data.id) && data.id > 0 ? Math.trunc(data.id) : undefined;
  if (invoiceNumericId == null && invoiceIdDigits != null) {
    const n = Number(invoiceIdDigits);
    if (Number.isFinite(n) && n > 0) invoiceNumericId = Math.trunc(n);
  }

  const invoiceRef =
    invoiceNumericId != null
      ? String(invoiceNumericId)
      : str("invoiceNumber") ?? invoiceIdDigits ?? str("invoiceId");

  const reservationRef =
    str("reservationId") ??
    str("reservationNumber") ??
    str("confirmationNumber") ??
    str("reference") ??
    undefined;

  return { invoiceRef, ...(invoiceNumericId != null ? { invoiceNumericId } : {}), reservationRef };
}
