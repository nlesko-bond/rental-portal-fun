import type { PickedSlot } from "./slot-selection";

/**
 * Best-effort body for `POST .../online-booking/create`.
 * Public OpenAPI does not document the request schema — adjust if Bond returns 400 with validation hints.
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
}): Record<string, unknown> {
  return {
    userId: opts.userId,
    onlineBookingPortalId: opts.portalId,
    facilityId: opts.facilityId,
    categoryId: opts.categoryId,
    productId: opts.productId,
    timeSlots: opts.slots.map((s) => ({
      resourceId: s.resourceId,
      startDate: s.startDate,
      startTime: s.startTime,
      endTime: s.endTime,
      price: s.price,
    })),
    ...(opts.addonProductIds && opts.addonProductIds.length > 0
      ? { addonProductIds: opts.addonProductIds }
      : {}),
  };
}
