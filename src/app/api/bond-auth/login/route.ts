import { NextRequest, NextResponse } from "next/server";
import { bondCookieDefaults, BOND_COOKIE_ACCESS, BOND_COOKIE_ID, BOND_COOKIE_REFRESH, BOND_COOKIE_USERNAME } from "@/lib/bond-auth-cookies";
import { extractBondAuthTokens } from "@/lib/bond-auth-tokens";

export async function POST(request: NextRequest) {
  const base = process.env.BOND_AUTH_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    return NextResponse.json({ error: "Missing BOND_AUTH_BASE_URL" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const email = typeof o.email === "string" ? o.email.trim() : "";
  const password = typeof o.password === "string" ? o.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password, platform: "consumer" }),
    cache: "no-store",
  });

  const raw = await res.text();
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json(
      { error: "Bond auth response was not JSON", status: res.status, preview: raw.slice(0, 200) },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Login failed", status: res.status, body: parsed },
      { status: res.status }
    );
  }

  const tokens = extractBondAuthTokens(parsed);
  if (!tokens) {
    return NextResponse.json(
      { error: "Unexpected login response shape; could not read tokens", body: parsed },
      { status: 502 }
    );
  }

  const opts = bondCookieDefaults();
  const maxAgeRefresh = 60 * 60 * 24 * 30;
  const out = NextResponse.json({ ok: true });
  out.cookies.set(BOND_COOKIE_ACCESS, tokens.accessToken, { ...opts, maxAge: 60 * 60 * 12 });
  out.cookies.set(BOND_COOKIE_ID, tokens.idToken, { ...opts, maxAge: 60 * 60 * 12 });
  out.cookies.set(BOND_COOKIE_REFRESH, tokens.refreshToken, { ...opts, maxAge: maxAgeRefresh });
  out.cookies.set(BOND_COOKIE_USERNAME, email, { ...opts, maxAge: maxAgeRefresh });
  return out;
}
