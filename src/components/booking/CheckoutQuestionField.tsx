"use client";

import DOMPurify from "dompurify";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NormalizedQuestion } from "@/lib/questionnaire-parse";

type Props = {
  q: NormalizedQuestion;
  value: string;
  onChange: (v: string) => void;
  namePrefix: string;
};

function WaiverBlock({
  id,
  label,
  mandatory,
  htmlContent,
  value,
  onChange,
}: {
  id: string;
  label: string;
  mandatory: boolean;
  htmlContent: string | undefined;
  value: string;
  onChange: (v: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canAck, setCanAck] = useState(false);

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

  return (
    <div className="cb-q-waiver">
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
            // eslint-disable-next-line react/no-danger -- sanitized via DOMPurify
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
          {!canAck ? (
            <p className="cb-q-waiver-hint">Scroll to the bottom to acknowledge.</p>
          ) : null}
        </div>
      ) : (
        <p className="cb-q-waiver-fallback cb-muted text-sm">Please confirm the waiver for this booking.</p>
      )}
      <label className="cb-q-waiver-ack mt-3 flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          id={id}
          className="mt-1"
          disabled={Boolean(safeHtml) && !canAck}
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        />
        <span className="text-sm leading-snug text-[var(--cb-text)]">
          I have read and agree to the terms above
          {mandatory ? <span className="cb-q-req"> *</span> : null}
        </span>
      </label>
    </div>
  );
}

export function CheckoutQuestionField({ q, value, onChange, namePrefix }: Props) {
  const id = `${namePrefix}-${q.id}`;
  const required = q.mandatory;

  if (q.kind === "waiver") {
    return (
      <div className="cb-checkout-field cb-checkout-field--waiver">
        <WaiverBlock
          id={id}
          label={q.label}
          mandatory={required}
          htmlContent={q.htmlContent}
          value={value}
          onChange={onChange}
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
            <span>Yes</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name={id}
              checked={value === "false"}
              onChange={() => onChange("false")}
            />
            <span>No</span>
          </label>
        </div>
      </fieldset>
    );
  }

  if (q.kind === "email") {
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </span>
        <input
          id={id}
          type="email"
          autoComplete="email"
          className="cb-input w-full"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (q.kind === "tel") {
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </span>
        <input
          id={id}
          type="tel"
          autoComplete="tel"
          className="cb-input w-full"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (q.kind === "address") {
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </span>
        <textarea
          id={id}
          className="cb-input cb-input-textarea min-h-[5rem] w-full resize-y"
          value={value}
          required={required}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (q.kind === "date") {
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </span>
        <input
          id={id}
          type="date"
          className="cb-input w-full"
          value={value.slice(0, 10)}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (q.kind === "number") {
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="cb-q-req"> *</span> : null}
        </span>
        <input
          id={id}
          type="number"
          className="cb-input w-full"
          value={value}
          required={required}
          min={q.numericMin}
          max={q.numericMax}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (q.kind === "select" && q.options.length > 0) {
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
        <p className="cb-q-helper mb-2 text-xs text-[var(--cb-text-muted)]">Pick all that apply.</p>
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
          <span className="text-center text-sm text-[var(--cb-text)]">Choose a file</span>
          <span className="text-center text-xs text-[var(--cb-text-muted)]">Accepts JPG, PNG only</span>
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
        {value ? <p className="cb-q-file-name mt-1 text-sm text-[var(--cb-text-muted)]">Selected: {value}</p> : null}
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
