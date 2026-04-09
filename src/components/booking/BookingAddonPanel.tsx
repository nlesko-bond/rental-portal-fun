"use client";

import type { PackageAddonLine } from "@/lib/product-package-addons";
import {
  addonLevelLabel,
  addonPriceSuffixForLevel,
  plainAddonDescription,
  resolveAddonDisplayPrice,
} from "@/lib/product-package-addons";
import type { PickedSlot } from "@/lib/slot-selection";
import { formatPickedSlotTimeRange } from "./booking-slot-labels";

export type AddonSlotTargeting = Record<number, { all: boolean; keys: string[] }>;

type Props = {
  visibleAddons: PackageAddonLine[];
  hasMoreAddons: boolean;
  addonsExpanded: boolean;
  onToggleExpand: () => void;
  moreCount: number;
  selectedAddonIds: ReadonlySet<number>;
  onToggleAddon: (addon: PackageAddonLine) => void;
  addonSlotTargeting: AddonSlotTargeting;
  onAddonSelectAllSlots: (addonId: number, checked: boolean, allSlotKeys: string[]) => void;
  onToggleAddonSlot: (addonId: number, slotKey: string, allSlotKeys: string[]) => void;
  pickedSlots: PickedSlot[];
  formatPrice: (amount: number, currency: string) => string;
};

function levelTagClass(level: PackageAddonLine["level"]): string {
  if (level === "reservation") return "cb-addon-level-tag cb-addon-level-tag--reservation";
  if (level === "slot") return "cb-addon-level-tag cb-addon-level-tag--slot";
  return "cb-addon-level-tag cb-addon-level-tag--hour";
}

export function getEffectiveAddonSlotKeys(
  spec: { all: boolean; keys: string[] } | undefined,
  allSlotKeys: ReadonlySet<string>
): Set<string> {
  if (!spec) return new Set();
  if (spec.all) return new Set(allSlotKeys);
  return new Set(spec.keys.filter((k) => allSlotKeys.has(k)));
}

export function BookingAddonPanel({
  visibleAddons,
  hasMoreAddons,
  addonsExpanded,
  onToggleExpand,
  moreCount,
  selectedAddonIds,
  onToggleAddon,
  addonSlotTargeting,
  onAddonSelectAllSlots,
  onToggleAddonSlot,
  pickedSlots,
  formatPrice,
}: Props) {
  const allSlotKeys = pickedSlots.map((s) => s.key);
  const slotKeySet = new Set(allSlotKeys);

  const visReservation = visibleAddons.filter((a) => a.level === "reservation");
  const visSlotHour = visibleAddons.filter((a) => a.level === "slot" || a.level === "hour");

  const renderCard = (a: PackageAddonLine) => {
    const resolved = resolveAddonDisplayPrice(a);
    const desc = plainAddonDescription(a.description);
    const sel = selectedAddonIds.has(a.id);
    const eff =
      a.level === "reservation"
        ? null
        : getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
    const showSlotUi = sel && (a.level === "slot" || a.level === "hour") && pickedSlots.length > 0;
    const allSelected =
      eff != null && eff.size > 0 && pickedSlots.length > 0 && pickedSlots.every((p) => eff.has(p.key));

    return (
      <div key={a.id} className="cb-addon-card-wrap">
        <button
          type="button"
          className={`cb-addon-card ${sel ? "cb-addon-card--selected" : ""}`}
          aria-pressed={sel}
          onClick={() => onToggleAddon(a)}
        >
          {sel ? (
            <span className="cb-addon-card-selected-pill" aria-hidden>
              Selected
            </span>
          ) : null}
          <span className={levelTagClass(a.level)}>{addonLevelLabel(a.level)}</span>
          <span className="cb-addon-card-title">{a.name}</span>
          {desc ? <span className="cb-addon-card-desc line-clamp-2">{desc}</span> : null}
          {resolved ? (
            <span className="cb-addon-card-price">
              +{formatPrice(resolved.price, resolved.currency)}
              {addonPriceSuffixForLevel(a.level)}
            </span>
          ) : null}
          {a.level === "reservation" ? (
            <span className="cb-addon-card-hint">
              One charge for this booking (applies to the times you already selected).
            </span>
          ) : null}
        </button>
        {showSlotUi ? (
          <div className="cb-addon-slot-apply">
            <p className="cb-addon-slot-apply-title">
              {a.level === "hour" ? "Apply by time slot (price scales with length)" : "Apply to time slots"}
            </p>
            <label className="cb-addon-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onAddonSelectAllSlots(a.id, e.target.checked, allSlotKeys)}
              />
              <span>Select all time slots</span>
            </label>
            <div className="cb-addon-slot-chip-grid" role="group" aria-label={`Slots for ${a.name}`}>
              {pickedSlots.map((p) => {
                const on = eff?.has(p.key) ?? false;
                return (
                  <button
                    key={p.key}
                    type="button"
                    className={`cb-addon-slot-chip ${on ? "cb-addon-slot-chip--on" : ""}`}
                    onClick={() => onToggleAddonSlot(a.id, p.key, allSlotKeys)}
                  >
                    <span className="cb-addon-slot-chip-time">{formatPickedSlotTimeRange(p)}</span>
                    <span className="cb-addon-slot-chip-resource">{p.resourceName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const showReservationBlock = visReservation.length > 0;
  const showSlotBlock = visSlotHour.length > 0 && pickedSlots.length > 0;

  if (!showReservationBlock && !showSlotBlock) return null;

  return (
    <section className="cb-addon-panel text-left" aria-labelledby="addons-heading">
      <h3 id="addons-heading" className="cb-addon-panel-title">
        Enhance your booking with optional add-ons
      </h3>

      {showReservationBlock ? (
        <div className="cb-addon-subsection">
          <h4 className="cb-addon-subsection-title">With your reservation</h4>
          <div className="cb-addon-grid">{visReservation.map(renderCard)}</div>
        </div>
      ) : null}

      {showSlotBlock ? (
        <div className="cb-addon-subsection">
          <h4 className="cb-addon-subsection-title">For your selected times</h4>
          <div className="cb-addon-grid">{visSlotHour.map(renderCard)}</div>
        </div>
      ) : null}

      {hasMoreAddons ? (
        <button type="button" className="cb-addon-more" onClick={onToggleExpand}>
          {addonsExpanded ? "Show fewer" : `View more (${moreCount} more)`}
        </button>
      ) : null}
    </section>
  );
}
