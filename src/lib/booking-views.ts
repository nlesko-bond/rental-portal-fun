import type { OnlineBookingView } from "@/types/online-booking";

/** Bond `list` maps to our slot list UI (still typed `calendar` in the API); UI copy says **List**, not “calendar”. */
export function mapPortalViewToClientView(v: OnlineBookingView): "calendar" | "matrix" {
  if (v === "matrix") return "matrix";
  return "calendar";
}

/** Opt-in matrix/timeline UI. Off by default so production stays list-only until UX is ready. */
export function bookingTimelineFeatureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BOOKING_TIMELINE_ENABLED === "true";
}

/**
 * Normalized schedule modes for the consumer (`calendar` = list UI, `matrix` = timeline grid).
 * Preserves API order but maps `list` → `calendar` and dedupes. Timeline is omitted unless
 * {@link bookingTimelineFeatureEnabled} is true.
 */
export function clientScheduleViews(portalViews: OnlineBookingView[]): OnlineBookingView[] {
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
  if (!bookingTimelineFeatureEnabled()) {
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
