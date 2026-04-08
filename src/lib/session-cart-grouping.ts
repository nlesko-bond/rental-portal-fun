import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";

export type SessionCartGroupedSection = {
  /** Display label (e.g. family member name). */
  label: string;
  /** Original indices in `sessionCartRows` for remove / keys. */
  items: { index: number; row: SessionCartSnapshot }[];
};

/**
 * Groups session cart snapshots by `bookingForLabel` in first-seen order.
 */
export function groupSessionCartSnapshotsByLabel(rows: SessionCartSnapshot[]): SessionCartGroupedSection[] {
  const order: string[] = [];
  const map = new Map<string, { index: number; row: SessionCartSnapshot }[]>();
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]!;
    const label = row.bookingForLabel?.trim() || "Booking";
    if (!map.has(label)) {
      map.set(label, []);
      order.push(label);
    }
    map.get(label)!.push({ index, row });
  }
  return order.map((label) => ({ label, items: map.get(label)! }));
}
