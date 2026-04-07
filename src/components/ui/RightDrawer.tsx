"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Accessible name when title is hidden */
  ariaLabel: string;
  /** Optional visible title row (use hideTitle for custom header inside children) */
  title?: string;
  hideTitle?: boolean;
  /** When set, shows a leading Back control (checkout / multi-step flows). */
  onBack?: () => void;
  children: ReactNode;
  panelClassName?: string;
};

/**
 * Right-edge drawer with backdrop (matches consumer booking mocks: ~40% width on desktop).
 */
export function RightDrawer({
  open,
  onClose,
  ariaLabel,
  title,
  hideTitle,
  onBack,
  children,
  panelClassName,
}: Props) {
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
    <div className="cb-drawer-root">
      <button type="button" className="cb-drawer-backdrop" aria-label="Close panel" onClick={onClose} />
      <aside
        className={`cb-drawer-panel ${panelClassName ?? ""}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={hideTitle ? ariaLabel : undefined}
        aria-labelledby={hideTitle ? undefined : "cb-drawer-title"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`cb-drawer-toolbar${onBack ? " cb-drawer-toolbar--with-back" : ""}`.trim()}>
          {onBack ? (
            <button type="button" className="cb-drawer-back" onClick={onBack} aria-label="Back">
              <span className="cb-drawer-back-icon" aria-hidden>
                ‹
              </span>
            </button>
          ) : (
            <span className="cb-drawer-toolbar-lead" aria-hidden />
          )}
          {hideTitle ? (
            <span className="cb-drawer-toolbar-center" />
          ) : (
            <h2 id="cb-drawer-title" className="cb-drawer-title">
              {title}
            </h2>
          )}
          <button type="button" className="cb-drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="cb-drawer-body">{children}</div>
      </aside>
    </div>
  );
}
