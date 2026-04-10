import type { BondUserDto } from "./bond-user-types";

export type BookingPartyMember = {
  id: number;
  label: string;
  isSelf?: boolean;
  /** e.g. Parent (You), Child — from Bond `family` payload when present */
  relationship?: string;
  /** Short label for badge chip (Gold, Pass, …) — account-level; not the same as this product’s membership gate */
  badgeLabel?: string;
  /**
   * Product lists a membership requirement and GET …/required says this person must still purchase one.
   */
  needsMembershipForProduct?: boolean;
  /**
   * Product lists a membership requirement and this person already satisfies it (member rate / access for **this** rental).
   */
  hasQualifyingMembershipForProduct?: boolean;
};

function personLabel(u: Record<string, unknown>): string {
  const a = typeof u.firstName === "string" ? u.firstName : "";
  const b = typeof u.lastName === "string" ? u.lastName : "";
  const name = [a, b].filter(Boolean).join(" ");
  if (name.length > 0) return name;
  const id = typeof u.id === "number" ? u.id : null;
  return id != null ? `User ${id}` : "Member";
}

function relationshipLabel(u: Record<string, unknown>, isSelf: boolean): string | undefined {
  if (isSelf) return "Parent (You)";
  const r =
    (typeof u.relationship === "string" && u.relationship) ||
    (typeof u.familyRole === "string" && u.familyRole) ||
    (typeof u.role === "string" && u.role) ||
    (typeof u.type === "string" && u.type);
  if (r) return r.charAt(0).toUpperCase() + r.slice(1);
  return "Family member";
}

function badgeFromUser(u: Record<string, unknown>): string | undefined {
  const t =
    (typeof u.membershipTier === "string" && u.membershipTier) ||
    (typeof u.membershipLevel === "string" && u.membershipLevel) ||
    (typeof u.tier === "string" && u.tier);
  if (t) return t;
  if (u.isPunchPass === true || u.punchPass === true) return "Pass";
  return undefined;
}

/** Self + family from `GET .../user?expand=family` (ExtendedUserDto). */
export function bookingPartyMembersFromProfile(profile: BondUserDto | undefined): BookingPartyMember[] {
  if (!profile || typeof profile !== "object") return [];
  const self = profile as Record<string, unknown>;
  const selfId = typeof self.id === "number" ? self.id : null;
  const out: BookingPartyMember[] = [];
  const seen = new Set<number>();
  if (selfId != null) {
    out.push({
      id: selfId,
      label: personLabel(self),
      isSelf: true,
      relationship: relationshipLabel(self, true),
      badgeLabel: badgeFromUser(self),
    });
    seen.add(selfId);
  }
  const fam = self.family;
  if (Array.isArray(fam)) {
    for (const m of fam) {
      if (!m || typeof m !== "object") continue;
      const u = m as Record<string, unknown>;
      const id = typeof u.id === "number" ? u.id : null;
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      out.push({
        id,
        label: personLabel(u),
        relationship: relationshipLabel(u, false),
        badgeLabel: badgeFromUser(u),
      });
    }
  }
  return out;
}

/** @deprecated use bookingPartyMembersFromProfile */
export function bookingPartyOptionsFromProfile(profile: BondUserDto | undefined): { id: number; label: string }[] {
  return bookingPartyMembersFromProfile(profile).map(({ id, label }) => ({ id, label }));
}
