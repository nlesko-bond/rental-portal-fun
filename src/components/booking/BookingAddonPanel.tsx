"use client";

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
  onSetAddonQty?: (addonId: number, qty: number) => void;
  onToggleAddon: (addon: PackageAddonLine) => void;
  addonSlotTargeting: AddonSlotTargeting;
  onAddonSelectAllSlots: (addonId: number, checked: boolean, allSlotKeys: string[]) => void;
  onToggleAddonSlot: (addonId: number, slotKey: string, allSlotKeys: string[]) => void;
  pickedSlots: PickedSlot[];
  formatPrice: (amount: number, currency: string) => string;
  omitPanelHeading?: boolean;
};

const ADDON_MAX_QTY = 50;

function QtyStepperInline({
  qty,
  addonId,
  addonName,
  onSet,
}: {
  qty: number;
  addonId: number;
  addonName: string;
  onSet: (id: number, qty: number) => void;
}) {
  return (
    <span className="cb-addon-qty" role="group" aria-label={`Quantity for ${addonName}`}>
      <button
        type="button"
        className="cb-addon-qty-btn"
        aria-label="Decrease"
        onClick={(e) => { e.stopPropagation(); onSet(addonId, qty - 1); }}
      >
        −
      </button>
      <span className="cb-addon-qty-val" aria-live="polite">{qty}</span>
      <button
        type="button"
        className="cb-addon-qty-btn"
        aria-label="Increase"
        disabled={qty >= ADDON_MAX_QTY}
        onClick={(e) => { e.stopPropagation(); onSet(addonId, qty + 1); }}
      >
        +
      </button>
    </span>
  );
}

function ReservationAddonRow({
  addon,
  selected,
  qty,
  onToggle,
  onSetQty,
  formatPrice,
}: {
  addon: PackageAddonLine;
  selected: boolean;
  qty: number;
  onToggle: () => void;
  onSetQty?: (id: number, qty: number) => void;
  formatPrice: (amount: number, currency: string) => string;
}) {
  const resolved = resolveAddonDisplayPrice(addon);
  return (
    <div className={`cb-addon-row ${selected ? "cb-addon-row--selected" : ""}`}>
      <label className="cb-addon-row-label">
        <input
          type="checkbox"
          className="cb-addon-row-checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={addon.name}
        />
        <span className="cb-addon-row-name">{addon.name}</span>
      </label>
      <span className="cb-addon-row-price">
        {resolved
          ? `+${formatPrice(resolved.price, resolved.currency)}${addonPriceSuffixForLevel(addon.level)}`
          : null}
      </span>
      {selected && onSetQty ? (
        <QtyStepperInline qty={qty} addonId={addon.id} addonName={addon.name} onSet={onSetQty} />
      ) : null}
    </div>
  );
}

function SlotAddonRow({
  addon,
  selected,
  allSlotKeys,
  slotKeySet,
  pickedSlots,
  targeting,
  onToggle,
  onToggleSlot,
  onSelectAllSlots,
  formatPrice,
  ta,
}: {
  addon: PackageAddonLine;
  selected: boolean;
  allSlotKeys: string[];
  slotKeySet: Set<string>;
  pickedSlots: PickedSlot[];
  targeting: AddonSlotTargeting;
  onToggle: () => void;
  onToggleSlot: (addonId: number, slotKey: string, allKeys: string[]) => void;
  onSelectAllSlots: (addonId: number, checked: boolean, allKeys: string[]) => void;
  formatPrice: (amount: number, currency: string) => string;
  ta: ReturnType<typeof useTranslations>;
}) {
  const resolved = resolveAddonDisplayPrice(addon);
  const eff = getEffectiveAddonSlotKeys(targeting[addon.id], slotKeySet);
  const allSelected =
    eff != null && eff.size > 0 && pickedSlots.length > 0 && pickedSlots.every((p) => eff.has(p.key));

  return (
    <div className="cb-addon-row-wrap">
      <div className={`cb-addon-row ${selected ? "cb-addon-row--selected" : ""}`}>
        <label className="cb-addon-row-label">
          <input
            type="checkbox"
            className="cb-addon-row-checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={addon.name}
          />
          <span className="cb-addon-row-name">{addon.name}</span>
        </label>
        <span className="cb-addon-row-price">
          {resolved
            ? `+${formatPrice(resolved.price, resolved.currency)}${addonPriceSuffixForLevel(addon.level)}`
            : null}
        </span>
      </div>

      {selected && pickedSlots.length > 0 ? (
        <div className="cb-addon-slot-rows" role="group" aria-label={ta("slotsForAddonAria", { name: addon.name })}>
          <label className="cb-addon-slot-all-label">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAllSlots(addon.id, e.target.checked, allSlotKeys)}
            />
            <span>{ta("selectAllSlots")}</span>
          </label>
          {pickedSlots.map((p, idx) => {
            const on = eff?.has(p.key) ?? false;
            return (
              <label key={`${p.key}#${idx}`} className={`cb-addon-slot-row ${on ? "cb-addon-slot-row--on" : ""}`}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggleSlot(addon.id, p.key, allSlotKeys)}
                />
                <span className="cb-addon-slot-row-time">{formatPickedSlotTimeRange(p)}</span>
                <span className="cb-addon-slot-row-resource">{p.resourceName}</span>
              </label>
            );
          })}
        </div>
      ) : selected && pickedSlots.length === 0 ? (
        <p className="cb-addon-slot-hint">{ta("selectSlotsFirst")}</p>
      ) : null}
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
  onSetAddonQty,
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

  const byLevel = {
    reservation: visibleAddons.filter((a) => a.level === "reservation"),
    slot: visibleAddons.filter((a) => a.level === "slot"),
    hour: visibleAddons.filter((a) => a.level === "hour"),
  };

  const hasAny =
    byLevel.reservation.length > 0 || byLevel.slot.length > 0 || byLevel.hour.length > 0;

  if (!hasAny) return null;

  const renderGroup = (
    label: string,
    items: PackageAddonLine[],
    isSlotLevel: boolean,
  ) => (
    <div className="cb-addon-group" key={label}>
      <h4 className="cb-addon-group-title">{label}</h4>
      <div className="cb-addon-list">
        {items.map((a) => {
          const sel = selectedAddonIds.has(a.id);
          const qty = sel ? Math.max(1, addonQuantities?.get(a.id) ?? 1) : 1;
          if (!isSlotLevel) {
            return (
              <ReservationAddonRow
                key={a.id}
                addon={a}
                selected={sel}
                qty={qty}
                onToggle={() => onToggleAddon(a)}
                onSetQty={onSetAddonQty}
                formatPrice={formatPrice}
              />
            );
          }
          return (
            <SlotAddonRow
              key={a.id}
              addon={a}
              selected={sel}
              allSlotKeys={allSlotKeys}
              slotKeySet={slotKeySet}
              pickedSlots={pickedSlots}
              targeting={addonSlotTargeting}
              onToggle={() => onToggleAddon(a)}
              onToggleSlot={onToggleAddonSlot}
              onSelectAllSlots={onAddonSelectAllSlots}
              formatPrice={formatPrice}
              ta={ta}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <section
      className="cb-addon-panel text-left"
      aria-label={omitPanelHeading ? ta("panelHeading") : undefined}
      {...(omitPanelHeading ? {} : { "aria-labelledby": "addons-heading" })}
    >
      {omitPanelHeading ? null : (
        <h3 id="addons-heading" className="cb-addon-panel-title">
          {ta("panelHeading")}
        </h3>
      )}

      {byLevel.reservation.length > 0
        ? renderGroup(ta("withReservation"), byLevel.reservation, false)
        : null}
      {byLevel.slot.length > 0
        ? renderGroup(ta("perSlot"), byLevel.slot, true)
        : null}
      {byLevel.hour.length > 0
        ? renderGroup(ta("perHour"), byLevel.hour, true)
        : null}

      {hasMoreAddons ? (
        <button type="button" className="cb-addon-more" onClick={onToggleExpand}>
          {addonsExpanded ? ta("showFewer") : ta("viewMore", { count: moreCount })}
        </button>
      ) : null}
    </section>
  );
}
