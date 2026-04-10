import type { OnlineBookingView } from "@/types/online-booking";

/** Bond `list` maps to our slot list UI (still typed `calendar` in the API); UI copy says **List**, not “calendar”. */
export function mapPortalViewToClientView(v: OnlineBookingView): "calendar" | "matrix" {
  if (v === "matrix") return "matrix";
  return "calendar";
}

/**
 * Normalized schedule modes for the consumer (`calendar` = list UI, `matrix` = timeline grid).
 * Mirrors `portal.options.views` from Bond: maps `list` → `calendar`, dedupes, preserves API order.
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
  const fallback: OnlineBookingView[] = ["calendar"];
  return out.length > 0 ? out : fallback;
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
