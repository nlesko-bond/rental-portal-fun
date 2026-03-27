import type { PickedSlot } from "./slot-selection";

/**
 * `POST .../online-booking/create` — Bond expects **segments** each with
 * `spaceId`, `activity`, `facilityId`, `productId`, and a non-empty **`slots`** array
 * (nested slot rows with `resourceId`, dates/times, `price`, `timezone`).
 */
export function buildOnlineBookingCreateBody(opts: {
  userId: number;
  portalId: number;
  categoryId: number;
  /** Portal activity string (must match Bond enum, e.g. sport key from URL) */
  activity: string;
  facilityId: number;
  productId: number;
  slots: PickedSlot[];
  addonProductIds?: number[];
  questionnaireAnswers?: Array<Record<string, unknown>>;
}): Record<string, unknown> {
  const activity = normalizeActivityForApi(opts.activity);

  const segments = opts.slots.map((s) => ({
    spaceId: s.spaceId,
    activity,
    facilityId: opts.facilityId,
    productId: opts.productId,
    slots: [
      {
        resourceId: s.resourceId,
        startDate: s.startDate,
        endDate: s.endDate,
        startTime: s.startTime,
        endTime: s.endTime,
        price: s.price,
        timezone: s.timezone,
      },
    ],
  }));

  return {
    userId: opts.userId,
    onlineBookingPortalId: opts.portalId,
    categoryId: opts.categoryId,
    segments,
    ...(opts.addonProductIds && opts.addonProductIds.length > 0 ? { addonProductIds: opts.addonProductIds } : {}),
    ...(opts.questionnaireAnswers && opts.questionnaireAnswers.length > 0
      ? { questionnaireAnswers: opts.questionnaireAnswers }
      : {}),
  };
}

/** Bond activity enum is often lowercase slug matching portal `activities` values */
function normalizeActivityForApi(raw: string): string {
  const t = raw.trim();
  if (!t) return "general";
  return t.toLowerCase().replace(/\s+/g, "_");
}
