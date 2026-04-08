/**
 * Ref-counted `document.body` scroll lock so nested overlays (drawer + modal) do not
 * restore a stale inline `overflow` and leave the page stuck non-scrollable or unlocked.
 */
let lockCount = 0;

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;
  lockCount += 1;
  if (lockCount === 1) {
    document.body.style.overflow = "hidden";
  }
}

export function unlockBodyScroll(): void {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = "";
  }
}
