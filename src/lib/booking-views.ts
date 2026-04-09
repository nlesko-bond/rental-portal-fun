import type { OnlineBookingView } from "@/types/online-booking";

/**
 * Consumer UI never exposes Bond’s `list` schedule mode; portal still may return it in `views`.
 * We always offer calendar + matrix: the same schedule payload powers both; portals often omit `matrix`
 * from `views`, which hid the Timeline toggle.
 */
export function clientScheduleViews(_portalViews: OnlineBookingView[]): OnlineBookingView[] {
  return ["calendar", "matrix"];
}

export function viewUiLabel(v: OnlineBookingView): string {
  if (v === "matrix") return "Timeline";
  if (v === "calendar") return "List";
  return v;
}

export function parseClientViewFromUrl(raw: string | null): OnlineBookingView | undefined {
  if (raw === "calendar" || raw === "matrix") return raw;
  return undefined;
}
