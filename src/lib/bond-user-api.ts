import { bondBffGetJson } from "./bond-json";

/** Current org user profile (shape depends on Bond `expand`). */
export type BondUserDto = Record<string, unknown>;

/**
 * `GET /v1/organization/{orgId}/user` — requires logged-in session (cookies → BFF → JWT headers).
 */
export async function fetchCurrentBondUser(
  orgId: number,
  expand: string[] = ["family"]
): Promise<BondUserDto> {
  const path = ["v1", "organization", String(orgId), "user"];
  const q = new URLSearchParams();
  for (const e of expand) {
    q.append("expand", e);
  }
  return bondBffGetJson<BondUserDto>(path, q);
}
