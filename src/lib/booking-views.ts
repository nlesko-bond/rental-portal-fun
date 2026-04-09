import type { OnlineBookingView } from "@/types/online-booking";

/** Bond `list` maps to our slot list UI (`calendar`); we never surface raw `list` in the client. */
export function mapPortalViewToClientView(v: OnlineBookingView): "calendar" | "matrix" {
  if (v === "matrix") return "matrix";
  return "calendar";
}

/**
 * Normalized schedule modes for the consumer (calendar = list, matrix = timeline).
 * Preserves API order but maps `list` → `calendar` and dedupes.
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
  return out.length > 0 ? out : ["calendar"];
}

export function viewUiLabel(v: OnlineBookingView): string {
  if (v === "matrix") return "Timeline view";
  if (v === "calendar") return "Calendar view";
  return v;
}

export function parseClientViewFromUrl(raw: string | null): OnlineBookingView | undefined {
  if (raw === "calendar" || raw === "list") return "calendar";
  if (raw === "matrix") return "matrix";
  return undefined;
}
