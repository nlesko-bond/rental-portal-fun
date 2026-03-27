/** Shared with `BookingExperience` appearance toggle (localStorage + custom event). */

export const CB_BOOKING_APPEARANCE_KEY = "cb-booking-appearance";

export const CB_BOOKING_APPEARANCE_EVENT = "cb-booking-appearance-change";

export function getBookingAppearanceClassFromStorage(): string {
  if (typeof window === "undefined") return "";
  try {
    const v = localStorage.getItem(CB_BOOKING_APPEARANCE_KEY);
    if (v === "light") return "consumer-booking--light";
    if (v === "dark") return "consumer-booking--dark";
  } catch {
    /* ignore */
  }
  return "";
}
