"use client";

import { useTranslations } from "next-intl";
import { getEffectiveAddonSlotKeys } from "@/lib/addon-slot-targeting";
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

export { getEffectiveAddonSlotKeys };

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
  const ta = useTranslations("addons");
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
              {ta("selectedPill")}
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
            <span className="cb-addon-card-hint">{ta("reservationHint")}</span>
          ) : null}
        </button>
        {showSlotUi ? (
          <div className="cb-addon-slot-apply">
            <p className="cb-addon-slot-apply-title">
              {a.level === "hour" ? ta("applyByHour") : ta("applyToSlots")}
            </p>
            <label className="cb-addon-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onAddonSelectAllSlots(a.id, e.target.checked, allSlotKeys)}
              />
              <span>{ta("selectAllSlots")}</span>
            </label>
            <div
              className="cb-addon-slot-chip-grid"
              role="group"
              aria-label={ta("slotsForAddonAria", { name: a.name })}
            >
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
  const mixedAddonLayout = showReservationBlock && showSlotBlock;

  if (!showReservationBlock && !showSlotBlock) return null;

  const reservationBlock = showReservationBlock ? (
    <div className="cb-addon-subsection">
      <h4 className="cb-addon-subsection-title">{ta("withReservation")}</h4>
      <div className="cb-addon-grid">{visReservation.map(renderCard)}</div>
    </div>
  ) : null;

  const slotBlock = showSlotBlock ? (
    <div className="cb-addon-subsection">
      <h4 className="cb-addon-subsection-title">{ta("forSelectedTimes")}</h4>
      <div className="cb-addon-grid">{visSlotHour.map(renderCard)}</div>
    </div>
  ) : null;

  return (
    <section
      className={`cb-addon-panel text-left${mixedAddonLayout ? " cb-addon-panel--mixed" : ""}`}
      aria-labelledby="addons-heading"
    >
      <h3 id="addons-heading" className="cb-addon-panel-title">
        {ta("panelHeading")}
      </h3>

      {mixedAddonLayout ? (
        <div className="cb-addon-panel-columns">
          {reservationBlock}
          {slotBlock}
        </div>
      ) : (
        <>
          {reservationBlock}
          {slotBlock}
        </>
      )}

      {hasMoreAddons ? (
        <button type="button" className="cb-addon-more" onClick={onToggleExpand}>
          {addonsExpanded ? ta("showFewer") : ta("viewMore", { count: moreCount })}
        </button>
      ) : null}
    </section>
  );
}
