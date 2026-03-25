/** Portal activity slug → sentence case label for UI (breadcrumb, cards). */
export function formatActivityLabel(activity: string): string {
  const key = activity.trim().toLowerCase();
  if (key === "football") return "American Football";
  return activity.replace(/_/g, " ");
}
