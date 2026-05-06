"use client";

import type { SVGProps } from "react";
import type { ReactElement } from "react";

type SvgProps = SVGProps<SVGSVGElement>;

const ACTIVITY_ICON_STROKE_WIDTH = 1.8;
const ACTIVITY_ICON_DETAIL_STROKE_WIDTH = 1.35;

const sharedPathProps = {
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;

function IconActivityFallback(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M5 12h14M12 5v14M7.5 7.5l9 9M16.5 7.5l-9 9"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_STROKE_WIDTH}
      />
    </svg>
  );
}

function IconBaseballSoftball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path
        d="M8 6.8c1.7 2.7 3.1 5.7 4 9.1M16 6.8c-1.7 2.7-3.1 5.7-4 9.1M5.3 11.6c2.2.7 4.4 1 6.7 1s4.5-.3 6.7-1"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
      />
    </svg>
  );
}

function IconSoccer(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path
        d="M12 4.5v4.2M12 15.3v4.2M8 7.1l4 2.9 4-2.9M7 16.5l3.7-2.8h2.6l3.7 2.8"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
      />
      <path
        d="M8.4 10l1.4 3.7M15.6 10l-1.4 3.7"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
      />
    </svg>
  );
}

function IconBasketball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path d="M12 4.5v15M4.5 12h15" {...sharedPathProps} strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH} />
      <path
        d="M6.5 6.7c3 2.7 6.5 5.1 10.2 7.1M17.5 6.7c-3 2.7-6.5 5.1-10.2 7.1"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
      />
    </svg>
  );
}

function IconFootball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <ellipse cx="12" cy="12" rx="7.2" ry="4.6" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path
        d="M12 8.2v7.6M9.8 10.4h4.4M9.8 13.6h4.4"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
      />
    </svg>
  );
}

function IconTennis(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path
        d="M6.5 6.5c3.2 3.2 5.4 7.6 6.1 12.4"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
      />
    </svg>
  );
}

function IconVolleyball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path
        d="M12 4.5c2.2 2.5 3.4 5.5 3.4 7.5s-1.2 5-3.4 7.5M12 4.5C9.8 7 8.6 10 8.6 12s1.2 5 3.4 7.5M5.2 8.8c4.6.7 9 .7 13.6 0M5.2 15.2c4.6-.7 9-.7 13.6 0"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
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
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_STROKE_WIDTH}
      />
    </svg>
  );
}

function IconPickleball(props: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
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
      <ellipse cx="12" cy="12" rx="8" ry="4.8" stroke="currentColor" strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path
        d="M9.5 11.2h5M11.2 9.5v5"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
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
