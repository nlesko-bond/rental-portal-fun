import type { BondUserDto } from "./bond-user-types";

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

/** Resolve a family member (or self) by Bond user id from `GET .../user?expand=family`. */
export function findProfilePersonById(
  profile: BondUserDto | undefined,
  userId: number
): Record<string, unknown> | null {
  if (!profile || typeof profile !== "object") return null;
  const root = profile as Record<string, unknown>;
  if (typeof root.id === "number" && root.id === userId) return root;
  const fam = root.family;
  if (!Array.isArray(fam)) return null;
  for (const m of fam) {
    if (!m || typeof m !== "object") continue;
    const u = m as Record<string, unknown>;
    if (typeof u.id === "number" && u.id === userId) return u;
  }
  return null;
}

function primaryPerson(profile: BondUserDto | undefined): Record<string, unknown> | null {
  if (!profile || typeof profile !== "object") return null;
  return profile as Record<string, unknown>;
}

function readEmail(u: Record<string, unknown> | null): string {
  if (!u) return "";
  return str(u.email) ?? str(u.emailAddress) ?? "";
}

function readPhone(u: Record<string, unknown> | null): string {
  if (!u) return "";
  return (
    str(u.phone) ??
    str(u.phoneNumber) ??
    str(u.mobilePhone) ??
    str(u.mobile) ??
    str(u.cellPhone) ??
    ""
  );
}

/** Normalize to `yyyy-mm-dd` for `<input type="date">` when possible */
function readBirthDate(u: Record<string, unknown> | null): string {
  if (!u) return "";
  const raw =
    str(u.birthDate) ??
    str(u.dateOfBirth) ??
    str(u.birthday) ??
    str(u.dateOfBirthString);
  if (!raw) return "";
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return "";
}

function readAddress(u: Record<string, unknown> | null): string {
  if (!u) return "";
  const oneLine =
    str(u.formattedAddress) ??
    str(u.addressFormatted) ??
    str(u.fullAddress);
  if (oneLine) return oneLine;
  const line1 = str(u.addressLine1) ?? str(u.streetAddress) ?? str(u.address1) ?? str(u.line1);
  const line2 = str(u.addressLine2) ?? str(u.address2);
  const city = str(u.city) ?? str(u.town);
  const region = str(u.state) ?? str(u.region) ?? str(u.province);
  const zip = str(u.zip) ?? str(u.postalCode) ?? str(u.zipCode);
  const parts = [line1, line2, city, region, zip].filter(Boolean);
  return parts.join(", ");
}

export type BookingContactSnapshot = {
  email: string;
  phone: string;
  birthDate: string;
  address: string;
};

/**
 * Contact fields for the **booking target** user, falling back to the **primary** (logged-in) profile
 * when the selected family member has no value.
 */
export function bookingContactSnapshot(
  profile: BondUserDto | undefined,
  bookingUserId: number,
  primaryUserId: number
): BookingContactSnapshot {
  const target = findProfilePersonById(profile, bookingUserId);
  const primary = findProfilePersonById(profile, primaryUserId) ?? primaryPerson(profile);
  const pick = (a: string, b: string) => (a.length > 0 ? a : b);

  return {
    email: pick(readEmail(target), readEmail(primary)),
    phone: pick(readPhone(target), readPhone(primary)),
    birthDate: pick(readBirthDate(target), readBirthDate(primary)),
    address: pick(readAddress(target), readAddress(primary)),
  };
}
