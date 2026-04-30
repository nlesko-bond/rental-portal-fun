"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getEffectiveAddonSlotKeys } from "@/lib/addon-slot-targeting";
import type { PackageAddonLine } from "@/lib/product-package-addons";
import { addonPriceSuffixForLevel, resolveAddonDisplayPrice } from "@/lib/product-package-addons";
import type { PickedSlot } from "@/lib/slot-selection";
import { formatPickedSlotTimeRange } from "./booking-slot-labels";

export type AddonSlotTargeting = Record<number, { all: boolean; keys: string[] }>;

export { getEffectiveAddonSlotKeys };

type Props = {
  visibleAddons: PackageAddonLine[];
  hasMoreAddons: boolean;
  addonsExpanded: boolean;
  onToggleExpand: () => void;
  moreCount: number;
  selectedAddonIds: ReadonlySet<number>;
  addonQuantities?: ReadonlyMap<number, number>;
  addonSlotQuantities?: ReadonlyMap<number, ReadonlyMap<string, number>>;
  onSetAddonQty?: (addonId: number, qty: number) => void;
  onSetAddonSlotQty?: (addonId: number, slotKey: string, qty: number) => void;
  onToggleAddon: (addon: PackageAddonLine) => void;
  addonSlotTargeting: AddonSlotTargeting;
  onAddonSelectAllSlots: (addonId: number, checked: boolean, allSlotKeys: string[]) => void;
  onToggleAddonSlot: (addonId: number, slotKey: string, allSlotKeys: string[]) => void;
  pickedSlots: PickedSlot[];
  formatPrice: (amount: number, currency: string) => string;
  /** Hide the panel-level heading; subsection headings still render. Used by the checkout step. */
  omitPanelHeading?: boolean;
};

const ADDON_MAX_QTY = 50;
const ADDON_MIN_QTY = 0;
const DEFAULT_SLOT_QTY = 1;
const DEFAULT_RESERVATION_QTY = 1;

function clampQty(n: number): number {
  if (!Number.isFinite(n)) return ADDON_MIN_QTY;
  return Math.min(ADDON_MAX_QTY, Math.max(ADDON_MIN_QTY, Math.round(n)));
}

type StepperProps = {
  qty: number;
  onChange: (next: number) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  /** Stop click propagation so steppers inside clickable cards don't toggle selection. */
  stopPropagation?: boolean;
};

function QtyStepper({ qty, onChange, ariaLabel, size = "md", stopPropagation }: StepperProps) {
  const handler = (next: number) => (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    onChange(clampQty(next));
  };
  const cls = size === "sm" ? "cb-addon-qty cb-addon-qty--sm" : "cb-addon-qty";
  return (
    <span className={cls} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="cb-addon-qty-btn"
        aria-label="Decrease"
        disabled={qty <= ADDON_MIN_QTY}
        onClick={handler(qty - 1)}
      >
        −
      </button>
      <span className="cb-addon-qty-val" aria-live="polite">{qty}</span>
      <button
        type="button"
        className="cb-addon-qty-btn"
        aria-label="Increase"
        disabled={qty >= ADDON_MAX_QTY}
        onClick={handler(qty + 1)}
      >
        +
      </button>
    </span>
  );
}

type ReservationCardProps = {
  addon: PackageAddonLine;
  selected: boolean;
  qty: number;
  onToggle: () => void;
  onSetQty?: (id: number, qty: number) => void;
  formatPrice: (amount: number, currency: string) => string;
  qtyAria: string;
};

function ReservationAddonCard({
  addon,
  selected,
  qty,
  onToggle,
  onSetQty,
  formatPrice,
  qtyAria,
}: ReservationCardProps) {
  const resolved = resolveAddonDisplayPrice(addon);
  const priceLabel = resolved
    ? `${formatPrice(resolved.price, resolved.currency)}${addonPriceSuffixForLevel(addon.level)}`
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-pressed={selected}
      title={addon.name}
      className={`cb-addon-card-v2 ${selected ? "cb-addon-card-v2--selected" : ""}`}
    >
      <div className="cb-addon-card-v2-body">
        <p className="cb-addon-card-v2-title" title={addon.name}>{addon.name}</p>
        {priceLabel ? <p className="cb-addon-card-v2-price">${priceLabel.replace(/^\$/, "")}</p> : null}
      </div>
      {selected && onSetQty ? (
        <div className="cb-addon-card-v2-stepper">
          <QtyStepper
            qty={qty}
            onChange={(next) => onSetQty(addon.id, Math.max(1, next))}
            ariaLabel={qtyAria}
            stopPropagation
          />
        </div>
      ) : null}
    </div>
  );
}

type SlotCardProps = {
  addon: PackageAddonLine;
  selected: boolean;
  slotKeySet: Set<string>;
  targeting: AddonSlotTargeting;
  slotQuantities?: ReadonlyMap<string, number>;
  onToggle: () => void;
  formatPrice: (amount: number, currency: string) => string;
  copy: ReturnType<typeof useTranslations>;
};

function SlotAddonCard({
  addon,
  selected,
  slotKeySet,
  targeting,
  slotQuantities,
  onToggle,
  formatPrice,
  copy,
}: SlotCardProps) {
  const resolved = resolveAddonDisplayPrice(addon);
  const priceLabel = resolved
    ? `${formatPrice(resolved.price, resolved.currency)}${addonPriceSuffixForLevel(addon.level)}`
    : null;

  const spec = targeting[addon.id];
  const eff = getEffectiveAddonSlotKeys(spec, slotKeySet);
  const totalQty = (() => {
    if (!selected) return 0;
    let sum = 0;
    for (const key of eff) {
      const q = slotQuantities?.get(key) ?? DEFAULT_SLOT_QTY;
      if (q > 0) sum += q;
    }
    return sum;
  })();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-pressed={selected}
      title={addon.name}
      className={`cb-addon-card-v2 ${selected ? "cb-addon-card-v2--selected" : ""}`}
    >
      {selected && totalQty > 0 ? (
        <span
          className="cb-addon-card-v2-badge"
          aria-label={copy("totalQtyAria", { count: totalQty, name: addon.name })}
        >
          {totalQty}
        </span>
      ) : null}
      <div className="cb-addon-card-v2-body">
        <p className="cb-addon-card-v2-title" title={addon.name}>{addon.name}</p>
        {priceLabel ? <p className="cb-addon-card-v2-price">${priceLabel.replace(/^\$/, "")}</p> : null}
      </div>
    </div>
  );
}

type SlotPanelProps = {
  addon: PackageAddonLine;
  pickedSlots: PickedSlot[];
  allSlotKeys: string[];
  slotKeySet: Set<string>;
  targeting: AddonSlotTargeting;
  slotQuantities?: ReadonlyMap<string, number>;
  onToggleSlot: (addonId: number, slotKey: string, allKeys: string[]) => void;
  onSelectAllSlots: (addonId: number, checked: boolean, allKeys: string[]) => void;
  onSetSlotQty?: (addonId: number, slotKey: string, qty: number) => void;
  copy: ReturnType<typeof useTranslations>;
};

function SlotPanel({
  addon,
  pickedSlots,
  allSlotKeys,
  slotKeySet,
  targeting,
  slotQuantities,
  onToggleSlot,
  onSelectAllSlots,
  onSetSlotQty,
  copy,
}: SlotPanelProps) {
  /** Intent-based: reflects whether the user explicitly enabled "Add to all", not derived from per-slot membership. */
  const allOn = targeting[addon.id]?.all === true;
  const eff = getEffectiveAddonSlotKeys(targeting[addon.id], slotKeySet);

  /** When "Add to all" is on, the bulk stepper is the single source of truth for qty. */
  const bulkQty = (() => {
    if (!allOn) return DEFAULT_SLOT_QTY;
    let candidate = 0;
    for (const p of pickedSlots) {
      const q = slotQuantities?.get(p.key) ?? DEFAULT_SLOT_QTY;
      if (q > candidate) candidate = q;
    }
    return Math.max(DEFAULT_SLOT_QTY, candidate);
  })();

  const setBulkQty = (next: number) => {
    if (!onSetSlotQty) return;
    const v = clampQty(next);
    for (const p of pickedSlots) onSetSlotQty(addon.id, p.key, v);
  };

  /** Per-slot interaction while "Add to all" is on auto-converts to manual mode so bulk stops mirroring individual edits. */
  const ensureManualMode = () => {
    if (allOn) onSelectAllSlots(addon.id, false, allSlotKeys);
  };

  return (
    <div className="cb-addon-slot-panel" role="group" aria-label={copy("slotsForAddonAria", { name: addon.name })}>
      <div className="cb-addon-slot-panel-head">
        <label className="cb-addon-slot-panel-toggle">
          <input
            type="checkbox"
            checked={allOn}
            onChange={(e) => onSelectAllSlots(addon.id, e.target.checked, allSlotKeys)}
          />
          <span>{copy("addToAllTimeSlots")}</span>
        </label>
        {allOn && onSetSlotQty ? (
          <QtyStepper
            qty={bulkQty}
            onChange={setBulkQty}
            ariaLabel={copy("qtyForAria", { name: addon.name })}
          />
        ) : null}
      </div>

      <ul className="cb-addon-slot-panel-list">
        {pickedSlots.map((p, idx) => {
          const on = eff.has(p.key);
          const slotQty = slotQuantities?.get(p.key) ?? (on ? DEFAULT_SLOT_QTY : ADDON_MIN_QTY);
          const slotLabel = `${formatPickedSlotTimeRange(p)} ${p.resourceName}`.trim();
          const setManualSlotQty = (next: number) => {
            ensureManualMode();
            if (next > ADDON_MIN_QTY && !on) onToggleSlot(addon.id, p.key, allSlotKeys);
            if (next <= ADDON_MIN_QTY && on) onToggleSlot(addon.id, p.key, allSlotKeys);
            onSetSlotQty?.(addon.id, p.key, next);
          };
          return (
            <li
              key={`${p.key}#${idx}`}
              className={`cb-addon-slot-panel-row ${on ? "cb-addon-slot-panel-row--on" : ""}`}
            >
              <label className="cb-addon-slot-panel-row-check">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => {
                    ensureManualMode();
                    onToggleSlot(addon.id, p.key, allSlotKeys);
                  }}
                />
                <span className="cb-addon-slot-panel-row-time">{formatPickedSlotTimeRange(p)}</span>
                <span className="cb-addon-slot-panel-row-resource">{p.resourceName}</span>
              </label>
              {onSetSlotQty && !allOn ? (
                <QtyStepper
                  qty={slotQty}
                  onChange={setManualSlotQty}
                  ariaLabel={copy("qtyForSlotAria", { name: addon.name, slot: slotLabel })}
                  size="sm"
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BookingAddonPanel({
  visibleAddons,
  hasMoreAddons,
  addonsExpanded,
  onToggleExpand,
  moreCount,
  selectedAddonIds,
  addonQuantities,
  addonSlotQuantities,
  onSetAddonQty,
  onSetAddonSlotQty,
  onToggleAddon,
  addonSlotTargeting,
  onAddonSelectAllSlots,
  onToggleAddonSlot,
  pickedSlots,
  formatPrice,
  omitPanelHeading = false,
}: Props) {
  const ta = useTranslations("addons");
  const allSlotKeys = pickedSlots.map((s) => s.key);
  const slotKeySet = new Set(allSlotKeys);
  const [activeSlotAddonId, setActiveSlotAddonId] = useState<number | null>(null);

  const reservation = visibleAddons.filter((a) => a.level === "reservation");
  const slot = visibleAddons.filter((a) => a.level === "slot");
  const hour = visibleAddons.filter((a) => a.level === "hour");

  const hasAny = reservation.length > 0 || slot.length > 0 || hour.length > 0;

  useEffect(() => {
    if (activeSlotAddonId != null && !visibleAddons.some((addon) => addon.id === activeSlotAddonId)) {
      setActiveSlotAddonId(null);
    }
  }, [activeSlotAddonId, visibleAddons]);

  if (!hasAny) return null;

  /** Find the first selected addon in a list — its slot panel renders below the rail. */
  const firstSelected = (items: PackageAddonLine[]): PackageAddonLine | null => {
    for (const a of items) if (selectedAddonIds.has(a.id)) return a;
    return null;
  };

  const renderReservationSection = () => {
    if (reservation.length === 0) return null;
    return (
      <section className="cb-addon-section" aria-labelledby="addon-section-reservation">
        <h4 id="addon-section-reservation" className="cb-addon-section-title">
          {ta("extrasPerBooking", { count: reservation.length })}
        </h4>
        <div className="cb-addon-card-rail">
          {reservation.map((a) => {
            const sel = selectedAddonIds.has(a.id);
            const qty = sel
              ? Math.max(DEFAULT_RESERVATION_QTY, addonQuantities?.get(a.id) ?? DEFAULT_RESERVATION_QTY)
              : DEFAULT_RESERVATION_QTY;
            return (
              <ReservationAddonCard
                key={a.id}
                addon={a}
                selected={sel}
                qty={qty}
                onToggle={() => onToggleAddon(a)}
                onSetQty={onSetAddonQty}
                formatPrice={formatPrice}
                qtyAria={ta("qtyForAria", { name: a.name })}
              />
            );
          })}
        </div>
      </section>
    );
  };

  const renderSlotLikeSection = (
    items: PackageAddonLine[],
    titleKey: "extrasPerTimeSlot" | "extrasPerHour"
  ) => {
    if (items.length === 0) return null;
    const sectionId = `addon-section-${titleKey}`;
    const active =
      activeSlotAddonId == null
        ? firstSelected(items)
        : items.find((addon) => addon.id === activeSlotAddonId && selectedAddonIds.has(addon.id)) ?? firstSelected(items);
    return (
      <section className="cb-addon-section" aria-labelledby={sectionId}>
        <h4 id={sectionId} className="cb-addon-section-title">
          {ta(titleKey, { count: items.length })}
        </h4>
        <div className="cb-addon-card-rail">
          {items.map((a) => {
            const sel = selectedAddonIds.has(a.id);
            return (
              <SlotAddonCard
                key={a.id}
                addon={a}
                selected={sel}
                slotKeySet={slotKeySet}
                targeting={addonSlotTargeting}
                slotQuantities={addonSlotQuantities?.get(a.id)}
                onToggle={() => {
                  setActiveSlotAddonId(a.id);
                  onToggleAddon(a);
                }}
                formatPrice={formatPrice}
                copy={ta}
              />
            );
          })}
        </div>
        {active && pickedSlots.length > 0 ? (
          <SlotPanel
            addon={active}
            pickedSlots={pickedSlots}
            allSlotKeys={allSlotKeys}
            slotKeySet={slotKeySet}
            targeting={addonSlotTargeting}
            slotQuantities={addonSlotQuantities?.get(active.id)}
            onToggleSlot={onToggleAddonSlot}
            onSelectAllSlots={onAddonSelectAllSlots}
            onSetSlotQty={onSetAddonSlotQty}
            copy={ta}
          />
        ) : active && pickedSlots.length === 0 ? (
          <p className="cb-addon-slot-hint">{ta("selectSlotsFirst")}</p>
        ) : null}
      </section>
    );
  };

  return (
    <section
      className="cb-addon-panel-v2 text-left"
      aria-label={omitPanelHeading ? ta("panelHeading") : undefined}
      {...(omitPanelHeading ? {} : { "aria-labelledby": "addons-heading" })}
    >
      {omitPanelHeading ? null : (
        <h3 id="addons-heading" className="cb-addon-panel-v2-title">
          {ta("panelHeadingWithCount", { count: visibleAddons.length })}
        </h3>
      )}

      {renderReservationSection()}
      {renderSlotLikeSection(slot, "extrasPerTimeSlot")}
      {renderSlotLikeSection(hour, "extrasPerHour")}

      {hasMoreAddons ? (
        <button type="button" className="cb-addon-more" onClick={onToggleExpand}>
          {addonsExpanded ? ta("showFewer") : ta("viewMore", { count: moreCount })}
        </button>
      ) : null}
    </section>
  );
}
