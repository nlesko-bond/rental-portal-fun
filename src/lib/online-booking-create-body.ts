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
 * Slot/hour add-ons are sent as **`addonProductIds` on each segment** that the add-on applies to
 * (see `splitAddonPayloadForCreate` + `segmentAddonProductIds` in `buildOnlineBookingCreateBody`).
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

export type AddonSlotTargetingInput = Record<number, { all: boolean; keys: string[] }>;

function effectiveAddonKeys(
  spec: { all: boolean; keys: string[] } | undefined,
  allKeys: Set<string>
): Set<string> {
  // UI sets `{ all: true }` in an effect after toggle; one render can omit targeting — default to all picked slots.
  if (!spec) return new Set(allKeys);
  if (spec.all) return new Set(allKeys);
  return new Set(spec.keys.filter((k) => allKeys.has(k)));
}

/**
 * Splits add-on product ids for `POST …/online-booking/create`:
 * - **Top-level** `addonProductIds`: required products + reservation-level optional add-ons + unknown ids.
 * - **Per-segment** `addonProductIds`: slot/hour add-ons, copied onto each segment whose slot key is targeted.
 */
export function splitAddonPayloadForCreate(opts: {
  pickedSlots: PickedSlot[];
  selectedAddonIds: number[];
  requiredSelected: number[];
  packageAddons: PackageAddonLine[];
  addonSlotTargeting: AddonSlotTargetingInput;
}): { topLevel: number[]; perSegment: number[][] } {
  const slotKeySet = new Set(opts.pickedSlots.map((s) => s.key));
  const perSegment: number[][] = opts.pickedSlots.map(() => []);
  const topLevel: number[] = [];
  const byId = new Map(opts.packageAddons.map((a) => [a.id, a]));
  const reqSet = new Set(opts.requiredSelected);

  for (const id of opts.requiredSelected) {
    topLevel.push(id);
  }

  for (const id of opts.selectedAddonIds) {
    if (reqSet.has(id)) continue;
    const line = byId.get(id);
    if (!line) {
      topLevel.push(id);
      continue;
    }
    if (line.level === "reservation") {
      topLevel.push(id);
      continue;
    }
    const eff = effectiveAddonKeys(opts.addonSlotTargeting[id], slotKeySet);
    opts.pickedSlots.forEach((slot, idx) => {
      if (eff.has(slot.key)) perSegment[idx]!.push(id);
    });
  }

  return {
    topLevel: [...new Set(topLevel)],
    perSegment,
  };
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
  /** Reservation + required + unknown ids (not placed on segments). */
  addonProductIds?: number[];
  /** Same length as `slots` — slot/hour add-on ids per segment (Bond segment `addonProductIds`). */
  segmentAddonProductIds?: number[][];
  /** Questionnaire answers for entitlement / promo flows (not `questionnaireAnswers`). */
  answers?: OnlineBookingCreateAnswerRow[];
  /** When Bond supports merging into an existing server cart (see Swagger when available). */
  cartId?: number;
}): Record<string, unknown> {
  const activity = normalizeActivityForApi(opts.activity);

  const segments = opts.slots.map((s, i) => {
    const seg: Record<string, unknown> = {
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
    };
    const segAddons = opts.segmentAddonProductIds?.[i];
    if (segAddons != null && segAddons.length > 0) {
      seg.addonProductIds = [...new Set(segAddons)];
    }
    return seg;
  });

  return {
    userId: opts.userId,
    onlineBookingPortalId: opts.portalId,
    categoryId: opts.categoryId,
    segments,
    ...(opts.addonProductIds && opts.addonProductIds.length > 0 ? { addonProductIds: [...new Set(opts.addonProductIds)] } : {}),
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
