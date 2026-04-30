import { describe, expect, it } from "vitest";
import { groupSessionCartSnapshotsByLabel } from "@/lib/session-cart-grouping";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import type { OrganizationCartDto } from "@/types/online-booking";

function makeSnap(cart: Record<string, unknown>, bookingForLabel = "Session fallback"): SessionCartSnapshot {
  return {
    cart: cart as unknown as OrganizationCartDto,
    productName: "Court rental",
    bookingForLabel,
  };
}

describe("groupSessionCartSnapshotsByLabel", () => {
  it("prefers Bond productUser data over the session booking label", () => {
    const sections = groupSessionCartSnapshotsByLabel([
      makeSnap({
        id: 11,
        cartItems: [
          {
            metadata: { description: "reservation_type_rental" },
            productUser: { firstName: "Paxton", lastName: "Lee" },
          },
        ],
      }),
    ]);

    expect(sections).toHaveLength(1);
    expect(sections[0]!.label).toBe("Paxton Lee");
  });

  it("splits merged cart sections by each Bond participant", () => {
    const sections = groupSessionCartSnapshotsByLabel([
      {
        ...makeSnap({
          id: 12,
          cartItems: [
            {
              metadata: { description: "reservation_type_rental", slotControlKey: "1-2026-12-25-08:00:00-09:00:00" },
              participant: { fullName: "Paxton Lee" },
            },
            {
              metadata: { description: "reservation_type_rental", slotControlKey: "2-2026-12-25-09:00:00-10:00:00" },
              productUser: { displayName: "Namie Namerson" },
            },
          ],
        }),
        reservationGroups: [
          {
            bookingForLabel: "Fallback one",
            slotKeys: ["1-2026-12-25-08:00:00-09:00:00"],
          },
          {
            bookingForLabel: "Fallback two",
            slotKeys: ["2-2026-12-25-09:00:00-10:00:00"],
          },
        ],
      },
    ]);

    expect(sections.map((section) => section.label)).toEqual(["Paxton Lee", "Namie Namerson"]);
  });
});
