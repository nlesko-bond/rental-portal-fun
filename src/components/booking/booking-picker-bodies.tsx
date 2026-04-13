"use client";

import { formatActivityLabel } from "@/lib/booking-activity-display";
import { plainAddonDescription } from "@/lib/product-package-addons";
import type { ExtendedFacilityDto, ReservationProductCategoryDto } from "@/types/online-booking";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        fill="currentColor"
      />
    </svg>
  );
}

export function activityEmoji(activity: string): string {
  const a = activity.toLowerCase();
  if (a === "football" || (a.includes("football") && a.includes("american"))) return "🏈";
  if (a.includes("soccer")) return "⚽";
  if (a.includes("basketball")) return "🏀";
  if (a.includes("tennis")) return "🎾";
  if (a.includes("volleyball")) return "🏐";
  if (a.includes("baseball") || a.includes("softball")) return "⚾";
  if (a.includes("pickle")) return "🏓";
  if (a.includes("futsal")) return "⚽";
  if (a.includes("rugby")) return "🏉";
  if (a.includes("hockey") || a.includes("ice")) return "🏒";
  return "🏟️";
}

type FacilityPickerProps = {
  facilities: ExtendedFacilityDto[];
  selectedId: number;
  onSelect: (id: number) => void;
  onClose: () => void;
};

export function FacilityPickerBody({ facilities, selectedId, onSelect, onClose }: FacilityPickerProps) {
  const tb = useTranslations("booking");
  return (
    <div className="flex flex-col gap-2">
      {facilities.map((f) => {
        const selected = f.id === selectedId;
        return (
          <button
            key={f.id}
            type="button"
            className={`cb-modal-row ${selected ? "cb-modal-row--selected" : ""}`}
            onClick={() => {
              onSelect(f.id);
              onClose();
            }}
          >
            <div
              className={`cb-modal-row-icon ${selected ? "cb-modal-row-icon--selected" : "cb-modal-row-icon--muted"}`}
            >
              <IconPin className={selected ? "text-white" : "text-[var(--cb-text-muted)]"} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="font-bold text-[var(--cb-text)]">{f.name}</div>
              <div className="text-sm cb-muted">{f.timezone ?? tb("facilityTimezoneFallback")}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

type CategoryPickerProps = {
  categories: ReservationProductCategoryDto[];
  selectedId: number;
  onSelect: (id: number) => void;
  onClose: () => void;
};

export function CategoryPickerBody({ categories, selectedId, onSelect, onClose }: CategoryPickerProps) {
  const tb = useTranslations("booking");
  function categorySubtitle(c: ReservationProductCategoryDto): string {
    const plain = plainAddonDescription(c.description?.trim());
    if (plain) return plain;
    const n = (c.name ?? "").toLowerCase();
    if (n.includes("rental")) return tb("categoryHintRental");
    if (n.includes("lesson")) return tb("categoryHintLesson");
    if (n.includes("part") || n.includes("event")) return tb("categoryHintEvent");
    return tb("categoryHintDefault");
  }
  return (
    <div className="flex flex-col gap-2">
      {categories.map((c) => {
        const selected = c.id === selectedId;
        return (
          <button
            key={c.id}
            type="button"
            className={`cb-modal-row ${selected ? "cb-modal-row--selected" : ""}`}
            onClick={() => {
              onSelect(c.id);
              onClose();
            }}
          >
            <div
              className={`cb-modal-row-icon ${selected ? "cb-modal-row-icon--accent" : "cb-modal-row-icon--muted"}`}
            >
              <IconCalendar className={selected ? "text-white" : "text-[var(--cb-text-muted)]"} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="font-bold text-[var(--cb-text)]">{c.name ?? `Category ${c.id}`}</div>
              <div className="text-sm cb-muted">{categorySubtitle(c)}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

type ActivityPickerProps = {
  activities: string[];
  selected: string;
  onSelect: (a: string) => void;
  onClose: () => void;
};

export function ActivityPickerBody({ activities, selected, onSelect, onClose }: ActivityPickerProps) {
  const tb = useTranslations("booking");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return activities;
    return activities.filter((a) => a.toLowerCase().includes(s));
  }, [activities, q]);

  return (
    <div>
      <div className="relative mb-3">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cb-text-faint)]">
          <IconSearch />
        </span>
        <input
          type="search"
          className="cb-activity-search"
          placeholder={tb("searchSportsPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={tb("searchActivitiesAria")}
        />
      </div>
      <div className="cb-activity-grid">
        {filtered.map((a) => {
          const isSel = a === selected;
          return (
            <button
              key={a}
              type="button"
              className={`cb-activity-cell ${isSel ? "cb-activity-cell--selected" : ""}`}
              onClick={() => {
                onSelect(a);
                onClose();
              }}
            >
              <div className={`cb-activity-cell-icon ${isSel ? "cb-activity-cell-icon--selected" : ""}`}>
                <span className="text-2xl" aria-hidden>
                  {activityEmoji(a)}
                </span>
              </div>
              <span className={`mt-2 text-center text-sm font-semibold ${isSel ? "text-[var(--cb-primary)]" : "text-[var(--cb-text)]"}`}>
                {formatActivityLabel(a)}
              </span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="cb-muted py-6 text-center text-sm">{tb("activityNoMatches")}</p>}
    </div>
  );
}

type ListPickerProps<T extends string | number> = {
  items: { value: T; label: string }[];
  selected: T | null;
  onSelect: (v: T) => void;
  onClose: () => void;
};

export function ListPickerBody<T extends string | number>({
  items,
  selected,
  onSelect,
  onClose,
}: ListPickerProps<T>) {
  if (items.length === 0) {
    return <p className="cb-muted py-8 text-center text-sm">Nothing to choose yet.</p>;
  }
  return (
    <div className="flex max-h-[min(50vh,420px)] flex-col gap-2 overflow-y-auto pr-1">
      {items.map((item) => {
        const isSel = item.value === selected;
        return (
          <button
            key={String(item.value)}
            type="button"
            className={`cb-modal-row !gap-3 ${isSel ? "cb-modal-row--selected" : ""}`}
            onClick={() => {
              onSelect(item.value);
              onClose();
            }}
          >
            <span className="font-semibold text-[var(--cb-text)]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
