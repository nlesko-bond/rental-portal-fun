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

  it("groups merged cart items by Bond participant without relying on session reservation groups", () => {
    const sections = groupSessionCartSnapshotsByLabel([
      makeSnap(
        {
          id: 13,
          cartItems: [
            {
              metadata: { description: "membership" },
              productUser: { fullName: "Russell Burgess" },
            },
            {
              metadata: { description: "reservation_type_rental" },
              productUser: { fullName: "Russell Burgess" },
            },
            {
              metadata: { description: "slot_addon" },
              productUser: { fullName: "Russell Burgess" },
            },
            {
              metadata: { description: "slot_addon" },
              productUser: { fullName: "Russell Burgess" },
            },
            {
              metadata: { description: "reservation_addon" },
              productUser: { fullName: "Russell Burgess" },
            },
            {
              metadata: { description: "reservation_type_rental" },
              participant: { firstName: "Nicole", lastName: "Lesko" },
            },
            {
              metadata: { description: "slot_addon" },
              participant: { firstName: "Nicole", lastName: "Lesko" },
            },
          ],
        },
        "Most recent participant"
      ),
    ]);

    expect(sections.map((section) => section.label)).toEqual(["Russell Burgess", "Nicole Lesko"]);
    expect(sections[0]!.items[0]!.cartFlatLineIndices).toEqual([0, 1, 2, 3, 4]);
    expect(sections[1]!.items[0]!.cartFlatLineIndices).toEqual([5, 6]);
  });

  it("attaches unlabeled membership lines to the next Bond participant booking", () => {
    const sections = groupSessionCartSnapshotsByLabel([
      makeSnap(
        {
          id: 14,
          cartItems: [
            {
              metadata: { description: "reservation_type_rental" },
              participant: { fullName: "Nicole Lesko" },
            },
            {
              metadata: { description: "slot_addon" },
            },
            {
              metadata: { description: "membership" },
            },
            {
              metadata: { description: "reservation_type_rental" },
              participant: { fullName: "Paxton Burgess" },
            },
          ],
        },
        "Paxton Burgess"
      ),
    ]);

    expect(sections.map((section) => section.label)).toEqual(["Nicole Lesko", "Paxton Burgess"]);
    expect(sections[0]!.items[0]!.cartFlatLineIndices).toEqual([0, 1]);
    expect(sections[1]!.items[0]!.cartFlatLineIndices).toEqual([2, 3]);
  });
});
