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
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.014 4.77778C18.7581 5.07692 18.3743 5.50427 18.0332 6.05983L18.8007 6.44444L18.2038 7.64103L17.3509 7.21368C17.0098 7.89744 16.6687 8.7094 16.4981 9.60684L17.3083 9.73504L17.0951 11.0171L16.3275 10.8889C16.2849 11.5299 16.2849 12.2137 16.3702 12.8974L17.0098 12.7265L17.3936 13.9658L16.626 14.1795C16.7966 14.8632 17.0524 15.547 17.3936 16.2735L17.9479 15.8034L18.7581 16.8291L17.9906 17.4701C18.289 17.9829 18.6302 18.4957 19.0566 19.0513C20.8902 17.2137 21.9989 14.735 21.9989 11.9573C22.0415 9.13675 20.8902 6.61538 19.014 4.77778Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.0524 18.3248L16.4128 18.8803L15.6026 17.8547L16.4555 17.1709C16.029 16.2735 15.6879 15.4188 15.4747 14.5641L14.4513 14.8632L14.0675 13.6239L15.1762 13.2821C15.0057 12.3419 15.0057 11.4872 15.0909 10.6752L14.0675 10.5043L14.2807 9.22222L15.2615 9.39316C15.4747 8.36752 15.8585 7.42735 16.2423 6.65812L15.5173 6.31624L16.1143 5.16239L16.9245 5.54701C17.3509 4.90598 17.7347 4.39316 18.0758 4.00855C16.4128 2.7265 14.3234 2 12.0207 2C9.76075 2 7.67132 2.76923 6.0083 4.00855C6.34943 4.39316 6.77585 4.94872 7.20226 5.63248L8.09773 5.16239L8.69471 6.31624L7.84188 6.74359C8.22566 7.51282 8.56679 8.45299 8.78 9.4359L9.93132 9.22222L10.1445 10.5043L8.9932 10.7179C9.07849 11.5299 9.03584 12.3419 8.95056 13.2393L10.2298 13.6239L9.84603 14.8632L8.65207 14.5214C8.43886 15.3333 8.14037 16.188 7.71396 17.0855L8.65207 17.8547L7.84188 18.8803L7.07434 18.2393C6.7332 18.7949 6.34943 19.3504 5.92302 19.9487C7.62868 21.2308 9.71811 22 12.0207 22C14.3234 22 16.4128 21.2308 18.1185 19.906C17.6921 19.3932 17.3509 18.8376 17.0524 18.3248Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.94226 19.0513C5.36868 18.4957 5.75245 17.9402 6.05094 17.3846L5.41132 16.8291L6.22151 15.8034L6.64792 16.188C6.98905 15.4615 7.2449 14.7778 7.41547 14.1368L6.81849 13.9658L7.20226 12.7265L7.71396 12.8547C7.79924 12.1709 7.79924 11.5299 7.7566 10.9316L7.11698 11.0598L6.90377 9.77778L7.58603 9.64957C7.37283 8.75214 7.07434 7.98291 6.7332 7.25641L6.0083 7.64103L5.41132 6.44444L6.09358 6.10256C5.66717 5.54701 5.28339 5.07692 5.02754 4.77778C3.15132 6.61538 2 9.13675 2 11.9573C2 14.735 3.10868 17.2564 4.94226 19.0513Z"
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
      <path d="M7.5 4.5l4.2 14M16.5 4.5l-4.2 14" {...sharedPathProps} strokeWidth={ACTIVITY_ICON_STROKE_WIDTH} />
      <path
        d="M8.6 15.8h6.8"
        {...sharedPathProps}
        strokeWidth={ACTIVITY_ICON_DETAIL_STROKE_WIDTH}
      />
      <ellipse cx="12" cy="18.4" rx="2.8" ry="1.1" fill="currentColor" />
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
