import type { OnlineBookingView } from "@/types/online-booking";

/** Consumer UI never exposes Bond’s `list` schedule mode; portal still may return it in `views`. */
export function clientScheduleViews(portalViews: OnlineBookingView[]): OnlineBookingView[] {
  const v = portalViews.filter((x) => x === "calendar" || x === "matrix");
  return v.length > 0 ? v : ["calendar"];
}

export function viewUiLabel(v: OnlineBookingView): string {
  if (v === "matrix") return "Timeline view";
  if (v === "calendar") return "Calendar view";
  return v;
}

export function parseClientViewFromUrl(raw: string | null): OnlineBookingView | undefined {
  if (raw === "calendar" || raw === "matrix") return raw;
  return undefined;
}
