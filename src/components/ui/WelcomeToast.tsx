"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onDismiss: () => void;
  /** ms */
  duration?: number;
};

export function WelcomeToast({ open, title, subtitle, onDismiss, duration = 3000 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, duration);
    return () => window.clearTimeout(t);
  }, [open, duration, onDismiss]);

  if (!open && !visible) return null;

  return (
    <div
      className={`cb-welcome-toast ${visible ? "cb-welcome-toast--in" : "cb-welcome-toast--out"}`}
      role="status"
      aria-live="polite"
    >
      <div className="cb-welcome-toast-icon" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path
            d="M8 12l2.5 2.5L16 9"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="cb-welcome-toast-text">
        <p className="cb-welcome-toast-title">{title}</p>
        {subtitle ? <p className="cb-welcome-toast-sub">{subtitle}</p> : null}
      </div>
    </div>
  );
}
