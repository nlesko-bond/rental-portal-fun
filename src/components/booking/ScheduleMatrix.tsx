"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useRef } from "react";
import type { BookingScheduleDto, ExtendedProductDto, ScheduleTimeSlotDto } from "@/types/online-booking";
import { slotDisplayTotalPrice, slotPriceTierRelativeToPeers, type SlotPriceTier } from "@/lib/booking-pricing";
import { membershipGateProductNames } from "@/lib/session-booking-display-lines";
import { slotControlKey } from "@/lib/slot-selection";
import { IconPeakTrend } from "./booking-icons";
import { SlotMemberPriceLabel } from "./SlotMemberPriceLabel";

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

function matrixTierClassName(t: SlotPriceTier): string {
  if (t === "peak") return "cb-matrix-slot--peak";
  if (t === "off_peak") return "cb-matrix-slot--offpeak";
  return "cb-matrix-slot--standard";
}

/** Compare "HH:MM" / "HH:MM:SS" strings from the API (same calendar day). */
function timePartToSeconds(t: string): number {
  const base = t.trim().split(".")[0] ?? "";
  const m = base.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return 0;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] != null ? Number(m[3]) : 0;
  return h * 3600 + min * 60 + sec;
}

function timePortionFromTimeKey(timeKey: string): string {
  return timeKey.length > 11 ? timeKey.slice(11) : "";
}

function columnHasAvailableSlot(schedule: BookingScheduleDto, timeKey: string): boolean {
  for (const row of schedule.resources) {
    const slot = row.timeSlots.find((s) => `${s.startDate} ${s.startTime}` === timeKey);
    if (slot?.isAvailable) return true;
  }
  return false;
}

function findScrollAnchorColumnIndex(
  timeKeys: string[],
  schedule: BookingScheduleDto,
  scheduleDate: string,
  preferredStartResolved: string | null,
  firstAvailableColIndex: number
): number {
  if (timeKeys.length === 0) return -1;

  if (!preferredStartResolved) {
    return firstAvailableColIndex;
  }

  const prefSec = timePartToSeconds(preferredStartResolved);
  const datePrefix = `${scheduleDate} `;

  for (let i = 0; i < timeKeys.length; i++) {
    const k = timeKeys[i]!;
    if (!k.startsWith(datePrefix)) continue;
    const t = timePortionFromTimeKey(k);
    if (timePartToSeconds(t) === prefSec) {
      return i;
    }
  }

  for (let i = 0; i < timeKeys.length; i++) {
    const k = timeKeys[i]!;
    if (!k.startsWith(datePrefix)) continue;
    const t = timePortionFromTimeKey(k);
    if (timePartToSeconds(t) < prefSec) continue;
    if (columnHasAvailableSlot(schedule, k)) return i;
  }

  for (let i = 0; i < timeKeys.length; i++) {
    const k = timeKeys[i]!;
    if (!k.startsWith(datePrefix)) continue;
    const t = timePortionFromTimeKey(k);
    if (timePartToSeconds(t) >= prefSec) return i;
  }

  return firstAvailableColIndex;
}

type Props = {
  schedule: BookingScheduleDto;
  product: ExtendedProductDto | undefined;
  durationMinutes: number;
  priceCurrency: string | null;
  membershipGated: boolean;
  selectedKeys: ReadonlySet<string>;
  /** Slots already in the session cart — not selectable again. */
  reservedSlotKeys?: ReadonlySet<string>;
  onToggleSlot: (resourceId: number, resourceName: string, slot: ScheduleTimeSlotDto) => void;
  adjustSlotUnitPrice?: (unitPrice: number) => number;
  /** Changes when the user picks a new schedule day — scroll position is recomputed. */
  autoScrollKey: string;
  /** Snapped preferred start (matches slot fetch); when set, matrix scrolls to that column or first available at/after it. */
  preferredStartResolved: string | null;
};

export function ScheduleMatrix({
  schedule,
  product,
  durationMinutes,
  priceCurrency,
  membershipGated,
  selectedKeys,
  reservedSlotKeys,
  onToggleSlot,
  adjustSlotUnitPrice,
  autoScrollKey,
  preferredStartResolved,
}: Props) {
  const ts = useTranslations("schedule");
  const membershipGateNames = useMemo(() => membershipGateProductNames(product), [product]);
  const scrollElRef = useRef<HTMLDivElement | null>(null);
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

  const scrollAnchorColIndex = useMemo(
    () =>
      findScrollAnchorColumnIndex(
        timeKeys,
        schedule,
        autoScrollKey,
        preferredStartResolved,
        firstAvailableColIndex
      ),
    [timeKeys, schedule, autoScrollKey, preferredStartResolved, firstAvailableColIndex]
  );

  useLayoutEffect(() => {
    if (scrollAnchorColIndex < 0) return;
    const wrap = scrollElRef.current;
    const anchor = anchorColRef.current;
    if (!wrap || !anchor) return;
    const w = wrap.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    const nextScrollLeft = wrap.scrollLeft + (a.left - w.left);
    wrap.scrollLeft = Math.max(0, nextScrollLeft - 2);
  }, [scrollAnchorColIndex, autoScrollKey, preferredStartResolved, timeKeys.length]);

  return (
    <div
      ref={scrollElRef}
      className="cb-matrix-scroll overflow-x-auto overflow-y-hidden w-full min-w-0"
    >
      <table className="cb-matrix-table min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="border-b border-[var(--cb-border)] bg-[var(--cb-bg-table-head)]">
            <th className="cb-matrix-th-resource cb-matrix-cell--sticky-row p-3 font-semibold text-[var(--cb-text)]">
              Resource
            </th>
            {timeKeys.map((k, i) => (
              <th
                key={k}
                ref={i === scrollAnchorColIndex ? anchorColRef : undefined}
                className="cb-matrix-th-time whitespace-nowrap p-2 text-center text-xs font-semibold text-[var(--cb-text-muted)] sm:p-3 sm:text-sm"
              >
                {formatTime12hFromKey(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.resources.map((row) => {
            // Peer prices for this resource across the day (list view uses the same rule).
            const peerUnitsRawForRow = row.timeSlots.filter((s) => s.isAvailable).map((s) => s.price);
            const roundedRow = peerUnitsRawForRow.map((n) => Math.round(n * 100) / 100);
            const distinctRow = new Set(roundedRow);
            const showPeerTiers = distinctRow.size >= 2;

            return (
            <tr key={row.resource.id} className="border-b border-[var(--cb-border)]">
              <td className="cb-matrix-td-resource cb-matrix-cell--sticky-row p-2 text-sm font-semibold text-[var(--cb-text)] sm:p-3">
                {row.resource.name}
              </td>
              {timeKeys.map((k) => {
                const slot = row.timeSlots.find((s) => `${s.startDate} ${s.startTime}` === k);
                const sk = slot ? slotControlKey(row.resource.id, slot) : "";
                const inCart = Boolean(sk && reservedSlotKeys?.has(sk));
                const picked = sk && selectedKeys.has(sk);
                const unit =
                  slot && slot.isAvailable
                    ? adjustSlotUnitPrice
                      ? adjustSlotUnitPrice(slot.price)
                      : slot.price
                    : NaN;
                const slotTotal =
                  slot && slot.isAvailable ? slotDisplayTotalPrice(unit, product, durationMinutes) : NaN;
                const tier =
                  slot?.isAvailable && showPeerTiers
                    ? slotPriceTierRelativeToPeers(peerUnitsRawForRow, slot.price)
                    : "standard";

                return (
                  <td key={k} className="cb-matrix-td p-1 align-top sm:p-2">
                    {slot ? (
                      <button
                        type="button"
                        disabled={!slot.isAvailable || inCart}
                        onClick={() =>
                          slot.isAvailable && !inCart && onToggleSlot(row.resource.id, row.resource.name, slot)
                        }
                        title={inCart ? ts("alreadyInCart") : slotTitle(slot)}
                        className={`cb-matrix-slot flex min-h-[4.5rem] w-full min-w-[5rem] flex-col items-center justify-center gap-0.5 rounded-lg border px-1.5 py-2 text-center transition-colors sm:min-w-[6rem] sm:px-2 sm:py-2.5 ${
                          !slot.isAvailable
                            ? "cb-matrix-slot--unavailable cursor-not-allowed opacity-50"
                            : inCart
                              ? "cb-matrix-slot--incart cursor-not-allowed opacity-60"
                              : `cb-matrix-slot--available ${matrixTierClassName(tier)}${picked ? " cb-matrix-slot--picked" : ""}`
                        }`}
                      >
                        <span className="cb-matrix-slot-time text-[0.7rem] font-bold leading-tight text-[var(--cb-text)] sm:text-xs">
                          {formatTime12hFromKey(k)}
                        </span>
                        {inCart ? (
                          <span className="cb-matrix-slot-incart mt-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-[var(--cb-text-muted)]">
                            In cart
                          </span>
                        ) : null}
                        {slot.isAvailable && priceCurrency && !inCart ? (
                          <span className="cb-matrix-slot-price text-sm font-bold leading-none text-[var(--cb-primary)] sm:text-base">
                            <SlotMemberPriceLabel
                              amount={slotTotal}
                              currency={priceCurrency}
                              membershipGated={membershipGated}
                              membershipGateNames={membershipGateNames}
                            />
                          </span>
                        ) : slot.isAvailable && !inCart ? (
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
