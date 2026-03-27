/**
 * HttpOnly cookie names for Bond user session (same-origin only; never exposed to JS).
 */
export const BOND_COOKIE_ACCESS = "bond_user_at";
export const BOND_COOKIE_ID = "bond_user_idt";
export const BOND_COOKIE_REFRESH = "bond_user_rt";
/** Username/email header value required by Bond refresh. */
export const BOND_COOKIE_USERNAME = "bond_user_un";

export function bondCookieDefaults() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
