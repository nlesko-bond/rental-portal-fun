"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function ymdKey(y: number, m: number, day: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type Props = {
  availableDates: string[];
  /** YYYY-MM-DD in API/UTC terms; gold “VIP early access” only when member advance window > guest window. */
  vipEarlyAccessDates?: string[];
  selectedDate: string | null;
  onSelect: (d: string) => void;
  onClose: () => void;
  /** When embedded in the schedule band, do not close a parent dialog on day select. */
  closeOnSelect?: boolean;
  className?: string;
  /** Hide footer “Sign in to see VIP early access” when already authenticated. */
  signedIn?: boolean;
};

type Cell =
  | { kind: "lead"; day: number; key: string }
  | { kind: "current"; day: number; key: string }
  | { kind: "trail"; day: number; key: string };

function buildGrid(viewY: number, viewM: number): Cell[] {
  const firstDow = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const prevMonth = viewM === 0 ? 11 : viewM - 1;
  const prevYear = viewM === 0 ? viewY - 1 : viewY;
  const prevLen = new Date(prevYear, prevMonth + 1, 0).getDate();

  const cells: Cell[] = [];
  for (let i = 0; i < firstDow; i++) {
    const d = prevLen - firstDow + 1 + i;
    cells.push({ kind: "lead", day: d, key: `lead-${prevYear}-${prevMonth}-${d}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ kind: "current", day: d, key: ymdKey(viewY, viewM, d) });
  }
  const total = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  const nextMonth = viewM === 11 ? 0 : viewM + 1;
  const nextYear = viewM === 11 ? viewY + 1 : viewY;
  while (cells.length < total) {
    cells.push({ kind: "trail", day: nextDay, key: `trail-${nextYear}-${nextMonth}-${nextDay}` });
    nextDay += 1;
  }
  return cells;
}

export function AvailableDateCalendarBody({
  availableDates,
  vipEarlyAccessDates = [],
  selectedDate,
  onSelect,
  onClose,
  closeOnSelect = true,
  className,
  signedIn = false,
}: Props) {
  const tb = useTranslations("booking");
  const weekLabels = useMemo(() => {
    const raw = tb.raw("calendarWeekdays");
    return Array.isArray(raw) && raw.length === 7 ? (raw as string[]) : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  }, [tb]);
  const available = useMemo(() => new Set(availableDates), [availableDates]);
  const vipEarly = useMemo(() => new Set(vipEarlyAccessDates), [vipEarlyAccessDates]);

  const anchor =
    selectedDate && available.has(selectedDate)
      ? selectedDate
      : availableDates.length > 0
        ? [...availableDates].sort()[0]!
        : null;

  const initial = anchor
    ? (() => {
        const [y, mo] = anchor.split("-").map(Number);
        return { y: y!, m: Math.max(0, Math.min(11, (mo ?? 1) - 1)) };
      })()
    : { y: new Date().getFullYear(), m: new Date().getMonth() };

  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);

  const monthLabel = new Date(viewY, viewM, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const cells = useMemo(() => buildGrid(viewY, viewM), [viewY, viewM]);
  const todayUtcYmd = new Date().toISOString().slice(0, 10);

  function prevMonth() {
    if (viewM === 0) {
      setViewM(11);
      setViewY((y) => y - 1);
    } else {
      setViewM((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewM === 11) {
      setViewM(0);
      setViewY((y) => y + 1);
    } else {
      setViewM((m) => m + 1);
    }
  }

  return (
    <div className={`cb-dp-root${className ? ` ${className}` : ""}`}>
      <div className="cb-dp-nav">
        <button type="button" className="cb-dp-nav-btn" onClick={prevMonth} aria-label={tb("calendarPrevMonth")}>
          <span aria-hidden>‹</span>
        </button>
        <span className="cb-dp-month">{monthLabel}</span>
        <button type="button" className="cb-dp-nav-btn" onClick={nextMonth} aria-label={tb("calendarNextMonth")}>
          <span aria-hidden>›</span>
        </button>
      </div>
      <div className="cb-dp-weekdays">
        {weekLabels.map((w) => (
          <div key={w} className="cb-dp-wd">
            {w}
          </div>
        ))}
      </div>
      <div className="cb-dp-grid" role="grid">
        {cells.map((c) => {
          if (c.kind !== "current") {
            return (
              <div key={c.key} className="cb-dp-cell cb-dp-cell--adjacent" aria-hidden>
                {c.day}
              </div>
            );
          }
          const isPast = c.key < todayUtcYmd;
          const isAvail = !isPast && available.has(c.key);
          const isSel = selectedDate === c.key;
          const isToday = c.key === todayUtcYmd;
          const showVipFrame = !isPast && !isAvail && vipEarly.has(c.key);
          const title = isPast
            ? undefined
            : isAvail
              ? undefined
              : showVipFrame
                ? tb("vipEarlyAccessHint")
                : undefined;
          return (
            <button
              key={c.key}
              type="button"
              role="gridcell"
              disabled={!isAvail}
              title={title}
              className={`cb-dp-cell ${isPast ? "cb-dp-cell--past" : ""}${isAvail ? " cb-dp-cell--avail" : " cb-dp-cell--blocked"}${showVipFrame ? " cb-dp-cell--early-access" : ""}${isToday && isAvail ? " cb-dp-cell--today" : ""}${isSel ? " cb-dp-cell--selected" : ""}`}
              onClick={() => {
                if (!isAvail) return;
                onSelect(c.key);
                if (closeOnSelect) onClose();
              }}
            >
              {c.day}
            </button>
          );
        })}
      </div>
      {!signedIn ? (
        <p className="cb-dp-early-access-hint" role="note">
          {tb("vipEarlyAccessFooter")}
        </p>
      ) : null}
    </div>
  );
}
