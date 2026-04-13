"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { BookingScheduleDto, ExtendedProductDto, ScheduleTimeSlotDto } from "@/types/online-booking";
import { productMembershipGated, slotDisplayTotalPrice, slotPriceTierRelativeToPeers, type SlotPriceTier } from "@/lib/booking-pricing";
import { membershipGateProductNames } from "@/lib/session-booking-display-lines";
import { slotControlKey } from "@/lib/slot-selection";
import { IconPeakTrend } from "./booking-icons";
import { SlotMemberPriceLabel } from "./SlotMemberPriceLabel";

function formatSlotRange12h(startTime: string, endTime: string): string {
  const fmt = (t: string) => {
    const m = t.slice(0, 5).match(/^(\d{2}):(\d{2})$/);
    if (!m) return t.slice(0, 5);
    let h = Number(m[1]);
    const min = m[2];
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${min}${ap}`;
  };
  /* Non-breaking spaces so the range stays on one line inside the slot */
  return `${fmt(startTime)}\u00A0–\u00A0${fmt(endTime)}`;
}

function tierClass(t: SlotPriceTier): string {
  if (t === "peak") return "cb-slot-btn--peak";
  if (t === "off_peak") return "cb-slot-btn--offpeak";
  if (t === "standard") return "cb-slot-btn--standard";
  return "";
}

/** Show search combobox when jumping between many resources is tedious. */
const RESOURCE_SEARCH_THRESHOLD = 11;

function ResourceSearchJump({
  rows,
  activeResourceId,
  onPick,
}: {
  rows: BookingScheduleDto["resources"];
  activeResourceId: number;
  onPick: (resourceId: number) => void;
}) {
  const tb = useTranslations("booking");
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.resource.name.localeCompare(b.resource.name, undefined, { sensitivity: "base" })),
    [rows]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return sorted;
    return sorted.filter(
      (row) =>
        row.resource.name.toLowerCase().includes(s) || (row.resource.type ?? "").toLowerCase().includes(s)
    );
  }, [q, sorted]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="cb-resource-jump">
      <input
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="cb-resource-jump-input cb-input"
        value={q}
        placeholder={tb("findResourcePlaceholder")}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open ? (
        <ul id={listId} className="cb-resource-jump-list" role="listbox">
          {filtered.length === 0 ? (
            <li className="cb-resource-jump-empty" role="presentation">
              {tb("resourceJumpNoMatches")}
            </li>
          ) : (
            filtered.slice(0, 24).map((row) => (
              <li key={row.resource.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={row.resource.id === activeResourceId}
                  className="cb-resource-jump-option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onPick(row.resource.id);
                    setQ("");
                    setOpen(false);
                  }}
                >
                  <span className="cb-resource-jump-option-label">{row.resource.name}</span>
                  {row.resource.type?.trim() ? (
                    <span className="cb-resource-jump-option-meta">{row.resource.type.trim()}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

const EMPTY_SLOT_KEY_SET = new Set<string>();

type Props = {
  schedule: BookingScheduleDto;
  product: ExtendedProductDto | undefined;
  durationMinutes: number;
  priceCurrency: string | null;
  /**
   * When set, overrides catalog-driven membership price label (e.g. participant already has required membership).
   * When omitted, derived from `product` via `productMembershipGated`.
   */
  membershipGated?: boolean;
  selectedKeys: ReadonlySet<string>;
  reservedSlotKeys?: ReadonlySet<string>;
  onToggleSlot: (resourceId: number, resourceName: string, slot: ScheduleTimeSlotDto) => void;
  /** Apply member entitlement discount to schedule unit price before pro-rating (display). */
  adjustSlotUnitPrice?: (unitPrice: number) => number;
};

export function ScheduleCalendarView({
  schedule,
  product,
  durationMinutes,
  priceCurrency,
  membershipGated: membershipGatedProp,
  selectedKeys,
  reservedSlotKeys,
  onToggleSlot,
  adjustSlotUnitPrice,
}: Props) {
  const ts = useTranslations("schedule");
  const reserved = reservedSlotKeys ?? EMPTY_SLOT_KEY_SET;
  const [userResourceTabId, setUserResourceTabId] = useState<number | null>(null);

  const resourceIds = useMemo(() => schedule.resources.map((r) => r.resource.id), [schedule.resources]);

  const activeResourceId = useMemo(() => {
    if (resourceIds.length === 0) return null;
    if (userResourceTabId != null && resourceIds.includes(userResourceTabId)) return userResourceTabId;
    return resourceIds[0]!;
  }, [resourceIds, userResourceTabId]);

  const membershipGated =
    membershipGatedProp !== undefined ? membershipGatedProp : productMembershipGated(product);

  const membershipGateNames = useMemo(() => membershipGateProductNames(product), [product]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof schedule.resources>();
    for (const row of schedule.resources) {
      const t = row.resource.type?.trim() || "Other";
      const list = map.get(t) ?? [];
      list.push(row);
      map.set(t, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [schedule]);

  const showTypeHeadings = grouped.length > 1;

  function renderSlotGrid(
    resourceId: number,
    resourceName: string,
    slots: ScheduleTimeSlotDto[]
  ) {
    const list = slots.filter((s) => {
      const sk = slotControlKey(resourceId, s);
      return s.isAvailable || reserved.has(sk);
    });
    /** Tier labels vs peers use raw schedule units so member $0 display does not hide peak/off-peak. */
    const peerUnitsRaw = list.map((s) => s.price);
    const distinctPrices = new Set(peerUnitsRaw.filter((n) => Number.isFinite(n)));
    const showPeerTiers = distinctPrices.size >= 2;
    if (list.length === 0) {
      return (
        <p className="cb-resource-empty" role="status">
          {ts("productUnavailableOnResource", { resource: resourceName })}
        </p>
      );
    }
    return (
      <ul className="cb-slot-grid">
        {list.map((s, i) => {
          const sk = slotControlKey(resourceId, s);
          const inCart = reserved.has(sk);
          const picked = selectedKeys.has(sk);
          const unit = adjustSlotUnitPrice ? adjustSlotUnitPrice(s.price) : s.price;
          const total = slotDisplayTotalPrice(unit, product, durationMinutes);
          const tier = showPeerTiers ? slotPriceTierRelativeToPeers(peerUnitsRaw, s.price) : "standard";
          return (
            <li key={`${s.startDate}-${s.startTime}-${i}`} className="cb-slot-grid-cell">
              <button
                type="button"
                disabled={!s.isAvailable || inCart}
                onClick={() => {
                  if (!s.isAvailable || inCart) return;
                  onToggleSlot(resourceId, resourceName, s);
                }}
                title={inCart ? ts("alreadyInCart") : undefined}
                className={`cb-slot-btn ${picked ? "cb-slot-btn--picked" : ""} ${!s.isAvailable ? "cb-slot-btn--full" : ""} ${inCart ? "cb-slot-btn--incart" : ""} ${tierClass(tier)}`}
              >
                <span className="cb-slot-btn-time">{formatSlotRange12h(s.startTime, s.endTime)}</span>
                {inCart ? (
                  <span className="cb-slot-btn-incart mt-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--cb-text-muted)]">
                    In cart
                  </span>
                ) : null}
                {s.isAvailable && priceCurrency && !inCart ? (
                  <span className="cb-slot-btn-price">
                    <SlotMemberPriceLabel
                      amount={total}
                      currency={priceCurrency}
                      membershipGated={membershipGated}
                      membershipGateNames={membershipGateNames}
                    />
                  </span>
                ) : null}
                {s.isAvailable && showPeerTiers && tier === "peak" ? (
                  <span className="cb-slot-btn-tier">
                    <IconPeakTrend className="cb-slot-tier-icon" />
                    Peak
                  </span>
                ) : null}
                {s.isAvailable && showPeerTiers && tier === "off_peak" ? (
                  <span className="cb-slot-btn-tier cb-slot-btn-tier--off">Off-peak</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  function slotCountForResource(resourceId: number): number {
    let n = 0;
    const prefix = `${resourceId}-`;
    for (const k of selectedKeys) {
      if (k.startsWith(prefix)) n += 1;
    }
    return n;
  }

  const activeRow = schedule.resources.find((r) => r.resource.id === activeResourceId);
  const multiResource = schedule.resources.length > 1;

  return (
    <div className="cb-schedule-resource-tabs">
      {multiResource ? (
        <>
          <h3 id="cb-resource-picker-title" className="cb-resource-picker-title">
            Select a resource ({schedule.resources.length} available)
          </h3>
          <div
            className={
              schedule.resources.length >= RESOURCE_SEARCH_THRESHOLD
                ? "cb-resource-toolbar"
                : "cb-resource-toolbar cb-resource-toolbar--tabs-only"
            }
          >
            {schedule.resources.length >= RESOURCE_SEARCH_THRESHOLD ? (
              <ResourceSearchJump
                rows={schedule.resources}
                activeResourceId={activeResourceId ?? schedule.resources[0]!.resource.id}
                onPick={(id) => setUserResourceTabId(id)}
              />
            ) : null}
            <div className="cb-resource-tabs-scroll cb-hide-scrollbar">
              <div className="cb-resource-tabs" role="tablist" aria-labelledby="cb-resource-picker-title">
                {schedule.resources.map((r) => {
                  const sel = r.resource.id === activeResourceId;
                  const n = slotCountForResource(r.resource.id);
                  const typeLine = showTypeHeadings ? r.resource.type?.trim() : "";
                  return (
                    <button
                      key={r.resource.id}
                      type="button"
                      role="tab"
                      aria-selected={sel}
                      className={`cb-resource-tab ${sel ? "cb-resource-tab--active" : ""}`}
                      onClick={() => setUserResourceTabId(r.resource.id)}
                    >
                      <span className="cb-resource-tab-text">
                        <span className="cb-resource-tab-label">{r.resource.name}</span>
                        {typeLine ? <span className="cb-resource-tab-meta">{typeLine}</span> : null}
                      </span>
                      {n > 0 ? (
                        <span className="cb-resource-tab-badge" aria-label={`${n} slots selected`}>
                          {n}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}
      {activeRow ? (
        <div
          className="cb-resource-panel"
          role="tabpanel"
          aria-labelledby={multiResource ? "cb-resource-picker-title" : undefined}
        >
          {renderSlotGrid(activeRow.resource.id, activeRow.resource.name, activeRow.timeSlots)}
        </div>
      ) : null}
    </div>
  );
}
