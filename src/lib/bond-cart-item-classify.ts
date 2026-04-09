/**
 * Classify `OrganizationCartDto.cartItems[]` rows using Bond `metadata.description`
 * (`CartItemDescriptionEnum`) when present, else `isAddon` / product heuristics.
 * Create-body add-on placement uses catalog `packages[].level` — see `docs/bond/CART_ITEM_AND_CREATE_BOOKING.md`.
 */

export type CartLineKind = "booking" | "addon" | "membership";

export function getCartItemMetadataDescription(it: Record<string, unknown>): string | undefined {
  const meta = it.metadata && typeof it.metadata === "object" ? (it.metadata as Record<string, unknown>) : null;
  return meta && typeof meta.description === "string" && meta.description.length > 0
    ? meta.description
    : undefined;
}

export function classifyCartItemLineKind(it: Record<string, unknown>): CartLineKind {
  const desc = getCartItemMetadataDescription(it);

  if (desc) {
    if (desc === "membership" || desc === "membership_package_child_item") return "membership";
    if (
      desc === "reservation_addon" ||
      desc === "slot_addon" ||
      desc === "hour_addon" ||
      desc === "per_event_addon" ||
      desc === "per_segment_addon" ||
      desc === "general_addon" ||
      desc === "goods" ||
      desc === "punch_pass"
    )
      return "addon";
    if (
      desc === "reservation_type_rental" ||
      desc === "reservation_type_lesson" ||
      desc === "league_registration"
    )
      return "booking";
  }

  const meta = it.metadata && typeof it.metadata === "object" ? (it.metadata as Record<string, unknown>) : null;
  const isAddon = meta?.isAddon === true || it.isAddon === true;
  const product = it.product as Record<string, unknown> | undefined;
  const pt = product?.productType;
  if (typeof pt === "string" && /membership|pass|plan/i.test(pt)) return "membership";
  if (isAddon) return "addon";
  return "booking";
}

/** UI badge for receipt line — optional for core booking lines. */
export function receiptBadgeForCartLine(kind: CartLineKind, description?: string): string | undefined {
  if (kind === "membership") return "Membership";
  if (kind === "booking") return undefined;
  if (kind === "addon") {
    switch (description) {
      case "reservation_addon":
        return "Reservation add-on";
      case "slot_addon":
        return "Slot add-on";
      case "hour_addon":
        return "Hour add-on";
      case "per_segment_addon":
        return "Segment add-on";
      case "per_event_addon":
        return "Event add-on";
      default:
        return "Add-on";
    }
  }
  return undefined;
}
