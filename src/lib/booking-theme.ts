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
  primary?: string;
  accent?: string;
  success?: string;
};

/**
 * Theme: URL query overrides (dev) > portal `options.branding` > `NEXT_PUBLIC_BOOKING_*` > defaults.
 * Colors must be valid CSS color values (hex, rgb, etc.).
 */
export function resolveBookingThemeStyle(
  portal: PublicOnlineBookingPortalDto | undefined,
  urlOverrides?: BookingThemeUrlOverrides | null
): CSSProperties {
  const b = readBranding(portal);
  const env = (k: string) => process.env[k];

  const primary =
    str(urlOverrides?.primary) ??
    str(b.primaryColor) ??
    str(b.primary) ??
    env("NEXT_PUBLIC_BOOKING_PRIMARY") ??
    "#0d4774";
  const accent =
    str(urlOverrides?.accent) ??
    str(b.accentColor) ??
    str(b.accent) ??
    env("NEXT_PUBLIC_BOOKING_ACCENT") ??
    "#f7b500";
  const success =
    str(urlOverrides?.success) ??
    str(b.successColor) ??
    str(b.success) ??
    env("NEXT_PUBLIC_BOOKING_SUCCESS") ??
    primary;

  const fontFromPortal = str(b.fontFamily) ?? str(b.fontFamilyStack);
  const fontFromEnv = env("NEXT_PUBLIC_BOOKING_FONT_FAMILY");
  const fontPreset = env("NEXT_PUBLIC_BOOKING_FONT");
  let fontSans = fontFromPortal ?? fontFromEnv;
  if (!fontSans) {
    if (fontPreset === "inter") fontSans = "var(--font-inter), system-ui, sans-serif";
    else if (fontPreset === "geist") fontSans = "var(--font-geist-sans), system-ui, sans-serif";
    else fontSans = "var(--font-montserrat), system-ui, sans-serif";
  }

  const bgPage = str(b.backgroundColor);
  const bgSurface = str(b.surfaceColor);
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
