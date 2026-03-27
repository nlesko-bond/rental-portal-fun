/**
 * Normalize Bond auth/login and auth/refresh JSON into token triples.
 */

function pickString(o: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

function flattenAuthBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  const o = body as Record<string, unknown>;
  const out: Record<string, unknown> = { ...o };
  const nested = o.tokens ?? o.authenticationResult ?? o.AuthenticationResult;
  if (nested && typeof nested === "object") {
    Object.assign(out, nested as Record<string, unknown>);
  }
  return out;
}

export type BondAuthTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

export function extractBondAuthTokens(body: unknown): BondAuthTokens | null {
  const o = flattenAuthBody(body);
  const accessToken = pickString(o, ["accessToken", "access_token", "AccessToken"]);
  const idToken = pickString(o, ["idToken", "id_token", "IdToken"]);
  const refreshToken = pickString(o, ["refreshToken", "refresh_token", "RefreshToken"]);
  if (!accessToken || !idToken || !refreshToken) return null;
  return { accessToken, idToken, refreshToken };
}
