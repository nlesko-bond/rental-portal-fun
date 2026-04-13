"use client";

import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalizedQuestion } from "@/lib/questionnaire-parse";

type Props = {
  q: NormalizedQuestion;
  value: string;
  onChange: (v: string) => void;
  namePrefix: string;
  /** Shown under email/phone/date/address when value matches profile prefill */
  prefilledHint?: boolean;
  /** When set, Bond customer has `waiverSignedDate` — allow acknowledge without forcing scroll-through. */
  profileWaiverSignedDate?: string;
};

function IconEmail({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm2 2 8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 4.5h3.5l1.5 4-2.2 1.3c.8 1.6 2.3 3.1 3.9 3.9l1.3-2.2 4 1.5v3.5a1.5 1.5 0 0 1-1.6 1.5C9.8 18.5 4 12.7 4 5.6A1.5 1.5 0 0 1 5.5 4h1z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPinField({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WaiverBlock({
  id,
  label,
  mandatory,
  htmlContent,
  value,
  onChange,
  profileWaiverSignedDate,
}: {
  id: string;
  label: string;
  mandatory: boolean;
  htmlContent: string | undefined;
  value: string;
  onChange: (v: string) => void;
  profileWaiverSignedDate?: string;
}) {
  const tc = useTranslations("checkout");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canAck, setCanAck] = useState(Boolean(profileWaiverSignedDate));

  const safeHtml = htmlContent ? DOMPurify.sanitize(htmlContent) : "";

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atEnd = scrollHeight <= clientHeight + 8 || scrollTop + clientHeight >= scrollHeight - 12;
    setCanAck(atEnd);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    const ro = new ResizeObserver(() => checkScroll());
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkScroll, safeHtml]);

  useEffect(() => {
    if (profileWaiverSignedDate) setCanAck(true);
  }, [profileWaiverSignedDate]);

  return (
    <div className="cb-q-waiver">
      {profileWaiverSignedDate ? (
        <p className="cb-q-waiver-profile-note" role="status">
          {tc("waiverOnFile", { date: profileWaiverSignedDate })}
        </p>
      ) : null}
      <span className="cb-checkout-field-label">
        {label}
        {mandatory ? <span className="cb-q-req"> *</span> : null}
      </span>
      {safeHtml ? (
        <div className="cb-q-waiver-scroll-wrap">
          <div
            ref={scrollRef}
            className="cb-q-waiver-scroll cb-prose-muted"
            onScroll={checkScroll}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
          {!canAck ? <p className="cb-q-waiver-hint">{tc("waiverScrollHint")}</p> : null}
        </div>
      ) : (
        <p className="cb-q-waiver-fallback cb-muted text-sm">{tc("waiverFallback")}</p>
      )}
      <label className="cb-q-waiver-ack mt-3 flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          id={id}
          className="mt-1"
          disabled={Boolean(safeHtml) && !canAck && !profileWaiverSignedDate}
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        />
        <span className="text-sm leading-snug text-[var(--cb-text)]">
          {tc("waiverAgree")}
          {mandatory ? <span className="cb-q-req"> *</span> : null}
        </span>
      </label>
    </div>
  );
}

export function CheckoutQuestionField({
  q,
  value,
  onChange,
  namePrefix,
  prefilledHint,
  profileWaiverSignedDate,
}: Props) {
  const tc = useTranslations("checkout");
  const id = `${namePrefix}-${q.id}`;
  const required = q.mandatory;

  const hintRow = prefilledHint ? (
    <p className="cb-q-field-hint" role="status">
      {tc("formsPrefillHint")}
    </p>
  ) : null;

  if (q.kind === "waiver" || q.kind === "terms") {
    return (
      <div className="cb-checkout-field cb-checkout-field--waiver">
        <WaiverBlock
          id={id}
          label={q.label}
          mandatory={required}
          htmlContent={q.htmlContent}
          value={value}
          onChange={onChange}
          profileWaiverSignedDate={q.kind === "waiver" ? profileWaiverSignedDate : undefined}
        />
      </div>
    );
  }

  if (q.kind === "boolean" || q.kind === "yesno") {
    return (
      <fieldset className="cb-checkout-field">
        <legend className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </legend>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={id}
              checked={value === "true"}
              onChange={() => onChange("true")}
            />
            <span>{tc("yes")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={id}
              checked={value === "false"}
              onChange={() => onChange("false")}
            />
            <span>{tc("no")}</span>
          </label>
        </div>
      </fieldset>
    );
  }

  if (q.kind === "email") {
    return (
      <div className="cb-checkout-field">
        <div className="cb-q-field-row">
          <span className="cb-q-field-icon" aria-hidden>
            <IconEmail className="text-[var(--cb-primary)]" />
          </span>
          <div className="cb-q-field-main">
            <label className="cb-checkout-field-label flex items-baseline gap-1" htmlFor={id}>
              {q.label}
              {required ? <span className="cb-q-req"> *</span> : null}
            </label>
            <input
              id={id}
              type="email"
              autoComplete="email"
              className="cb-input cb-q-input-enhanced w-full"
              placeholder={tc("emailPlaceholder")}
              value={value}
              required={required}
              onChange={(e) => onChange(e.target.value)}
            />
            {hintRow}
          </div>
        </div>
      </div>
    );
  }

  if (q.kind === "tel") {
    return (
      <div className="cb-checkout-field">
        <div className="cb-q-field-row">
          <span className="cb-q-field-icon" aria-hidden>
            <IconPhone className="text-[var(--cb-primary)]" />
          </span>
          <div className="cb-q-field-main">
            <label className="cb-checkout-field-label flex items-baseline gap-1" htmlFor={id}>
              {q.label}
              {required ? <span className="cb-q-req"> *</span> : null}
            </label>
            <input
              id={id}
              type="tel"
              autoComplete="tel"
              className="cb-input cb-q-input-enhanced w-full"
              placeholder={tc("phonePlaceholder")}
              value={value}
              required={required}
              onChange={(e) => onChange(e.target.value)}
            />
            {hintRow}
          </div>
        </div>
      </div>
    );
  }

  if (q.kind === "address") {
    return (
      <div className="cb-checkout-field">
        <div className="cb-q-field-row">
          <span className="cb-q-field-icon" aria-hidden>
            <IconPinField className="text-[var(--cb-primary)]" />
          </span>
          <div className="cb-q-field-main">
            <label className="cb-checkout-field-label flex items-baseline gap-1" htmlFor={id}>
              {q.label}
              {required ? <span className="cb-q-req"> *</span> : null}
            </label>
            <input
              id={id}
              type="text"
              autoComplete="street-address"
              className="cb-input cb-q-input-enhanced w-full"
              placeholder={tc("addressPlaceholder")}
              value={value}
              required={required}
              onChange={(e) => onChange(e.target.value)}
            />
            {hintRow}
          </div>
        </div>
      </div>
    );
  }

  if (q.kind === "date") {
    return (
      <div className="cb-checkout-field">
        <div className="cb-q-field-row">
          <span className="cb-q-field-icon" aria-hidden>
            <IconCalendar className="text-[var(--cb-primary)]" />
          </span>
          <div className="cb-q-field-main">
            <label className="cb-checkout-field-label flex items-baseline gap-1" htmlFor={id}>
              {q.label}
              {required ? <span className="cb-q-req"> *</span> : null}
            </label>
            <input
              id={id}
              type="date"
              className="cb-input cb-q-input-enhanced w-full"
              value={value.slice(0, 10)}
              required={required}
              onChange={(e) => onChange(e.target.value)}
            />
            {hintRow}
          </div>
        </div>
      </div>
    );
  }

  if (q.kind === "number") {
    const min = q.numericMin;
    const max = q.numericMax;
    const step =
      min != null && max != null && Number.isInteger(min) && Number.isInteger(max) ? 1 : "any";
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </span>
        {min != null && max != null ? (
          <p className="cb-q-helper mb-1 text-xs text-[var(--cb-text-muted)]">
            {tc("numberBetweenHint", { min, max })}
          </p>
        ) : null}
        <input
          id={id}
          type="number"
          className="cb-input w-full"
          value={value}
          required={required}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (q.kind === "select" && q.options.length > 0) {
    const useDropdown =
      q.options.length > 8 || (q.numericMin != null && q.numericMax != null && q.options.length > 0);

    if (useDropdown) {
      return (
        <div className="cb-checkout-field">
          <label className="cb-checkout-field-label" htmlFor={id}>
            {q.label}
            {required ? <span className="cb-q-req"> *</span> : null}
          </label>
          <select
            id={id}
            className="cb-input cb-q-select-dropdown mt-1 w-full"
            value={value}
            required={required}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">{required ? tc("selectChoose") : tc("selectOptional")}</option>
            {q.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <fieldset className="cb-checkout-field">
        <legend className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </legend>
        <div className="cb-q-radio-list flex flex-col gap-2">
          {q.options.map((o) => (
            <label key={o.value} className="cb-q-radio-row flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name={id}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (q.kind === "multiselect" && q.options.length > 0) {
    const selected = (() => {
      try {
        const p = JSON.parse(value || "[]");
        return Array.isArray(p) ? p.map(String) : [];
      } catch {
        return value ? value.split(",").map((s) => s.trim()) : [];
      }
    })();

    return (
      <fieldset className="cb-checkout-field">
        <legend className="cb-checkout-field-label mb-1">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </legend>
        <p className="cb-q-helper mb-2 text-xs text-[var(--cb-text-muted)]">{tc("pickAllThatApply")}</p>
        <div className="flex flex-col gap-2">
          {q.options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(o.value);
                    else next.delete(o.value);
                    onChange(JSON.stringify([...next]));
                  }}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (q.kind === "file") {
    return (
      <div className="cb-checkout-field">
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </span>
        <label className="cb-q-file-drop mt-1 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--cb-border)] bg-[var(--cb-bg-field)] px-4 py-6">
          <span className="text-2xl" aria-hidden>
            ⬆
          </span>
          <span className="text-center text-sm text-[var(--cb-text)]">{tc("chooseFile")}</span>
          <span className="text-center text-xs text-[var(--cb-text-muted)]">{tc("fileAcceptsHint")}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              onChange(f ? f.name : "");
            }}
          />
        </label>
        {value ? (
          <p className="cb-q-file-name mt-1 text-sm text-[var(--cb-text-muted)]">
            {tc("fileSelected", { name: value })}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <label className="cb-checkout-field" htmlFor={id}>
      <span className="cb-checkout-field-label">
        {q.label}
        {required ? <span className="cb-q-req"> *</span> : null}
      </span>
      <input
        id={id}
        type="text"
        className="cb-input w-full"
        value={value}
        required={required}
        maxLength={q.maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
