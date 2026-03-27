import { NextRequest, NextResponse } from "next/server";
import { bondCookieDefaults, BOND_COOKIE_ACCESS, BOND_COOKIE_ID, BOND_COOKIE_REFRESH, BOND_COOKIE_USERNAME } from "@/lib/bond-auth-cookies";
import { clearBondAuthCookies } from "@/lib/bond-auth-clear";
import { extractBondAuthTokens } from "@/lib/bond-auth-tokens";
import { fetchBondRefresh } from "@/lib/bond-refresh-fetch";
import { jwtEmailHint, jwtExpSeconds } from "@/lib/jwt-payload";

export async function GET(request: NextRequest) {
  const base = process.env.BOND_AUTH_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    return NextResponse.json({ authenticated: false, reason: "missing_config" as const });
  }

  const at = request.cookies.get(BOND_COOKIE_ACCESS)?.value;
  const idt = request.cookies.get(BOND_COOKIE_ID)?.value;
  const rt = request.cookies.get(BOND_COOKIE_REFRESH)?.value;
  const un = request.cookies.get(BOND_COOKIE_USERNAME)?.value;

  const now = Math.floor(Date.now() / 1000);
  const skew = 120;

  if (at && idt) {
    const exp = jwtExpSeconds(at);
    if (exp != null && exp > now + skew) {
      return NextResponse.json({
        authenticated: true as const,
        email: jwtEmailHint(idt),
      });
    }
  }

  if (rt && un) {
    const r = await fetchBondRefresh(base, rt, un);
    const raw = await r.text();
    let parsed: unknown;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      const out = NextResponse.json({ authenticated: false as const, reason: "refresh_invalid_json" as const });
      clearBondAuthCookies(out);
      return out;
    }

    if (!r.ok) {
      const out = NextResponse.json({
        authenticated: false as const,
        reason: "refresh_failed" as const,
        status: r.status,
        body: parsed,
      });
      clearBondAuthCookies(out);
      return out;
    }

    const tokens = extractBondAuthTokens(parsed);
    if (!tokens) {
      const out = NextResponse.json({
        authenticated: false as const,
        reason: "bad_refresh_shape" as const,
        body: parsed,
      });
      clearBondAuthCookies(out);
      return out;
    }

    const opts = bondCookieDefaults();
    const maxAgeRefresh = 60 * 60 * 24 * 30;
    const out = NextResponse.json({
      authenticated: true as const,
      email: jwtEmailHint(tokens.idToken),
    });
    out.cookies.set(BOND_COOKIE_ACCESS, tokens.accessToken, { ...opts, maxAge: 60 * 60 * 12 });
    out.cookies.set(BOND_COOKIE_ID, tokens.idToken, { ...opts, maxAge: 60 * 60 * 12 });
    out.cookies.set(BOND_COOKIE_REFRESH, tokens.refreshToken, { ...opts, maxAge: maxAgeRefresh });
    return out;
  }

  return NextResponse.json({ authenticated: false as const, reason: "no_session" as const });
}
