/**
 * Subset of hosted Swagger `components.schemas` for **cart line items** (`OrganizationCartDto.cartItems[]`).
 * Source of truth: Bond public OpenAPI — extend when the spec changes.
 */

/** `CartItemMetadataDto.description` — how Bond classifies a priced line on the cart (response). */
export type CartItemDescriptionEnum =
  | "reservation_addon"
  | "slot_addon"
  | "hour_addon"
  | "reservation_type_rental"
  | "reservation_type_lesson"
  | "per_event_addon"
  | "per_segment_addon"
  | "general_addon"
  | "goods"
  | "punch_pass"
  | "membership"
  | "membership_package_child_item"
  | "league_registration";

/** `CartItemMetadataDto` on each `cartItems[]` row (when Bond sends it). */
export type CartItemMetadataDto = {
  description?: CartItemDescriptionEnum | string;
  isAddon?: boolean;
} & Record<string, unknown>;

/** Loose cart line — Bond `CartItemDto` / nested product; not every field is in the public spec snapshot. */
export type BondCartItemDto = {
  id?: number;
  productId?: number;
  product?: Record<string, unknown>;
  isAddon?: boolean;
  metadata?: CartItemMetadataDto;
  subtotal?: number;
  price?: number;
} & Record<string, unknown>;
