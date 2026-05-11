"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBookingAppearanceClass } from "@/hooks/useBookingAppearanceClass";
import { RightDrawer } from "@/components/ui/RightDrawer";
import type { BookingPartyMember } from "@/lib/booking-party-options";
import type { CreateFamilyMemberGender, CreateFamilyMemberPayload } from "@/lib/online-booking-user-api";
import type { BondUserDto } from "@/lib/bond-user-types";

type FamilyFormState = {
  firstName: string;
  lastName: string;
  gender: CreateFamilyMemberGender | "";
  birthDate: string;
  email: string;
  phoneNumber: string;
};

const EMPTY_FAMILY_FORM: FamilyFormState = {
  firstName: "",
  lastName: "",
  gender: "",
  birthDate: "",
  email: "",
  phoneNumber: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  members: BookingPartyMember[];
  value: number | null;
  onConfirm: (userId: number, options?: { keepSlots?: boolean }) => void;
  onCreateFamilyMember?: (payload: CreateFamilyMemberPayload) => Promise<BondUserDto>;
  /** True while `GET .../user?expand=family` is in flight after login */
  profileLoading?: boolean;
};

export function BookingForDrawer({
  open,
  onClose,
  members,
  value,
  onConfirm,
  onCreateFamilyMember,
  profileLoading = false,
}: Props) {
  const tb = useTranslations("booking");
  const appearanceClass = useBookingAppearanceClass();
  const [sel, setSel] = useState<number | null>(value);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [familyForm, setFamilyForm] = useState<FamilyFormState>(EMPTY_FAMILY_FORM);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [familySubmitting, setFamilySubmitting] = useState(false);
  useEffect(() => {
    if (open) {
      setSel(value);
      setShowAddFamily(false);
      setFamilyForm(EMPTY_FAMILY_FORM);
      setFamilyError(null);
      setFamilySubmitting(false);
    }
  }, [open, value]);

  const canSubmit = !profileLoading && sel != null && members.some((m) => m.id === sel);
  const canCreateFamilyMember =
    onCreateFamilyMember != null &&
    familyForm.firstName.trim().length > 0 &&
    familyForm.lastName.trim().length > 0 &&
    familyForm.gender !== "" &&
    familyForm.birthDate.trim().length > 0 &&
    !familySubmitting;

  const updateFamilyForm = (key: keyof FamilyFormState, value: string) => {
    setFamilyForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitFamilyMember = async () => {
    if (!canCreateFamilyMember || onCreateFamilyMember == null) return;
    if (familyForm.gender === "") return;
    const payload: CreateFamilyMemberPayload = {
      firstName: familyForm.firstName.trim(),
      lastName: familyForm.lastName.trim(),
      birthDate: familyForm.birthDate,
      gender: familyForm.gender,
      ...(familyForm.email.trim() ? { email: familyForm.email.trim() } : {}),
      ...(familyForm.phoneNumber.trim() ? { phoneNumber: familyForm.phoneNumber.trim() } : {}),
    };
    setFamilySubmitting(true);
    setFamilyError(null);
    try {
      const created = await onCreateFamilyMember(payload);
      const id = typeof created.id === "number" && Number.isFinite(created.id) ? created.id : null;
      if (id != null) {
        setSel(id);
        onConfirm(id, { keepSlots: true });
        onClose();
      }
      setFamilyForm(EMPTY_FAMILY_FORM);
      setShowAddFamily(false);
    } catch (err) {
      setFamilyError(err instanceof Error ? err.message : "Could not add family member.");
    } finally {
      setFamilySubmitting(false);
    }
  };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      hideTitle
      ariaLabel={showAddFamily ? tb("addFamilyMemberTitle") : tb("bookingForDrawerAria")}
      panelClassName={`consumer-booking ${appearanceClass} cb-booking-for-drawer`.trim()}
    >
      {showAddFamily ? (
        <form
          className="cb-family-placeholder"
          onSubmit={(e) => {
            e.preventDefault();
            void submitFamilyMember();
          }}
        >
          <div className="cb-family-placeholder-head">
            <div className="cb-family-placeholder-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 20c1.3-3.2 4-5 8-5s6.7 1.8 8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="cb-family-placeholder-title">{tb("addFamilyMemberTitle")}</h2>
            <p className="cb-family-placeholder-sub">{tb("addFamilyMemberSubtitle")}</p>
          </div>
          <div className="cb-family-placeholder-fields">
            <FamilyInput
              label={tb("firstName")}
              value={familyForm.firstName}
              onChange={(value) => updateFamilyForm("firstName", value)}
              placeholder={tb("enterName")}
              required
            />
            <FamilyInput
              label={tb("lastName")}
              value={familyForm.lastName}
              onChange={(value) => updateFamilyForm("lastName", value)}
              placeholder={tb("enterName")}
              required
            />
            <FamilySelect
              label={tb("gender")}
              value={familyForm.gender}
              onChange={(value) => updateFamilyForm("gender", value)}
              placeholder={tb("selectGender")}
              required
            />
            <FamilyInput
              label={tb("dateOfBirth")}
              value={familyForm.birthDate}
              onChange={(value) => updateFamilyForm("birthDate", value)}
              placeholder={tb("datePlaceholder")}
              type="date"
              required
            />
            <FamilyInput
              label={tb("email")}
              value={familyForm.email}
              onChange={(value) => updateFamilyForm("email", value)}
              placeholder={tb("enterEmail")}
              type="email"
            />
            <FamilyInput
              label={tb("phoneNumber")}
              value={familyForm.phoneNumber}
              onChange={(value) => updateFamilyForm("phoneNumber", value)}
              placeholder={tb("enterPhoneNumber")}
              type="tel"
            />
          </div>
          {familyError ? <p className="cb-alert cb-alert--error text-sm">{familyError}</p> : null}
          <div className="cb-family-placeholder-actions">
            <button
              type="button"
              className="cb-family-placeholder-btn cb-family-placeholder-btn--outline"
              onClick={() => {
                setShowAddFamily(false);
                setFamilyForm(EMPTY_FAMILY_FORM);
                setFamilyError(null);
              }}
            >
              {tb("cancel")}
            </button>
            <button type="submit" className="cb-family-placeholder-btn cb-family-placeholder-btn--primary" disabled={!canCreateFamilyMember}>
              {familySubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      ) : (
      <>
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
        <h2 className="cb-booking-for-title">{tb("bookingForTitle")}</h2>
        <p className="cb-booking-for-sub">{tb("bookingForSubtitle")}</p>
      </div>
      <form
        className="cb-booking-for-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (sel != null) onConfirm(sel);
          onClose();
        }}
      >
        <div className="cb-booking-for-list" role="radiogroup" aria-label={tb("bookingForRadiogroup")}>
          {profileLoading && members.length === 0 ? (
            <p className="cb-muted py-4 text-center text-sm" role="status">
              {tb("loadingFamily")}
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
                <span className="cb-booking-for-avatar">
                  {m.photoUrl ? (
                    <img
                      className="cb-booking-for-avatar-img"
                      src={m.photoUrl}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="cb-booking-for-avatar-fallback" aria-hidden>
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
                  )}
                </span>
                <span className="cb-booking-for-card-main">
                  <span className="cb-booking-for-name-row">
                    <span className="cb-booking-for-name">{m.label}</span>
                    {m.hasQualifyingMembershipForProduct ? (
                      <span
                        className="cb-booking-for-tag cb-booking-for-tag--member-access"
                        title={tb("memberAccessTitle")}
                      >
                        {tb("memberAccess")}
                      </span>
                    ) : null}
                    {m.needsMembershipForProduct ? (
                      <span
                        className="cb-booking-for-tag cb-booking-for-tag--membership"
                        title={tb("needsMembershipTitle")}
                      >
                        {tb("needsMembership")}
                      </span>
                    ) : null}
                  </span>
                  {m.demographicsLine ? (
                    <span className="cb-booking-for-demo">{m.demographicsLine}</span>
                  ) : null}
                  {m.relationship ? (
                    <span className="cb-booking-for-rel cb-booking-for-rel-row">
                      <svg className="cb-booking-for-rel-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M6 19c1.5-3 4-5 6-5s4.5 2 6 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      {m.relationship}
                    </span>
                  ) : null}
                </span>
                {active ? (
                  <span className="cb-booking-for-check" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="9" fill="var(--cb-primary)"/>
                      <path d="M5.5 9l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="cb-booking-for-add"
          onClick={() => setShowAddFamily(true)}
        >
          <span className="cb-booking-for-add-icon" aria-hidden>
            +
          </span>
          {tb("addFamilyMember")}
        </button>
        <button type="submit" className="cb-btn-primary mt-6 w-full" disabled={!canSubmit}>
          {tb("continue")}
        </button>
      </form>
      </>
      )}
    </RightDrawer>
  );
}

function FamilyInput({
  label,
  placeholder,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "date" | "email" | "tel";
}) {
  return (
    <label className="cb-family-placeholder-field">
      <span className="cb-family-placeholder-label">
        {label}
        {required ? <span className="cb-family-placeholder-required"> *</span> : null}
      </span>
      <input
        className="cb-family-placeholder-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

function FamilySelect({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: CreateFamilyMemberGender | "") => void;
  required?: boolean;
}) {
  return (
    <label className="cb-family-placeholder-field">
      <span className="cb-family-placeholder-label">
        {label}
        {required ? <span className="cb-family-placeholder-required"> *</span> : null}
      </span>
      <select
        className="cb-family-placeholder-input"
        value={value}
        onChange={(e) => onChange(e.target.value as CreateFamilyMemberGender | "")}
        required={required}
      >
        <option value="">{placeholder}</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Other</option>
      </select>
    </label>
  );
}
