"use client";

import type { NormalizedQuestion } from "@/lib/questionnaire-parse";

type Props = {
  q: NormalizedQuestion;
  value: string;
  onChange: (v: string) => void;
  namePrefix: string;
};

export function CheckoutQuestionField({ q, value, onChange, namePrefix }: Props) {
  const id = `${namePrefix}-${q.id}`;
  const required = q.mandatory;

  if (q.kind === "boolean") {
    return (
      <div className="cb-checkout-field">
        <label className="cb-checkout-field-label flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === "true" || value === "1"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          />
          <span>
            {q.label}
            {required ? <span className="text-red-500"> *</span> : null}
          </span>
        </label>
      </div>
    );
  }

  if (q.kind === "date") {
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="text-red-500"> *</span> : null}
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
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
        <input
          id={id}
          type="number"
          className="cb-input w-full"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  if (q.kind === "select" && q.options.length > 0) {
    return (
      <label className="cb-checkout-field" htmlFor={id}>
        <span className="cb-checkout-field-label">
          {q.label}
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
        <select
          id={id}
          className="cb-input w-full"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
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
        <legend className="cb-checkout-field-label mb-2">
          {q.label}
          {required ? <span className="text-red-500"> *</span> : null}
        </legend>
        <div className="flex flex-col gap-2">
          {q.options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 text-sm">
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

  return (
    <label className="cb-checkout-field" htmlFor={id}>
      <span className="cb-checkout-field-label">
        {q.label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <input
        id={id}
        type="text"
        className="cb-input w-full"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
