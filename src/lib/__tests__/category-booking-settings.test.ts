import { describe, expect, it } from "vitest";
import { parseCategoryBookingRules } from "@/lib/category-booking-settings";
import type { CategorySettings } from "@/types/online-booking";

const settings = {
  bookingDurations: {
    minDuration: { amount: 1, unit: "hour" },
    maxDuration: { amount: 3, unit: "hour" },
    durationStep: { amount: 30, unit: "minute" },
    defaultDuration: { amount: 90, unit: "minute" },
  },
  default: {
    advanceBookingWindow: { amount: 7, unit: "day" },
    minimumBookingNotice: { amount: 2, unit: "hour" },
    maxSequentialBookings: { amount: 2, unit: "hour" },
    maxBookingHours: { amount: 4, unit: "hour" },
  },
  memberships: [
    {
      membershipsIds: [10],
      advanceBookingWindow: { amount: 14, unit: "day" },
      minimumBookingNotice: { amount: 30, unit: "minute" },
    },
    {
      membershipsIds: [20],
      advanceBookingWindow: { amount: 21, unit: "day" },
      minimumBookingNotice: { amount: 1, unit: "hour" },
    },
  ],
} satisfies CategorySettings;

describe("parseCategoryBookingRules", () => {
  it("preserves duration picker settings while using default category limits", () => {
    const rules = parseCategoryBookingRules(settings, []);

    expect(rules.durationOptionsMinutes).toEqual([60, 90, 120, 150, 180]);
    expect(rules.defaultDurationMinutes).toBe(90);
    expect(rules.advanceBookingWindowDays).toBe(7);
    expect(rules.minimumBookingNoticeMinutes).toBe(120);
    expect(rules.maxSequentialHours).toBe(2);
    expect(rules.maxBookingHoursPerDay).toBe(4);
    expect(rules.memberAdvanceBookingWindowDays).toBeNull();
    expect(rules.memberMinimumBookingNoticeMinutes).toBeNull();
  });

  it("uses the online-booking package to resolve matching membership overrides", () => {
    const rules = parseCategoryBookingRules(settings, [{ membershipId: 20 }]);

    expect(rules.advanceBookingWindowDays).toBe(7);
    expect(rules.minimumBookingNoticeMinutes).toBe(120);
    expect(rules.memberAdvanceBookingWindowDays).toBe(21);
    expect(rules.memberMinimumBookingNoticeMinutes).toBe(60);
  });

  it("ignores category membership overrides that do not match the participant", () => {
    const rules = parseCategoryBookingRules(settings, [{ membershipId: 999 }]);

    expect(rules.memberAdvanceBookingWindowDays).toBe(7);
    expect(rules.memberMinimumBookingNoticeMinutes).toBe(120);
  });
});
