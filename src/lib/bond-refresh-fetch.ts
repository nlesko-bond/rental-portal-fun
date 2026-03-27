/**
 * Call Bond auth/refresh; tries GET first, then POST if 405.
 */
export async function fetchBondRefresh(
  base: string,
  refreshToken: string,
  username: string
): Promise<Response> {
  const url = `${base.replace(/\/$/, "")}/auth/refresh?platform=consumer`;
  const headers: Record<string, string> = {
    "X-BondUserRefreshToken": refreshToken,
    "X-BondUserUsername": username,
    Accept: "application/json",
  };
  let res = await fetch(url, { method: "GET", headers, cache: "no-store" });
  if (res.status === 405) {
    res = await fetch(url, { method: "POST", headers, cache: "no-store" });
  }
  return res;
}
