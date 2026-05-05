/**
 * Reads the Bond SDK access + ID tokens from sessionStorage (where the SDK persists them) and
 * returns the headers our BFF route forwards to Bond as `X-BondUser*`. Returns an empty object on
 * the server or when no session is active.
 */
export function bondSdkAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const accessToken = window.sessionStorage.getItem("BondSdkAccessToken") ?? "";
    const idToken = window.sessionStorage.getItem("BondSdkIdToken") ?? "";
    const headers: Record<string, string> = {};
    if (accessToken) headers["X-BondUserAccessToken"] = accessToken;
    if (idToken) headers["X-BondUserIdToken"] = idToken;
    return headers;
  } catch {
    return {};
  }
}
