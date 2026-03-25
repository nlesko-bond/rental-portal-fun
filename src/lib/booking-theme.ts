import type { CSSProperties } from "react";
import type { PublicOnlineBookingPortalDto } from "@/types/online-booking";

type Branding = Record<string, unknown>;

function readBranding(portal: PublicOnlineBookingPortalDto | undefined): Branding {
  const opts = portal?.options as { branding?: Branding } | undefined;
  return opts?.branding && typeof opts.branding === "object" ? opts.branding : {};
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
    env("NEXT_PUBLIC_BOOKING_SUCCESS") ??
    "#24c875";

  const fontFromPortal = str(b.fontFamily) ?? str(b.fontFamilyStack);
  const fontFromEnv = env("NEXT_PUBLIC_BOOKING_FONT_FAMILY");
  const fontPreset = env("NEXT_PUBLIC_BOOKING_FONT");
  let fontSans = fontFromPortal ?? fontFromEnv;
  if (!fontSans) {
    if (fontPreset === "inter") fontSans = "var(--font-inter), system-ui, sans-serif";
    else if (fontPreset === "geist") fontSans = "var(--font-geist-sans), system-ui, sans-serif";
    else fontSans = "var(--font-montserrat), system-ui, sans-serif";
  }

  return {
    "--cb-primary": primary,
    "--cb-accent": accent,
    "--cb-success": success,
    "--cb-font-sans": fontSans,
    fontFamily: fontSans,
  } as CSSProperties;
}

export type BookingAppearanceMode = "system" | "light" | "dark";

export function bookingAppearanceClass(): string {
  const raw = (process.env.NEXT_PUBLIC_BOOKING_APPEARANCE ?? "system").toLowerCase();
  if (raw === "light") return "consumer-booking--light";
  if (raw === "dark") return "consumer-booking--dark";
  return "";
}
