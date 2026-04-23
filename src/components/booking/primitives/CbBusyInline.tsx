"use client";

import type { ReactNode } from "react";

/** Small spinner using `currentColor`; pair with `.consumer-booking .cb-btn-inline-spinner` in globals. */
export function CbButtonSpinner({ className = "" }: { className?: string }) {
  return <span className={`cb-btn-inline-spinner ${className}`.trim()} aria-hidden />;
}

export function CbBusyInline({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <span className="cb-btn-busy-content">
      {busy ? <CbButtonSpinner /> : null}
      {children}
    </span>
  );
}
