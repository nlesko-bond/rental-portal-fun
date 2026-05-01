import { describe, expect, it } from "vitest";
import { buildOnlineBookingCreateBody } from "@/lib/online-booking-create-body";
import type { PickedSlot } from "@/lib/slot-selection";

const slot: PickedSlot = {
  key: "27643-2026-05-02-12:30:00-13:00:00",
  resourceId: 27643,
  resourceName: "Court",
  startDate: "2026-05-02",
  endDate: "2026-05-02",
  startTime: "12:30:00",
  endTime: "13:00:00",
  price: 0,
  timezone: "America/New_York",
};

describe("buildOnlineBookingCreateBody", () => {
  it("keeps required products when merging into an existing cart", () => {
    expect(
      buildOnlineBookingCreateBody({
        userId: 214932,
        portalId: 268,
        categoryId: 7993,
        activity: "tennis",
        facilityId: 860,
        productId: 702816,
        slots: [slot],
        cartId: 299580,
        requiredProductLineItems: [
          { productId: 413332, unitPrice: 34.99 },
          { productId: 413333, unitPrice: 25 },
        ],
      })
    ).toMatchObject({
      userId: 214932,
      cartId: 299580,
      requiredProducts: [
        { productId: 413332, userId: 214932, quantity: 1, unitPrice: 34.99 },
        { productId: 413333, userId: 214932, quantity: 1, unitPrice: 25 },
      ],
    });
  });
});
