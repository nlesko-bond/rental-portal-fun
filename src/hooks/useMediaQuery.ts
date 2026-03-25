"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: MediaQueryList, onChange: () => void): () => void {
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** SSR-safe matchMedia — `getServerSnapshot` is false until hydrated. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      return subscribe(mq, onChange);
    },
    () => (typeof window === "undefined" ? false : window.matchMedia(query).matches),
    () => false
  );
}
