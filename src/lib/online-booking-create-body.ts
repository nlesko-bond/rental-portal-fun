import { getEffectiveAddonSlotKeys } from "@/lib/addon-slot-targeting";
import { cashUnitPriceForBondFallback } from "./booking-pricing";
import {
  addonEstimatedChargeForSlot,
  resolveAddonDisplayPrice,
  type PackageAddonLine,
} from "./product-package-addons";
import { slotPriceForBondApi, type PickedSlot } from "./slot-selection";
import type { AddCartItemDtoMinimal, CreateBookingAddonDto } from "@/types/create-booking-dto";
import type { ExtendedProductDto } from "@/types/online-booking";

/**
 * `POST /v1/organization/{organizationId}/online-booking/create` (operation `cartReservation`)
 *
 * **Authoritative schema (until Swagger lists requestBody):** `docs/bond/create-booking-dto.schema.json`
 * — `CreateBookingDto` uses **`addons[]`** (`productId` + `quantity`) at root and per segment, not flat `addonProductIds`.
 *
 * Bond expects **segments** each with `spaceId`, `activity`, `facilityId`, `productId`, and a non-empty **`slots`**
 * array (nested slot rows with `resourceId`, dates/times, `price`, `timezone`).
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

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Bond may reject “illegal price” when an hour-priced add-on is sent without a prorated amount for short slots,
 * or when list/catalog unit must be explicit. Attach `unitPrice` from package metadata when we can derive it.
 */
export function enrichCreateBookingAddonsWithUnitPrice(
  dtos: CreateBookingAddonDto[],
  ctx: { slot: PickedSlot | undefined; packageAddons: PackageAddonLine[] }
): CreateBookingAddonDto[] {
  if (dtos.length === 0 || ctx.packageAddons.length === 0) return dtos;
  const { slot, packageAddons } = ctx;
  return dtos.map((dto) => {
    const line = packageAddons.find((a) => a.id === dto.productId);
    if (!line) return dto;
    let basis: number | null = null;
    if (slot != null && (line.level === "hour" || line.level === "slot")) {
      const est = addonEstimatedChargeForSlot(line, slot);
      if (est != null && Number.isFinite(est.amount) && est.amount > 0) basis = est.amount;
    } else {
      const p = resolveAddonDisplayPrice(line);
      if (p != null && Number.isFinite(p.price) && p.price > 0) basis = p.price;
    }
    if (basis == null) return dto;
    return { ...dto, unitPrice: roundMoney(basis) };
  });
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
  /** Optional add-on catalog lines — used to set `unitPrice` on `addons[]` when Bond requires explicit amounts. */
  packageAddons?: PackageAddonLine[];
  /**
   * Bond `requiredProducts[]` (`AddCartItemDto`) — include satisfied membership SKUs (`required: false` on GET …/required)
   * plus checkout selections; each line gets `userId` + `quantity: 1` so validation matches member-priced slots.
   */
  requiredProductLineItems?: Array<{ productId: number; unitPrice?: number }>;
  /** Used when schedule slot `price` is 0 (member display) — Bond create still needs a positive cash unit. */
  product?: ExtendedProductDto;
}): Record<string, unknown> {
  const activity = normalizeActivityForApi(opts.activity);
  const catalogFallback = cashUnitPriceForBondFallback(opts.product);

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
          price: slotPriceForBondApi(s, catalogFallback),
          timezone: s.timezone,
        },
      ],
    };
    const segAddons = opts.segmentAddonProductIds?.[i];
    if (segAddons != null && segAddons.length > 0) {
      const rawAddons = addonProductIdsToAddonDtos(segAddons);
      seg.addons =
        opts.packageAddons != null && opts.packageAddons.length > 0
          ? enrichCreateBookingAddonsWithUnitPrice(rawAddons, {
              slot: opts.slots[i],
              packageAddons: opts.packageAddons,
            })
          : rawAddons;
    }
    return seg;
  });

  const rootAddonIds = opts.addonProductIds ?? [];
  const rawRoot = addonProductIdsToAddonDtos(rootAddonIds);
  const rootAddonDtos =
    opts.packageAddons != null && opts.packageAddons.length > 0
      ? enrichCreateBookingAddonsWithUnitPrice(rawRoot, { slot: undefined, packageAddons: opts.packageAddons })
      : rawRoot;

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
    onlineBookingPortalId: opts.portalId,
    categoryId: opts.categoryId,
    segments,
    ...(rootAddonDtos.length > 0 ? { addons: rootAddonDtos } : {}),
    ...(requiredProducts != null && requiredProducts.length > 0 ? { requiredProducts } : {}),
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
