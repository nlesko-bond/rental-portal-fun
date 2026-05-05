import type { CSSProperties } from "react";
import type { PortalBranding, PublicOnlineBookingPortalDto } from "@/types/online-booking";

function readBranding(portal: PublicOnlineBookingPortalDto | undefined): PortalBranding {
  const b = portal?.options?.branding;
  return b && typeof b === "object" ? b : {};
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

export type BookingThemeUrlOverrides = {
  /** Brand primary (`--cb-primary`). */
  primary?: string;
  /** Brand secondary / accent (`--cb-accent`). */
  accent?: string;
  /** Confirmation / success swatch (`--cb-success`). */
  success?: string;
  /** Tertiary / surface color (`--cb-bg-surface` + `--cb-bg-slot`). */
  surface?: string;
};

/**
 * Theme: URL query overrides (dev) > `NEXT_PUBLIC_BOOKING_*` env > portal `options.branding` > defaults.
 * Colors must be valid CSS color values (hex, rgb, etc.).
 *
 * Env vars must be referenced with literal property access so Next.js can inline them into
 * client bundles. Dynamic `process.env[name]` lookup returns `undefined` in the browser.
 */
export function resolveBookingThemeStyle(
  portal: PublicOnlineBookingPortalDto | undefined,
  urlOverrides?: BookingThemeUrlOverrides | null
): CSSProperties {
  const b = readBranding(portal);

  const primary =
    str(urlOverrides?.primary) ??
    str(process.env.NEXT_PUBLIC_BOOKING_PRIMARY) ??
    str(b.primaryColor) ??
    str(b.primary) ??
    "#0d4774";
  const accent =
    str(urlOverrides?.accent) ??
    str(process.env.NEXT_PUBLIC_BOOKING_ACCENT) ??
    str(b.accentColor) ??
    str(b.accent) ??
    "#f7b500";
  const success =
    str(urlOverrides?.success) ??
    str(process.env.NEXT_PUBLIC_BOOKING_SUCCESS) ??
    str(b.successColor) ??
    str(b.success) ??
    primary;

  const fontFromPortal = str(b.fontFamily) ?? str(b.fontFamilyStack);
  const fontFromEnv = str(process.env.NEXT_PUBLIC_BOOKING_FONT_FAMILY);
  const fontPreset = str(process.env.NEXT_PUBLIC_BOOKING_FONT);
  let fontSans = fontFromPortal ?? fontFromEnv;
  if (!fontSans) {
    if (fontPreset === "inter") fontSans = "var(--font-inter), system-ui, sans-serif";
    else if (fontPreset === "geist") fontSans = "var(--font-geist-sans), system-ui, sans-serif";
    else fontSans = "var(--font-montserrat), system-ui, sans-serif";
  }

  const bgPage = str(process.env.NEXT_PUBLIC_BOOKING_BG_PAGE) ?? str(b.backgroundColor);
  const bgSurface =
    str(urlOverrides?.surface) ??
    str(process.env.NEXT_PUBLIC_BOOKING_SURFACE) ??
    str(b.surfaceColor);
  const text = str(b.textColor) ?? str(b.textPrimaryColor);
  const textMuted = str(b.textMutedColor);
  const border = str(b.borderColor);

  return {
    "--cb-primary": primary,
    "--cb-accent": accent,
    "--cb-success": success,
    "--cb-font-sans": fontSans,
    fontFamily: fontSans,
    ...(bgPage != null ? { "--cb-bg-page": bgPage } : {}),
    ...(bgSurface != null
      ? {
          "--cb-bg-surface": bgSurface,
          "--cb-bg-slot": bgSurface,
        }
      : {}),
    ...(text != null ? { "--cb-text": text } : {}),
    ...(textMuted != null ? { "--cb-text-muted": textMuted } : {}),
    ...(border != null ? { "--cb-border": border } : {}),
  } as CSSProperties;
}

export type BookingAppearanceMode = "system" | "light" | "dark";

export function bookingAppearanceClass(): string {
  const raw = (process.env.NEXT_PUBLIC_BOOKING_APPEARANCE ?? "system").toLowerCase();
  if (raw === "light") return "consumer-booking--light";
  if (raw === "dark") return "consumer-booking--dark";
  return "";
}

export type BookingBrandingDisplay = {
  /** Org name as configured in the portal — falls back to `Bond Sports`. */
  orgName: string;
  /** Light-mode logo URL when configured by the org. */
  logoUrl: string | null;
  /** Optional dark-mode override; UIs should fall back to `logoUrl`. */
  logoDarkUrl: string | null;
};

export type BookingBrandingUrlOverrides = {
  /** `?orgName=Sonic+Squad` — overrides portal name for demo. */
  orgName?: string;
  /** `?logoUrl=https://…` — overrides logo for demo. */
  logoUrl?: string;
};

/**
 * Reads the customer-facing brand identity. Resolution order:
 * `URL ?orgName / ?logoUrl` → `NEXT_PUBLIC_BOND_ORG_NAME` / `NEXT_PUBLIC_BOND_ORG_LOGO_URL`
 * → portal payload → final fallback (`Bond Sports`, no logo).
 *
 * Env wins over the portal so a demo deployment can override the live org's name/logo
 * without coordinating with the backoffice. URL params win over env so a single deploy can
 * ad-hoc demo multiple orgs.
 */
export function resolveBookingBranding(
  portal: PublicOnlineBookingPortalDto | undefined,
  urlOverrides?: BookingBrandingUrlOverrides | null,
): BookingBrandingDisplay {
  const branding = readBranding(portal);
  const orgName =
    str(urlOverrides?.orgName) ??
    str(process.env.NEXT_PUBLIC_BOND_ORG_NAME) ??
    str(portal?.name) ??
    "Bond Sports";
  const logoUrl =
    str(urlOverrides?.logoUrl) ??
    str(process.env.NEXT_PUBLIC_BOND_ORG_LOGO_URL) ??
    str(branding.logoUrl) ??
    str(branding.logo) ??
    str(branding.logoLightUrl) ??
    null;
  const logoDarkUrl =
    str(process.env.NEXT_PUBLIC_BOND_ORG_LOGO_DARK_URL) ??
    str(branding.logoDarkUrl) ??
    null;
  return { orgName, logoUrl, logoDarkUrl };
}
