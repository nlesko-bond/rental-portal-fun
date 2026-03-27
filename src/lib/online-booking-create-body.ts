import type { PickedSlot } from "./slot-selection";

/**
 * Body for `POST /v1/organization/{orgId}/online-booking/create` (`cartReservation` → `CreateBookingDto`).
 * Hosted Swagger may omit this DTO; field names below match what Bond’s Nest validator accepts today:
 * **`segments`** (not `timeSlots`), each with **`endDate`**, plus **`onlineBookingPortalId`**, **`userId`**, etc.
 * If the API returns 400, compare your payload to the deployed `CreateBookingDto` in `online-booking.controller.ts`.
 */
export function buildOnlineBookingCreateBody(opts: {
  userId: number;
  portalId: number;
  facilityId: number;
  categoryId: number;
  productId: number;
  slots: PickedSlot[];
  /** Optional add-on product ids (reservation-level). */
  addonProductIds?: number[];
  /** If Bond exposes answers on create; omit or rename to match `CreateBookingDto` if 400. */
  questionnaireAnswers?: Array<{ questionnaireId: number; questionId: number; value: string }>;
}): Record<string, unknown> {
  /** Bond validates `segments` (not `timeSlots`); each segment needs `endDate` (same calendar day for hourly rentals). */
  const segments = opts.slots.map((s) => ({
    resourceId: s.resourceId,
    startDate: s.startDate,
    endDate: s.startDate,
    startTime: s.startTime,
    endTime: s.endTime,
    price: s.price,
  }));
  return {
    userId: opts.userId,
    onlineBookingPortalId: opts.portalId,
    facilityId: opts.facilityId,
    categoryId: opts.categoryId,
    productId: opts.productId,
    segments,
    ...(opts.addonProductIds && opts.addonProductIds.length > 0
      ? { addonProductIds: opts.addonProductIds }
      : {}),
    ...(opts.questionnaireAnswers && opts.questionnaireAnswers.length > 0
      ? { questionnaireAnswers: opts.questionnaireAnswers }
      : {}),
  };
}
