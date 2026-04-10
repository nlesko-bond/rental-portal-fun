/**
 * Decode JWT payload (no signature verification) for expiry checks only.
 */
function base64UrlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const s = b64 + pad;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "base64").toString("utf8");
  }
  return atob(s);
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function jwtExpSeconds(token: string): number | null {
  const p = decodeJwtPayload(token);
  if (!p || typeof p.exp !== "number") return null;
  return p.exp;
}

export function jwtEmailHint(token: string): string | undefined {
  const p = decodeJwtPayload(token);
  if (!p) return undefined;
  if (typeof p.email === "string") return p.email;
  const preferred = p["cognito:username"];
  if (typeof preferred === "string") return preferred;
  return undefined;
}

const BOND_USER_ID_CLAIM_KEYS = [
  "custom:userId",
  "custom:user_id",
  "bondUserId",
  "userId",
  "user_id",
] as const;

/** Bond numeric user id from the ID token (consumer / org user id for API paths). */
export function bondNumericUserIdFromIdToken(idToken: string): number | null {
  const p = decodeJwtPayload(idToken);
  if (!p) return null;
  for (const key of BOND_USER_ID_CLAIM_KEYS) {
    const raw = p[key];
    if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
    if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw);
  }
  return null;
}
