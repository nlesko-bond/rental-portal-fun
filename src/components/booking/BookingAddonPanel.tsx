"use client";

import { useTranslations } from "next-intl";
import { getEffectiveAddonSlotKeys } from "@/lib/addon-slot-targeting";
import type { PackageAddonLine } from "@/lib/product-package-addons";
import {
  addonLevelLabel,
  addonPriceSuffixForLevel,
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
  /** Optional parallel qty map; missing id or qty<=0 means not selected. */
  addonQuantities?: ReadonlyMap<number, number>;
  /** When provided, stepper controls qty (1..max). Falls back to toggle-only if omitted. */
  onSetAddonQty?: (addonId: number, qty: number) => void;
  onToggleAddon: (addon: PackageAddonLine) => void;
  addonSlotTargeting: AddonSlotTargeting;
  onAddonSelectAllSlots: (addonId: number, checked: boolean, allSlotKeys: string[]) => void;
  onToggleAddonSlot: (addonId: number, slotKey: string, allSlotKeys: string[]) => void;
  pickedSlots: PickedSlot[];
  formatPrice: (amount: number, currency: string) => string;
  /** When the parent renders its own heading/hero (e.g. checkout drawer). */
  omitPanelHeading?: boolean;
};

const ADDON_MAX_QTY = 50;

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

  const visReservation = visibleAddons.filter((a) => a.level === "reservation");
  const visSlot = visibleAddons.filter((a) => a.level === "slot");
  const visHour = visibleAddons.filter((a) => a.level === "hour");

  const renderCard = (a: PackageAddonLine) => {
    const resolved = resolveAddonDisplayPrice(a);
    const sel = selectedAddonIds.has(a.id);
    const qty = sel ? Math.max(1, addonQuantities?.get(a.id) ?? 1) : 0;
    const eff =
      a.level === "reservation"
        ? null
        : getEffectiveAddonSlotKeys(addonSlotTargeting[a.id], slotKeySet);
    const showSlotUi = sel && (a.level === "slot" || a.level === "hour") && pickedSlots.length > 0;
    const allSelected =
      eff != null && eff.size > 0 && pickedSlots.length > 0 && pickedSlots.every((p) => eff.has(p.key));
    const canStep = sel && typeof onSetAddonQty === "function";

    return (
      <div key={a.id} className="cb-addon-card-wrap cb-addon-card-wrap--chip">
        <div
          className={`cb-addon-card cb-addon-card--chip ${sel ? "cb-addon-card--selected" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={sel}
          onClick={() => {
            if (sel) return;
            onToggleAddon(a);
          }}
          onKeyDown={(e) => {
            if (sel) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleAddon(a);
            }
          }}
        >
          <span className="cb-addon-card-title">{a.name}</span>
          {resolved ? (
            <span className="cb-addon-card-price">
              +{formatPrice(resolved.price, resolved.currency)}
              {addonPriceSuffixForLevel(a.level)}
            </span>
          ) : null}
          {canStep ? (
            <span
              className="cb-addon-card-qty"
              role="group"
              aria-label={`Quantity for ${a.name}`}
            >
              <button
                type="button"
                className="cb-addon-card-qty-btn"
                aria-label="Decrease quantity"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetAddonQty!(a.id, qty - 1);
                }}
              >−</button>
              <span className="cb-addon-card-qty-value" aria-live="polite">{qty}</span>
              <button
                type="button"
                className="cb-addon-card-qty-btn"
                aria-label="Increase quantity"
                disabled={qty >= ADDON_MAX_QTY}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetAddonQty!(a.id, qty + 1);
                }}
              >+</button>
            </span>
          ) : null}
          {sel ? (
            <button
              type="button"
              className="cb-addon-card-deselect"
              aria-label="Remove add-on"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAddon(a);
              }}
            >×</button>
          ) : null}
        </div>
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
              {pickedSlots.map((p, idx) => {
                const on = eff?.has(p.key) ?? false;
                return (
                  <button
                    key={`${p.key}#${idx}`}
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
  const showSlotBlock = visSlot.length > 0 && pickedSlots.length > 0;
  const showHourBlock = visHour.length > 0 && pickedSlots.length > 0;

  if (!showReservationBlock && !showSlotBlock && !showHourBlock) return null;

  const renderLevelRow = (label: string, items: PackageAddonLine[]) => (
    <div className="cb-addon-subsection cb-addon-subsection--rail">
      <h4 className="cb-addon-subsection-title">{label}</h4>
      <div className="cb-addon-rail cb-hide-scrollbar" role="list">
        {items.map(renderCard)}
      </div>
    </div>
  );

  return (
    <section
      className="cb-addon-panel cb-addon-panel--rails text-left"
      aria-label={omitPanelHeading ? ta("panelHeading") : undefined}
      {...(omitPanelHeading ? {} : { "aria-labelledby": "addons-heading" })}
    >
      {omitPanelHeading ? null : (
        <h3 id="addons-heading" className="cb-addon-panel-title">
          {ta("panelHeading")}
        </h3>
      )}

      {showReservationBlock ? renderLevelRow(ta("withReservation"), visReservation) : null}
      {showSlotBlock ? renderLevelRow(ta("perSlot"), visSlot) : null}
      {showHourBlock ? renderLevelRow(ta("perHour"), visHour) : null}

      {hasMoreAddons ? (
        <button type="button" className="cb-addon-more" onClick={onToggleExpand}>
          {addonsExpanded ? ta("showFewer") : ta("viewMore", { count: moreCount })}
        </button>
      ) : null}
    </section>
  );
}
