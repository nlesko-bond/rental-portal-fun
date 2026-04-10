import type { OnlineBookingView } from "@/types/online-booking";

/** Bond `list` maps to our slot list UI (still typed `calendar` in the API); UI copy says **List**, not “calendar”. */
export function mapPortalViewToClientView(v: OnlineBookingView): "calendar" | "matrix" {
  if (v === "matrix") return "matrix";
  return "calendar";
}

/**
 * Matrix/timeline UI: enabled in `next dev` (NODE_ENV=development) so local testing needs no env;
 * production requires `NEXT_PUBLIC_BOOKING_TIMELINE_ENABLED=true`.
 *
 * **URL override (demo):** `?bookingUi=experiment` or `?bookingUi=timeline` forces Timeline on;
 * `?bookingUi=original` or `?bookingUi=classic` hides Timeline (List-only) regardless of env.
 */
export function bookingTimelineFeatureEnabled(searchParams?: URLSearchParams | null): boolean {
  const raw = searchParams?.get("bookingUi")?.trim().toLowerCase();
  if (raw === "original" || raw === "classic") return false;
  if (raw === "experiment" || raw === "timeline") return true;
  if (process.env.NEXT_PUBLIC_BOOKING_TIMELINE_ENABLED === "true") return true;
  return process.env.NODE_ENV === "development";
}

/**
 * Normalized schedule modes for the consumer (`calendar` = list UI, `matrix` = timeline grid).
 * Preserves API order but maps `list` → `calendar` and dedupes. Timeline is omitted unless
 * {@link bookingTimelineFeatureEnabled} is true.
 */
export function clientScheduleViews(
  portalViews: OnlineBookingView[],
  searchParams?: URLSearchParams | null
): OnlineBookingView[] {
  const out: OnlineBookingView[] = [];
  const seen = new Set<OnlineBookingView>();
  for (const v of portalViews) {
    const c = mapPortalViewToClientView(v);
    if (c === "calendar" || c === "matrix") {
      if (!seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
  }
  let result: OnlineBookingView[] = out.length > 0 ? out : ["calendar"];
  if (!bookingTimelineFeatureEnabled(searchParams)) {
    result = result.filter((v) => v !== "matrix");
  }
  return result.length > 0 ? result : ["calendar"];
}

export function viewUiLabel(v: OnlineBookingView): string {
  if (v === "matrix") return "Timeline";
  if (v === "calendar") return "List";
  return v;
}

export function parseClientViewFromUrl(raw: string | null): OnlineBookingView | undefined {
  if (raw === "calendar" || raw === "list") return "calendar";
  if (raw === "matrix") return "matrix";
  return undefined;
}
