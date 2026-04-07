"use client";

import { useEffect, useState } from "react";
import { useBookingAppearanceClass } from "@/hooks/useBookingAppearanceClass";
import { RightDrawer } from "@/components/ui/RightDrawer";
import type { BookingPartyMember } from "@/lib/booking-party-options";

type Props = {
  open: boolean;
  onClose: () => void;
  members: BookingPartyMember[];
  value: number | null;
  onConfirm: (userId: number) => void;
  /** True while `GET .../user?expand=family` is in flight after login */
  profileLoading?: boolean;
};

function MemberBadge({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const tier =
    lower.includes("gold") || label === "Gold"
      ? "cb-member-badge--gold"
      : lower.includes("silver") || label === "Silver"
        ? "cb-member-badge--silver"
        : lower.includes("bronze") || label === "Bronze"
          ? "cb-member-badge--bronze"
          : "cb-member-badge--pass";
  return <span className={`cb-member-badge ${tier}`}>{label}</span>;
}

export function BookingForDrawer({
  open,
  onClose,
  members,
  value,
  onConfirm,
  profileLoading = false,
}: Props) {
  const appearanceClass = useBookingAppearanceClass();
  const [sel, setSel] = useState<number | null>(value);
  useEffect(() => {
    if (open) setSel(value);
  }, [open, value]);

  const canSubmit = !profileLoading && sel != null && members.some((m) => m.id === sel);

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      hideTitle
      ariaLabel="Who is this booking for?"
      panelClassName={`consumer-booking ${appearanceClass} cb-booking-for-drawer`.trim()}
    >
      <div className="cb-booking-for-head">
        <div className="cb-booking-for-icon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="9" r="3" stroke="var(--cb-primary)" strokeWidth="1.75" />
            <circle cx="16" cy="9" r="2.5" stroke="var(--cb-primary)" strokeWidth="1.5" />
            <path
              d="M4 20c1.2-3 3.8-5 8-5s6.8 2 8 5"
              stroke="var(--cb-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="cb-booking-for-title">Who is this booking for?</h2>
        <p className="cb-booking-for-sub">
          You may select yourself or a family member. Pricing, benefits, and available options may vary for each person.
        </p>
      </div>
      <form
        className="cb-booking-for-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (sel != null) onConfirm(sel);
          onClose();
        }}
      >
        <div className="cb-booking-for-list" role="radiogroup" aria-label="Booking for">
          {profileLoading && members.length === 0 ? (
            <p className="cb-muted py-4 text-center text-sm" role="status">
              Loading your family…
            </p>
          ) : null}
          {members.map((m) => {
            const active = sel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={`cb-booking-for-card ${active ? "cb-booking-for-card--active" : ""}`}
                onClick={() => setSel(m.id)}
                role="radio"
                aria-checked={active}
              >
                <span className="cb-booking-for-avatar" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M6 19c1.2-2.8 3.6-4.5 6-4.5s4.8 1.7 6 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="cb-booking-for-card-main">
                  <span className="cb-booking-for-name-row">
                    <span className="cb-booking-for-name">{m.label}</span>
                    {m.needsMembershipHint ? (
                      <span
                        className="cb-booking-for-tag cb-booking-for-tag--membership"
                        title="This person still needs a qualifying membership for this product. You can add it at checkout."
                      >
                        Membership
                      </span>
                    ) : null}
                  </span>
                  {m.relationship ? <span className="cb-booking-for-rel">{m.relationship}</span> : null}
                </span>
                {m.badgeLabel ? <MemberBadge label={m.badgeLabel} /> : null}
                {active ? (
                  <span className="cb-booking-for-check" aria-hidden>
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="cb-booking-for-add"
          onClick={() => {
            /* Bond account / family management is outside this portal */
          }}
        >
          <span className="cb-booking-for-add-icon" aria-hidden>
            +
          </span>
          Add a Family Member
        </button>
        <button
          type="submit"
          className="cb-btn-primary mt-6 w-full"
          disabled={!canSubmit}
        >
          Continue
        </button>
      </form>
    </RightDrawer>
  );
}
