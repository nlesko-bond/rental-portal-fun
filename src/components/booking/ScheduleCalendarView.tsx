"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
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
    return min === "00" ? `${h}${ap}` : `${h}:${min}${ap}`;
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

const EMPTY_SLOT_KEY_SET = new Set<string>();
const COLLAPSED_RESOURCE_COUNT = 5;

function initialsForResource(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const chars = parts.length > 1 ? [parts[0]?.[0], parts[1]?.[0]] : [name[0], name[1]];
  return chars.filter(Boolean).join("").toUpperCase();
}

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
  requestedSlotKeys?: ReadonlySet<string>;
  resourceSearchPlaceholder: string;
  resourceSelectorTitle: string;
  resourceSelectorSearchPlaceholder: string;
  onToggleSlot: (resourceId: number, resourceName: string, slot: ScheduleTimeSlotDto) => void;
  /** Apply member entitlement discount to schedule unit price before pro-rating (display). */
  adjustSlotUnitPrice?: (unitPrice: number) => number;
  /** When set, slot cells show this instead of cash (punch-pass redeem). */
  slotPriceLabel?: string;
};

export function ScheduleCalendarView({
  schedule,
  product,
  durationMinutes,
  priceCurrency,
  membershipGated: membershipGatedProp,
  selectedKeys,
  reservedSlotKeys,
  requestedSlotKeys,
  resourceSearchPlaceholder,
  resourceSelectorTitle,
  resourceSelectorSearchPlaceholder,
  onToggleSlot,
  adjustSlotUnitPrice,
  slotPriceLabel,
}: Props) {
  const tb = useTranslations("booking");
  const ts = useTranslations("schedule");
  const reserved = reservedSlotKeys ?? EMPTY_SLOT_KEY_SET;
  const requested = requestedSlotKeys ?? EMPTY_SLOT_KEY_SET;
  const [userResourceTabId, setUserResourceTabId] = useState<number | null>(null);
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourcesExpanded, setResourcesExpanded] = useState(false);

  const sortedResources = useMemo(
    () =>
      [...schedule.resources].sort((a, b) =>
        a.resource.name.localeCompare(b.resource.name, undefined, { sensitivity: "base" })
      ),
    [schedule.resources]
  );

  const resourceIds = useMemo(() => sortedResources.map((r) => r.resource.id), [sortedResources]);
  const filteredResources = useMemo(() => {
    const q = resourceQuery.trim().toLowerCase();
    if (!q) return sortedResources;
    return sortedResources.filter(
      (row) =>
        row.resource.name.toLowerCase().includes(q) ||
        (row.resource.type ?? "").toLowerCase().includes(q)
    );
  }, [resourceQuery, sortedResources]);
  const visibleResources = resourcesExpanded || resourceQuery.trim().length > 0
    ? filteredResources
    : filteredResources.slice(0, COLLAPSED_RESOURCE_COUNT);
  const hiddenResourceCount = Math.max(0, filteredResources.length - visibleResources.length);

  const activeResourceId = useMemo(() => {
    if (resourceIds.length === 0) return null;
    if (userResourceTabId != null && resourceIds.includes(userResourceTabId)) return userResourceTabId;
    return resourceIds[0]!;
  }, [resourceIds, userResourceTabId]);

  const membershipGated =
    membershipGatedProp !== undefined ? membershipGatedProp : productMembershipGated(product);

  const membershipGateNames = useMemo(() => membershipGateProductNames(product), [product]);

  function renderSlotGrid(
    resourceId: number,
    resourceName: string,
    slots: ScheduleTimeSlotDto[]
  ) {
    const list = slots.filter((s) => {
      const sk = slotControlKey(resourceId, s);
      return s.isAvailable || reserved.has(sk) || requested.has(sk);
    });
    /** Tier labels vs peers use raw schedule units so member $0 display does not hide peak/off-peak. */
    const peerUnitsRaw = list.map((s) => s.price);
    const distinctPrices = new Set(peerUnitsRaw.filter((n) => Number.isFinite(n)));
    const showPeerTiers = slotPriceLabel == null && distinctPrices.size >= 2;
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
          const isRequested = requested.has(sk);
          const blocked = inCart || isRequested;
          const picked = selectedKeys.has(sk);
          const unit = adjustSlotUnitPrice ? adjustSlotUnitPrice(s.price) : s.price;
          const total = slotDisplayTotalPrice(unit, product, durationMinutes);
          const tier = showPeerTiers ? slotPriceTierRelativeToPeers(peerUnitsRaw, s.price) : "standard";
          return (
            <li key={`${s.startDate}-${s.startTime}-${i}`} className="cb-slot-grid-cell">
              <button
                type="button"
                disabled={!s.isAvailable || blocked}
                onClick={() => {
                  if (!s.isAvailable || blocked) return;
                  onToggleSlot(resourceId, resourceName, s);
                }}
                title={isRequested ? ts("alreadyRequested") : inCart ? ts("alreadyInCart") : undefined}
                className={`cb-slot-btn ${picked ? "cb-slot-btn--picked" : ""} ${!s.isAvailable ? "cb-slot-btn--full" : ""} ${blocked ? "cb-slot-btn--incart" : ""} ${tierClass(tier)}`}
              >
                <span className="cb-slot-btn-time">{formatSlotRange12h(s.startTime, s.endTime)}</span>
                {blocked ? (
                  <span className="cb-slot-btn-incart mt-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[var(--cb-text-muted)]">
                    {isRequested ? ts("requested") : "In cart"}
                  </span>
                ) : null}
                {s.isAvailable && !blocked ? (
                  <span className="cb-slot-btn-price">
                    {slotPriceLabel ? (
                      slotPriceLabel
                    ) : priceCurrency ? (
                      <SlotMemberPriceLabel
                        amount={total}
                        currency={priceCurrency}
                        membershipGated={membershipGated}
                        membershipGateNames={membershipGateNames}
                      />
                    ) : null}
                  </span>
                ) : null}
                {s.isAvailable && !blocked && showPeerTiers && tier === "peak" ? (
                  <span className="cb-slot-btn-tier">
                    <IconPeakTrend className="cb-slot-tier-icon" />
                    Peak
                  </span>
                ) : null}
                {s.isAvailable && !blocked && showPeerTiers && tier === "off_peak" ? (
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

  const activeRow = sortedResources.find((r) => r.resource.id === activeResourceId);
  const multiResource = sortedResources.length > 1;

  return (
    <div className="cb-schedule-resource-tabs">
      {multiResource ? (
        <section className="cb-resource-selector-card" aria-labelledby="cb-resource-picker-title">
          <div className="cb-resource-selector-head">
            <h3 id="cb-resource-picker-title" className="cb-resource-picker-title">
              {resourceSelectorTitle}
            </h3>
            {hiddenResourceCount > 0 || resourcesExpanded ? (
              <button
                type="button"
                className="cb-resource-selector-toggle"
                onClick={() => setResourcesExpanded((value) => !value)}
              >
                {resourcesExpanded ? tb("resourceSelectorShowLess") : tb("resourceSelectorShowAll")}
              </button>
            ) : null}
          </div>
          <label className="sr-only" htmlFor="cb-resource-selector-search">
            {resourceSearchPlaceholder}
          </label>
          <div className="cb-resource-selector-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="10.5" cy="10.5" r="5.75" stroke="currentColor" strokeWidth="1.8" />
              <path d="M15 15l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              id="cb-resource-selector-search"
              type="search"
              value={resourceQuery}
              placeholder={resourceSelectorSearchPlaceholder}
              onChange={(event) => setResourceQuery(event.target.value)}
            />
          </div>
          <div className="cb-resource-tabs" role="tablist" aria-labelledby="cb-resource-picker-title">
                {visibleResources.map((r) => {
                  const sel = r.resource.id === activeResourceId;
                  const n = slotCountForResource(r.resource.id);
                  return (
                    <button
                      key={r.resource.id}
                      type="button"
                      role="tab"
                      aria-selected={sel}
                      className={`cb-resource-tab ${sel ? "cb-resource-tab--active" : ""}`}
                      onClick={() => setUserResourceTabId(r.resource.id)}
                    >
                      <span className="cb-resource-tab-avatar" aria-hidden>{initialsForResource(r.resource.name)}</span>
                      <span className="cb-resource-tab-text">
                        <span className="cb-resource-tab-label">{r.resource.name}</span>
                      </span>
                      {n > 0 ? (
                        <span className="cb-resource-tab-badge" aria-label={`${n} slots selected`}>
                          {n}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
                {hiddenResourceCount > 0 ? (
                  <button
                    type="button"
                    className="cb-resource-tab cb-resource-tab--more"
                    onClick={() => setResourcesExpanded(true)}
                  >
                    {tb("resourceSelectorMore", { count: hiddenResourceCount })}
                  </button>
                ) : null}
                {filteredResources.length === 0 ? (
                  <p className="cb-resource-empty" role="status">{tb("resourceJumpNoMatches")}</p>
                ) : null}
          </div>
        </section>
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
