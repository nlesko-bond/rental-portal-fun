"use client";

import { useSyncExternalStore } from "react";

/**
 * `false` during SSR and the first client pass, then `true` after hydration.
 * Use to avoid SSR/client HTML mismatches for client-only UI (theme tokens, delayed copy).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
