"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { PublicOnlineBookingPortalDto } from "@/types/online-booking";
import {
  readBookingUrl,
  resolveBookingState,
  urlCanonicalMatches,
  writeBookingUrl,
  type BookingUrlState,
} from "@/components/booking/booking-url";

type BookingRouter = { replace: (href: string, options?: { scroll?: boolean }) => void };

/**
 * Resolved booking URL state from the portal + current search params, with replace-to-canonical sync.
 */
export function useBookingUrlState(
  portal: PublicOnlineBookingPortalDto | undefined,
  searchParams: URLSearchParams,
  router: BookingRouter
): { state: BookingUrlState | null; pushBookingState: (next: BookingUrlState) => void } {
  const state = useMemo(() => {
    if (!portal) return null;
    return resolveBookingState(portal, readBookingUrl(searchParams));
  }, [portal, searchParams]);

  const pushBookingState = useCallback(
    (next: BookingUrlState) => {
      router.replace(`/?${writeBookingUrl(next, searchParams)}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (!portal || !state) return;
    if (!urlCanonicalMatches(searchParams, state)) {
      pushBookingState(state);
    }
  }, [portal, state, searchParams, pushBookingState]);

  return { state, pushBookingState };
}
