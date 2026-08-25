"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicOnlineBookingPortalDto } from "@/types/online-booking";
import {
  readBookingUrl,
  resolveBookingState,
  urlCanonicalMatches,
  writeBookingUrl,
  type BookingUrlState,
} from "@/components/booking/booking-url";

function locationSearch(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function replaceBookingSearch(query: string): void {
  const href = `/?${query}`;
  const nextSearch = query.length > 0 ? `?${query}` : "";
  if (window.location.search === nextSearch) return;
  window.history.replaceState(null, "", href);
}

/**
 * Resolved booking URL state from the portal + current search params, with replace-to-canonical sync.
 * Writes the query with `history.replaceState` so product / view / date changes do not trigger
 * an App Router navigation (and the full-page Suspense fallback).
 */
export function useBookingUrlState(
  portal: PublicOnlineBookingPortalDto | undefined,
  searchParams: URLSearchParams
): { state: BookingUrlState | null; pushBookingState: (next: BookingUrlState) => void } {
  const resolvedFromUrl = useMemo(() => {
    if (!portal) return null;
    return resolveBookingState(portal, readBookingUrl(searchParams));
  }, [portal, searchParams]);

  const [clientState, setClientState] = useState<BookingUrlState | null>(null);
  const state = clientState ?? resolvedFromUrl;

  const pushBookingState = useCallback((next: BookingUrlState) => {
    setClientState(next);
    replaceBookingSearch(writeBookingUrl(next, locationSearch()));
  }, []);

  useEffect(() => {
    if (!portal || !resolvedFromUrl) return;
    if (!urlCanonicalMatches(searchParams, resolvedFromUrl)) {
      replaceBookingSearch(writeBookingUrl(resolvedFromUrl, searchParams));
    }
  }, [portal, resolvedFromUrl, searchParams]);

  useEffect(() => {
    if (!portal) return;
    const onPopState = () => {
      setClientState(resolveBookingState(portal, readBookingUrl(locationSearch())));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [portal]);

  return { state, pushBookingState };
}
