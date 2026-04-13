"use client";

import { useId } from "react";

type Props = {
  /** Short control name for aria-label (e.g. “Cart grouping”). */
  label: string;
  /** Full explanation; exposed to assistive tech via aria-describedby (not only title). */
  description: string;
  className?: string;
};

/**
 * Inline info control: keeps copy out of the main paragraph while staying accessible
 * (description is available to screen readers, not only hover title).
 */
export function CbInfoHint({ label, description, className = "" }: Props) {
  const id = useId();
  return (
    <span className={`cb-info-hint-wrap inline-flex align-middle ${className}`.trim()}>
      <button
        type="button"
        className="cb-info-hint-btn"
        aria-label={label}
        aria-describedby={id}
      >
        <span className="cb-info-hint-glyph" aria-hidden>
          i
        </span>
      </button>
      <span id={id} className="sr-only">
        {description}
      </span>
    </span>
  );
}
