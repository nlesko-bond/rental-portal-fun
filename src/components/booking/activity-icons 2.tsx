"use client";

import type { SVGProps } from "react";
import type { ReactElement } from "react";

type SvgProps = SVGProps<SVGSVGElement>;

/** Monochrome activity glyphs (~20px in 24 viewBox), aligned with Consumer Design System activity icons. */
function IconActivityFallback(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 10c3-5 13-5 16 0-3 5-13 5-16 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconBaseballSoftball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.2 7.5c1.8 2.6 3.6 5.2 4.8 8.2M16.8 7.2c-1.8 2.6-3.6 5.2-4.8 8.2M5.8 11.2c2.1.8 4.3 1.2 6.5 1.2s4.4-.4 6.5-1.2"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSoccer(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 4.5v15M6.2 7.5l11.6 9M17.8 7.5L6.2 16.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8.5 9.5l7 5M8.5 14.5l7-5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}

function IconBasketball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4.5v15M4.5 12h15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M6.5 6.5c3.2 2.8 6.8 5.2 10.3 7.3M17.5 6.5c-3.2 2.8-6.8 5.2-10.3 7.3"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.9}
      />
    </svg>
  );
}

function IconFootball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <ellipse cx="12" cy="12" rx="7.2" ry="4.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8.2v7.6M9.8 10.4h4.4M9.8 13.6h4.4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTennis(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.2 6.2c3.4 3.4 5.6 7.8 6.4 12.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconVolleyball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 4.5c2.2 2.6 3.5 6 3.5 7.5S14.2 16.9 12 19.5M12 4.5c-2.2 2.6-3.5 6-3.5 7.5S9.8 16.9 12 19.5M5.2 8.8c3.6.4 7.2.4 13.6 0M5.2 15.2c3.6-.4 7.2-.4 13.6 0"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconHockey(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <ellipse cx="10" cy="16.5" rx="2.8" ry="1.4" fill="currentColor" />
      <path
        d="M13.5 5.5l3.5 10.5H11l-1.2-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPickleball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" />
      <circle cx="12" cy="14.5" r="0.9" fill="currentColor" />
      <circle cx="9" cy="15.5" r="0.9" fill="currentColor" />
      <circle cx="15" cy="15.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconRugby(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <ellipse cx="12" cy="12" rx="8" ry="4.8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 11.2h5M11.2 9.5v5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS: Record<string, (p: SvgProps) => ReactElement> = {
  baseball: IconBaseballSoftball,
  softball: IconBaseballSoftball,
  soccer: IconSoccer,
  futsal: IconSoccer,
  basketball: IconBasketball,
  football: IconFootball,
  tennis: IconTennis,
  volleyball: IconVolleyball,
  hockey: IconHockey,
  pickle: IconPickleball,
  pickleball: IconPickleball,
  rugby: IconRugby,
};

function resolveIcon(activity: string): (p: SvgProps) => ReactElement {
  const a = activity.toLowerCase().trim();
  if (a === "football" || (a.includes("football") && a.includes("american"))) return ICONS.football!;
  if (a.includes("soccer")) return ICONS.soccer!;
  if (a.includes("basketball")) return ICONS.basketball!;
  if (a.includes("tennis")) return ICONS.tennis!;
  if (a.includes("volleyball")) return ICONS.volleyball!;
  if (a.includes("baseball") || a.includes("softball")) return ICONS.baseball!;
  if (a.includes("pickle")) return ICONS.pickleball!;
  if (a.includes("futsal")) return ICONS.futsal!;
  if (a.includes("rugby")) return ICONS.rugby!;
  if (a.includes("hockey") || /\bice\b/.test(a)) return ICONS.hockey!;
  for (const key of Object.keys(ICONS)) {
    if (a.includes(key)) return ICONS[key]!;
  }
  return IconActivityFallback;
}

export type ActivityGlyphProps = {
  activity: string;
  className?: string;
  title?: string;
};

/** Vector activity icon (replaces emoji) — uses `currentColor` for theming. */
export function ActivityGlyph({ activity, className, title }: ActivityGlyphProps) {
  const Cmp = resolveIcon(activity);
  return (
    <Cmp
      className={className}
      width={20}
      height={20}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    />
  );
}
