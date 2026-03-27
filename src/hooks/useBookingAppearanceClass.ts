"use client";

import { useEffect, useState } from "react";
import {
  CB_BOOKING_APPEARANCE_EVENT,
  getBookingAppearanceClassFromStorage,
} from "@/lib/booking-appearance";

export function useBookingAppearanceClass(): string {
  const [cls, setCls] = useState(() =>
    typeof window !== "undefined" ? getBookingAppearanceClassFromStorage() : ""
  );
  useEffect(() => {
    setCls(getBookingAppearanceClassFromStorage());
    const on = () => setCls(getBookingAppearanceClassFromStorage());
    window.addEventListener(CB_BOOKING_APPEARANCE_EVENT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(CB_BOOKING_APPEARANCE_EVENT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return cls;
}
