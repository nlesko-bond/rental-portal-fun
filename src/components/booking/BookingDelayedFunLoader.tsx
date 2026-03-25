"use client";

type Props = {
  /** When true, the delay timer runs; when false, hidden immediately. */
  active: boolean;
  /** Shown after delay under the spinner. */
  line: string;
  /** Optional second line (e.g. fact). */
  subline?: string;
  delayMs?: number;
  className?: string;
  /**
   * When false, only the spinner row is rendered (matches SSR + first client paint).
   * Set from `useHydrated()` to avoid hydration mismatches for delayed-copy markup.
   */
  showFunCopy?: boolean;
};

const DEFAULT_DELAY_MS = 1600;

/**
 * Lightweight “easter egg” loader: extra copy fades in after a CSS delay so fast loads stay minimal.
 */
export function BookingDelayedFunLoader({
  active,
  line,
  subline,
  delayMs = DEFAULT_DELAY_MS,
  className,
  showFunCopy = true,
}: Props) {
  if (!active) return null;

  return (
    <div className={className ?? ""} aria-live="polite">
      {!showFunCopy ? (
        <span className="sr-only">
          {line}
          {subline ? ` ${subline}` : ""}
        </span>
      ) : null}
      <div className="cb-fun-loader-row">
        <span className="cb-fun-loader-spinner" aria-hidden />
        {showFunCopy ? (
          <div className="cb-fun-loader-copy" style={{ animationDelay: `${delayMs}ms` }}>
            <p className="cb-fun-loader-line">{line}</p>
            {subline ? <p className="cb-fun-loader-sub">{subline}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
