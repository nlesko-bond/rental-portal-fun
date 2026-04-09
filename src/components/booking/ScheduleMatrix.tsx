"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BookingScheduleDto, ExtendedProductDto, ScheduleTimeSlotDto } from "@/types/online-booking";
import {
  formatSlotPriceDisplay,
  slotDisplayTotalPrice,
  slotPriceTierRelativeToPeers,
  type SlotPriceTier,
} from "@/lib/booking-pricing";
import { slotControlKey } from "@/lib/slot-selection";
import { IconPeakTrend } from "./booking-icons";

function formatTime12hFromKey(timeKey: string): string {
  const hhmm = timeKey.slice(11, 16);
  const m = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!m) return hhmm;
  let h = Number(m[1]);
  const min = m[2]!;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min}${ap}`;
}

function slotTitle(slot: { startTime: string; endTime: string }): string {
  return `${slot.startTime.slice(0, 5)}–${slot.endTime.slice(0, 5)}`;
}

function peerUnitsForColumn(
  schedule: BookingScheduleDto,
  timeKey: string,
  adjust?: (unit: number) => number
): number[] {
  const units: number[] = [];
  for (const row of schedule.resources) {
    const slot = row.timeSlots.find((s) => `${s.startDate} ${s.startTime}` === timeKey);
    if (slot?.isAvailable) {
      const u = adjust ? adjust(slot.price) : slot.price;
      units.push(u);
    }
  }
  return units;
}

function matrixTierClassName(t: SlotPriceTier): string {
  if (t === "peak") return "cb-matrix-slot--peak";
  if (t === "off_peak") return "cb-matrix-slot--offpeak";
  return "cb-matrix-slot--standard";
}

type Props = {
  schedule: BookingScheduleDto;
  product: ExtendedProductDto | undefined;
  durationMinutes: number;
  priceCurrency: string | null;
  membershipGated: boolean;
  selectedKeys: ReadonlySet<string>;
  onToggleSlot: (resourceId: number, resourceName: string, slot: ScheduleTimeSlotDto) => void;
  adjustSlotUnitPrice?: (unitPrice: number) => number;
};

export function ScheduleMatrix({
  schedule,
  product,
  durationMinutes,
  priceCurrency,
  membershipGated,
  selectedKeys,
  onToggleSlot,
  adjustSlotUnitPrice,
}: Props) {
  const anchorColRef = useRef<HTMLTableCellElement | null>(null);

  const timeKeys = useMemo(() => {
    const set = new Set<string>();
    for (const r of schedule.resources) {
      for (const s of r.timeSlots) {
        set.add(`${s.startDate} ${s.startTime}`);
      }
    }
    return [...set].sort();
  }, [schedule.resources]);

  const firstAvailableColIndex = useMemo(() => {
    for (let i = 0; i < timeKeys.length; i++) {
      const k = timeKeys[i]!;
      for (const row of schedule.resources) {
        const slot = row.timeSlots.find((s) => `${s.startDate} ${s.startTime}` === k);
        if (slot?.isAvailable) return i;
      }
    }
    return -1;
  }, [timeKeys, schedule.resources]);

  useEffect(() => {
    if (firstAvailableColIndex < 0) return;
    const id = requestAnimationFrame(() => {
      anchorColRef.current?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [firstAvailableColIndex, schedule, timeKeys]);

  return (
    <div className="cb-matrix-scroll cb-hide-scrollbar overflow-x-auto">
      <table className="cb-matrix-table min-w-full text-left">
        <thead>
          <tr className="border-b border-[var(--cb-border)] bg-[var(--cb-bg-table-head)]">
            <th className="cb-matrix-th-resource p-3 font-semibold text-[var(--cb-text)]">Resource</th>
            {timeKeys.map((k, i) => (
              <th
                key={k}
                ref={i === firstAvailableColIndex ? anchorColRef : undefined}
                className="cb-matrix-th-time whitespace-nowrap p-2 text-center text-xs font-semibold text-[var(--cb-text-muted)] sm:p-3 sm:text-sm"
              >
                {formatTime12hFromKey(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.resources.map((row) => (
            <tr key={row.resource.id} className="border-b border-[var(--cb-border)]">
              <td className="p-2 text-sm font-semibold text-[var(--cb-text)] sm:p-3">{row.resource.name}</td>
              {timeKeys.map((k) => {
                const slot = row.timeSlots.find((s) => `${s.startDate} ${s.startTime}` === k);
                const sk = slot ? slotControlKey(row.resource.id, slot) : "";
                const picked = sk && selectedKeys.has(sk);
                const unit =
                  slot && slot.isAvailable
                    ? adjustSlotUnitPrice
                      ? adjustSlotUnitPrice(slot.price)
                      : slot.price
                    : NaN;
                const slotTotal =
                  slot && slot.isAvailable ? slotDisplayTotalPrice(unit, product, durationMinutes) : NaN;
                const peerUnits = peerUnitsForColumn(schedule, k, adjustSlotUnitPrice);
                const rounded = peerUnits.map((n) => Math.round(n * 100) / 100);
                const distinct = new Set(rounded);
                const showPeerTiers = distinct.size >= 2;
                const tier =
                  slot?.isAvailable && showPeerTiers
                    ? slotPriceTierRelativeToPeers(peerUnits, unit)
                    : "standard";

                return (
                  <td key={k} className="cb-matrix-td p-1 align-top sm:p-2">
                    {slot ? (
                      <button
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => slot.isAvailable && onToggleSlot(row.resource.id, row.resource.name, slot)}
                        title={slotTitle(slot)}
                        className={`cb-matrix-slot flex min-h-[4.25rem] w-full min-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-lg border px-1.5 py-2 text-center transition-colors sm:min-w-[5.75rem] sm:px-2 sm:py-2.5 ${
                          !slot.isAvailable
                            ? "cb-matrix-slot--unavailable cursor-not-allowed opacity-50"
                            : `cb-matrix-slot--available ${matrixTierClassName(tier)}${picked ? " cb-matrix-slot--picked" : ""}`
                        }`}
                      >
                        <span className="cb-matrix-slot-time text-[0.65rem] font-bold leading-tight text-[var(--cb-text)] sm:text-xs">
                          {formatTime12hFromKey(k)}
                        </span>
                        {slot.isAvailable && priceCurrency ? (
                          <span className="cb-matrix-slot-price text-sm font-bold leading-none text-[var(--cb-primary)] sm:text-base">
                            {formatSlotPriceDisplay(slotTotal, priceCurrency, { membershipGated })}
                          </span>
                        ) : slot.isAvailable ? (
                          <span className="text-sm font-semibold">{String(slot.price)}</span>
                        ) : (
                          <span className="text-[0.7rem] text-[var(--cb-text-faint)]">—</span>
                        )}
                        {slot.isAvailable && showPeerTiers && tier === "peak" ? (
                          <span className="cb-matrix-slot-tier cb-matrix-slot-tier--peak">
                            <IconPeakTrend className="cb-matrix-slot-tier-ic" aria-hidden />
                            Peak
                          </span>
                        ) : null}
                        {slot.isAvailable && showPeerTiers && tier === "off_peak" ? (
                          <span className="cb-matrix-slot-tier cb-matrix-slot-tier--off">Off-peak</span>
                        ) : null}
                      </button>
                    ) : (
                      <span className="text-[var(--cb-border)]">·</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
