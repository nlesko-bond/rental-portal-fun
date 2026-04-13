/**
 * Mirrors `docs/bond/create-booking-dto.schema.json` (Bond CreateBooking DTO) until hosted Swagger lists requestBody.
 * Create request uses `addons[]` with `productId` + `quantity` (see `buildOnlineBookingCreateBody`).
 */
export type CreateBookingAddonDto = {
  productId: number;
  quantity: number;
  /** When Bond validates line amounts (e.g. hour add-ons prorated to slot duration), send catalog-derived unit price. */
  unitPrice?: number;
};

export type AddCartItemDtoMinimal = {
  productId: number;
  unitPrice?: number;
  quantity?: number;
  userId?: number;
  parentResourceType?: string;
  parentResourceId?: string;
};
