"use client";

import { useEffect, type ReactNode } from "react";

type ModalShellProps = {
  open: boolean;
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  /** Hide the blue title row (e.g. date picker supplies its own header). */
  hideTitle?: boolean;
  /** Used when `hideTitle` — dialog accessible name. */
  ariaLabel?: string;
  panelClassName?: string;
  /**
   * `datepicker`: close control sits in its own top row so it never covers month navigation.
   */
  closeLayout?: "default" | "datepicker";
};

export function ModalShell({
  open,
  title,
  titleIcon,
  children,
  onClose,
  hideTitle,
  ariaLabel,
  panelClassName,
  closeLayout = "default",
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cb-modal-root">
      <button
        type="button"
        className="cb-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={`cb-modal-panel ${panelClassName ?? ""}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={hideTitle ? ariaLabel ?? title : undefined}
        aria-labelledby={hideTitle ? undefined : "cb-modal-title"}
        onClick={(e) => e.stopPropagation()}
      >
        {closeLayout === "datepicker" ? (
          <div className="cb-modal-dp-toolbar">
            <button type="button" className="cb-modal-close cb-modal-close--datepicker" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        ) : (
          <button type="button" className="cb-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        {hideTitle ? null : (
          <h2 id="cb-modal-title" className="cb-modal-title">
            {titleIcon ? <span className="cb-modal-title-icon">{titleIcon}</span> : null}
            {title}
          </h2>
        )}
        <div className={`cb-modal-body ${hideTitle ? "cb-modal-body--flush" : ""}`.trim()}>{children}</div>
      </div>
    </div>
  );
}
