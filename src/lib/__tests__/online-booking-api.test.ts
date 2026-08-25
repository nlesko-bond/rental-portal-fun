import { describe, expect, it } from "vitest";
import { bondScheduleSettingsQuery, bondScheduleSlotsQuery } from "@/lib/online-booking-api";

const fullQuery = {
  facilityId: 860,
  productId: 659887,
  date: "2026-08-25",
  duration: 60,
  timeIncrements: [30, 15, 45],
  userId: 42,
  resourcesIds: [1],
};

describe("bondScheduleSettingsQuery", () => {
  it("keeps product, facility, and user and drops the slot-grid params", () => {
    expect(bondScheduleSettingsQuery(fullQuery)).toEqual({
      facilityId: 860,
      productId: 659887,
      userId: 42,
    });
  });
});

describe("bondScheduleSlotsQuery", () => {
  it("keeps date and duration and omits timeIncrements", () => {
    expect(bondScheduleSlotsQuery(fullQuery)).toEqual({
      facilityId: 860,
      productId: 659887,
      date: "2026-08-25",
      duration: 60,
      userId: 42,
      resourcesIds: [1],
    });
  });
});
