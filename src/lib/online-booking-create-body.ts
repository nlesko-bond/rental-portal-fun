import type { PickedSlot } from "./slot-selection";
import type { PackageAddonLine } from "./product-package-addons";

/**
 * `POST /v1/organization/{organizationId}/online-booking/create` (operation `cartReservation`)
 *
 * **Request body:** The hosted OpenAPI JSON often lists only **path + auth headers** for this operation and omits
 * `requestBody`. The JSON body is still required at runtime — it matches Bond’s create-booking DTO (segments, portal
 * id, category, userId, optional `addonProductIds`, optional `answers`, etc.). This module is the integration contract
 * until the spec publishes `requestBody` explicitly.
 *
 * **Optional `cartId`:** Not in the public create snippet today; add when Bond documents append-to-cart behavior.
 *
 * Bond expects **segments** each with `spaceId`, `activity`, `facilityId`, `productId`, and a non-empty **`slots`**
 * array (nested slot rows with `resourceId`, dates/times, `price`, `timezone`).
 */

/**
 * Bond often accepts only **reservation-scoped** add-on product IDs at the top level.
 * Slot/hour add-ons may need segment-level payloads not yet modeled here — omitting them
 * avoids `ONLINE_BOOKING.INVALID_PRODUCT` when those IDs are not valid as flat `addonProductIds`.
 * IDs not found in `packageAddons` (e.g. required-product rows) are kept.
 */
export function filterAddonProductIdsForCreate(
  ids: number[],
  packageAddons: PackageAddonLine[]
): number[] {
  const byId = new Map(packageAddons.map((a) => [a.id, a]));
  const out: number[] = [];
  for (const id of ids) {
    const line = byId.get(id);
    if (!line) {
      out.push(id);
      continue;
    }
    if (line.level === "reservation") out.push(id);
  }
  return [...new Set(out)];
}
/** Per Swagger `CreateBookingDto` / online-booking create: `answers[]` with `userId` + nested `answers` (questionId + value). */
export type OnlineBookingCreateAnswerRow = {
  userId: number;
  answers: Array<{ questionId: number; value: string }>;
};

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
  /** Questionnaire answers for entitlement / promo flows (not `questionnaireAnswers`). */
  answers?: OnlineBookingCreateAnswerRow[];
  /** When Bond supports merging into an existing server cart (see Swagger when available). */
  cartId?: number;
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
    ...(opts.answers && opts.answers.length > 0 ? { answers: opts.answers } : {}),
    ...(opts.cartId != null && Number.isFinite(opts.cartId) ? { cartId: opts.cartId } : {}),
  };
}

/** Bond activity enum is often lowercase slug matching portal `activities` values */
function normalizeActivityForApi(raw: string): string {
  const t = raw.trim();
  if (!t) return "general";
  return t.toLowerCase().replace(/\s+/g, "_");
}
