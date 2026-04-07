import type { BondUserDto } from "./bond-user-types";

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

/** Resolve a family member (or self) by Bond user id from `GET .../user?expand=family` (and `expand=address`). */
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

/** One-line address from flat fields (user root or nested `address` object from `expand=address`). */
function readAddressFromFlatRecord(rec: Record<string, unknown>): string {
  const oneLine =
    str(rec.formattedAddress) ??
    str(rec.addressFormatted) ??
    str(rec.fullAddress) ??
    str(rec.formatted) ??
    str(rec.oneLine);
  if (oneLine) return oneLine;
  const line1 =
    str(rec.addressLine1) ??
    str(rec.streetAddress) ??
    str(rec.address1) ??
    str(rec.line1) ??
    str(rec.street1);
  const line2 = str(rec.addressLine2) ?? str(rec.address2) ?? str(rec.street2);
  const city = str(rec.city) ?? str(rec.town);
  const region = str(rec.state) ?? str(rec.region) ?? str(rec.province);
  const zip = str(rec.zip) ?? str(rec.postalCode) ?? str(rec.zipCode) ?? str(rec.postal);
  const parts = [line1, line2, city, region, zip].filter(Boolean);
  return parts.join(", ");
}

function readAddress(u: Record<string, unknown> | null): string {
  if (!u) return "";
  const direct = readAddressFromFlatRecord(u);
  if (direct) return direct;
  const addr = u.address;
  if (addr && typeof addr === "object") {
    return readAddressFromFlatRecord(addr as Record<string, unknown>);
  }
  return "";
}

function readGender(u: Record<string, unknown> | null): string {
  if (!u) return "";
  const g = str(u.gender) ?? str(u.genderName);
  if (!g) return "";
  return g.trim().toLowerCase();
}

/** `customer.waiverSignedDate` from Bond `ExtendedUserDto` / `BasicCustomerDto` (YYYY-MM-DD). */
function readWaiverSignedDate(u: Record<string, unknown> | null): string {
  if (!u) return "";
  const cust = u.customer;
  if (cust && typeof cust === "object") {
    const d = str((cust as Record<string, unknown>).waiverSignedDate);
    if (d) return /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : d;
  }
  return "";
}

export type BookingContactSnapshot = {
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  /** Lowercase Bond gender string (e.g. `male`, `female`, `other`) for matching select options. */
  gender: string;
  /** ISO date `YYYY-MM-DD` when the customer has a waiver on file, else "". */
  waiverSignedDate: string;
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
    gender: pick(readGender(target), readGender(primary)),
    waiverSignedDate: pick(readWaiverSignedDate(target), readWaiverSignedDate(primary)),
  };
}
