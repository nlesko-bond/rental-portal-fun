import type { CategorySettings } from "@/types/online-booking";

const DEFAULT_DURATIONS = [60];

/** Legacy `bookingDurations` array only (when min/max/increment are absent). */
export function bookingDurationsLegacyArray(settings: CategorySettings | undefined): number[] {
  const raw = settings?.bookingDurations;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_DURATIONS;
  const nums = raw.filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);
  return nums.length > 0 ? nums : DEFAULT_DURATIONS;
}

/** @deprecated Prefer `parseCategoryBookingRules` for min/max/increment + legacy fallback. */
export function bookingDurationsFromCategory(settings: CategorySettings | undefined): number[] {
  return bookingDurationsLegacyArray(settings);
}
