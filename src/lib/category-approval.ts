import type { ReservationProductCategoryDto } from "@/types/online-booking";

/**
 * Portal category `settings.approvalRequired` — when true, bookings are requests pending approval
 * (“Submit request”); when false, normal booking / pay-now flow (“Book now”).
 */
export function categoryRequiresApproval(category: ReservationProductCategoryDto | undefined): boolean {
  const s = category?.settings;
  if (!s || typeof s !== "object") return false;
  return (s as { approvalRequired?: unknown }).approvalRequired === true;
}
