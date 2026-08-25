import { describe, expect, it } from "vitest";
import { bondCalendarDateKey, formatBondSlotDayLabel } from "@/lib/bond-calendar-date";

describe("bondCalendarDateKey", () => {
  it("keeps Bond schedule YYYY-MM-DD", () => {
    expect(bondCalendarDateKey("2026-08-24")).toBe("2026-08-24");
  });

  it("strips ISO datetime prefixes from OpenAPI Date fields", () => {
    expect(bondCalendarDateKey("2026-08-24T00:00:00.000Z")).toBe("2026-08-24");
    expect(bondCalendarDateKey("2026-08-24T08:00:00")).toBe("2026-08-24");
  });

  it("returns null for missing or invalid values", () => {
    expect(bondCalendarDateKey(null)).toBeNull();
    expect(bondCalendarDateKey("")).toBeNull();
    expect(bondCalendarDateKey("Aug 24")).toBeNull();
  });
});

describe("formatBondSlotDayLabel", () => {
  it("formats a civil date without shifting the day", () => {
    expect(formatBondSlotDayLabel("2026-08-24")).toMatch(/Aug/);
    expect(formatBondSlotDayLabel("2026-08-24")).toMatch(/24/);
  });
});
