import { getEffectiveAddonSlotKeys } from "@/lib/addon-slot-targeting";
import type { PackageAddonLine } from "./product-package-addons";
import type { PickedSlot } from "./slot-selection";
import type { AddCartItemDtoMinimal, CreateBookingAddonDto } from "@/types/create-booking-dto";
import type { ExtendedProductDto } from "@/types/online-booking";

/**
 * `POST /v1/organization/{organizationId}/online-booking/create` (`cartReservation`)
 *
 * Wire JSON matches hosted OpenAPI
 * https://public.api.squad-c.bondsports.co/public-api/bond-public-api.json :
 * - `CreateBookingDto`: `userId`, `segments`, optional `addons`, `cartId`, `answers`, `requiredProducts`, `name`
 *   — **not** `onlineBookingPortalId` / `categoryId` (those are not in the schema).
 * - `CreateBookingTimeSlotDto`: **only** `startDate`, `startTime`, `endDate`, `endTime` (no `resourceId`, `price`, `timezone`).
 * - `CreateBookingSegmentDto`: instructor categories need **`instructorId`** (selected schedule resource id); space-based rows use **`spaceId`** (and optional `spacesIds[0]` on the slot when the instructor also books a space).
 * - `CreateBookingAddonDto`: **only** `productId`, `quantity` (no `unitPrice`; `AddCartItemDto` for `requiredProducts` may still include `unitPrice`).
 *
 * Extra fields can cause Bond to throw **500** with an empty `message` if their DTO layer rejects the payload.
 */

export type AddonSlotTargetingInput = Record<number, { all: boolean; keys: string[] }>;

/**
 * Splits add-on product ids for `POST …/online-booking/create` → passed to {@link buildOnlineBookingCreateBody}
 * as **`addons[]`** (root + per-segment quantities).
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
  /** Includes satisfied membership SKUs (`required: false` on GET …/required), not only checkout `requiredSelected`. */
  const reqSet = new Set(opts.requiredSelected);
  /** Required SKUs belong only in `requiredProducts` on `CreateBookingDto`, not duplicated in root `addons`. */

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
    const eff = getEffectiveAddonSlotKeys(opts.addonSlotTargeting[id], slotKeySet);
    opts.pickedSlots.forEach((slot, idx) => {
      if (eff.has(slot.key)) perSegment[idx]!.push(id);
    });
  }

  return {
    topLevel: [...new Set(topLevel)],
    perSegment,
  };
}

/** Collapses duplicate product ids into `{ productId, quantity }[]` for `CreateBookingDto.addons`. */
export function addonProductIdsToAddonDtos(ids: readonly number[]): CreateBookingAddonDto[] {
  const m = new Map<number, number>();
  for (const id of ids) {
    m.set(id, (m.get(id) ?? 0) + 1);
  }
  return [...m.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

/** OpenAPI `CreateBookingAddonDto`: only these two properties. */
function wireAddonsForCreate(dtos: CreateBookingAddonDto[]): Array<{ productId: number; quantity: number }> {
  return dtos.map(({ productId, quantity }) => ({ productId, quantity }));
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
  /** Reservation-level add-on product ids → top-level `addons[]` with quantities. */
  addonProductIds?: number[];
  /** Same length as `slots` — slot/hour add-on ids per segment → `segments[i].addons[]`. */
  segmentAddonProductIds?: number[][];
  /** Questionnaire answers for entitlement / promo flows (not `questionnaireAnswers`). */
  answers?: OnlineBookingCreateAnswerRow[];
  /** Merge this reservation into an existing Bond cart (append line items). */
  cartId?: number;
  /** Catalog lines for add-on resolution in {@link splitAddonPayloadForCreate} only; not sent on `addons[]`. */
  packageAddons?: PackageAddonLine[];
  /**
   * Bond `requiredProducts[]` (`AddCartItemDto`) — include satisfied membership SKUs (`required: false` on GET …/required)
   * plus checkout selections; each line gets `userId` + `quantity: 1` so validation matches member-priced slots.
   */
  requiredProductLineItems?: Array<{ productId: number; unitPrice?: number }>;
  /** Retained for call-site compatibility; pricing is not sent on slot rows per OpenAPI. */
  product?: ExtendedProductDto;
}): Record<string, unknown> {
  void opts.portalId;
  void opts.categoryId;
  void opts.packageAddons;
  void opts.product;

  const activity = normalizeActivityForApi(opts.activity);

  const segments = opts.slots.map((s, i) => {
    const seg: Record<string, unknown> = {
      activity,
      facilityId: opts.facilityId,
      productId: opts.productId,
      slots: [
        {
          startDate: s.startDate,
          endDate: s.endDate,
          startTime: bondSlotTimeWithSeconds(s.startTime),
          endTime: bondSlotTimeWithSeconds(s.endTime),
        },
      ],
    };
    if (s.usesInstructorSegment === true) {
      seg.instructorId = s.resourceId;
      const sid = s.spaceId;
      if (sid != null && Number.isFinite(sid) && sid > 0) {
        seg.spaceId = sid;
      }
    } else {
      seg.spaceId = s.spaceId ?? s.resourceId;
    }
    const segAddons = opts.segmentAddonProductIds?.[i];
    if (segAddons != null && segAddons.length > 0) {
      seg.addons = wireAddonsForCreate(addonProductIdsToAddonDtos(segAddons));
    }
    return seg;
  });

  const rootAddonIds = opts.addonProductIds ?? [];
  const rootAddonDtos = wireAddonsForCreate(addonProductIdsToAddonDtos(rootAddonIds));

  const requiredProducts: AddCartItemDtoMinimal[] | undefined =
    opts.requiredProductLineItems && opts.requiredProductLineItems.length > 0
      ? [...new Map(opts.requiredProductLineItems.map((l) => [l.productId, l])).values()].map((line) => ({
          productId: line.productId,
          userId: opts.userId,
          quantity: 1,
          ...(line.unitPrice !== undefined && Number.isFinite(line.unitPrice) ? { unitPrice: line.unitPrice } : {}),
        }))
      : undefined;

  return {
    userId: opts.userId,
    segments,
    ...(rootAddonDtos.length > 0 ? { addons: rootAddonDtos } : {}),
    ...(requiredProducts != null && requiredProducts.length > 0 ? { requiredProducts } : {}),
    ...(opts.answers && opts.answers.length > 0 ? { answers: opts.answers } : {}),
    ...(opts.cartId != null && Number.isFinite(opts.cartId) ? { cartId: opts.cartId } : {}),
  };
}

/**
 * Portal sport key for `segments[].activity` — must stay aligned with `sports` query on products/schedule
 * (lowercase slug, spaces → underscores). See `SportNameEnum` in hosted OpenAPI.
 */
function normalizeActivityForApi(raw: string): string {
  const t = raw.trim();
  if (!t) return "general";
  return t.toLowerCase().replace(/\s+/g, "_");
}

/** Hosted API uses `HH:mm:ss` on slot rows. */
function bondSlotTimeWithSeconds(time: string): string {
  const t = time.trim();
  const m = t.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return t;
  const sec = m[3] ?? "00";
  return `${m[1]}:${m[2]}:${sec}`;
}
