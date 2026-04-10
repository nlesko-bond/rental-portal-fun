/**
 * Mirrors `docs/bond/create-booking-dto.schema.json` (Bond CreateBooking DTO) until hosted Swagger lists requestBody.
 * Create request uses `addons[]` with `productId` + `quantity` (see `buildOnlineBookingCreateBody`).
 */
export type CreateBookingAddonDto = {
  productId: number;
  quantity: number;
};

export type AddCartItemDtoMinimal = {
  productId: number;
  unitPrice?: number;
  quantity?: number;
  userId?: number;
  parentResourceType?: string;
  parentResourceId?: string;
};
