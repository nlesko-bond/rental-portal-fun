import { describe, expect, it } from "vitest";
import { getTimesForScheduleDate, startTimesFromSchedule } from "@/lib/schedule-settings";
import type { BookingScheduleDto, PublicResourceDto, ScheduleTimeSlotDto } from "@/types/online-booking";

const resource: PublicResourceDto = {
  id: 1,
  name: "Court",
  type: "space",
  sports: ["tennis"],
  status: "active",
};

function slot(startTime: string, startDate = "2026-08-25"): ScheduleTimeSlotDto {
  return {
    startDate,
    startTime,
    endDate: startDate,
    endTime: "12:00:00",
    price: 10,
    timezone: "America/New_York",
    isAvailable: true,
  };
}

describe("getTimesForScheduleDate", () => {
  it("returns HH:mm:ss starts for the matching day", () => {
    expect(
      getTimesForScheduleDate(
        [
          { date: "2026-08-25", times: ["16:00:00", "16:30:00"] },
          { date: "2026-08-26", times: ["09:00:00"] },
        ],
        "2026-08-25"
      )
    ).toEqual(["16:00:00", "16:30:00"]);
  });
});

describe("startTimesFromSchedule", () => {
  it("collects unique sorted starts for the requested civil date", () => {
    const schedule: BookingScheduleDto = {
      dates: [],
      resources: [
        {
          resource,
          timeSlots: [slot("16:30:00"), slot("16:00:00"), slot("09:00:00", "2026-08-26")],
        },
        {
          resource: { ...resource, id: 2, name: "Court 2" },
          timeSlots: [slot("16:00:00")],
        },
      ],
    };
    expect(startTimesFromSchedule(schedule, "2026-08-25")).toEqual(["16:00:00", "16:30:00"]);
  });
});
