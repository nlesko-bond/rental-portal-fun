import type { NextResponse } from "next/server";
import {
  BOND_COOKIE_ACCESS,
  BOND_COOKIE_ID,
  BOND_COOKIE_REFRESH,
  BOND_COOKIE_USERNAME,
} from "./bond-auth-cookies";

export function clearBondAuthCookies(res: NextResponse) {
  res.cookies.delete(BOND_COOKIE_ACCESS);
  res.cookies.delete(BOND_COOKIE_ID);
  res.cookies.delete(BOND_COOKIE_REFRESH);
  res.cookies.delete(BOND_COOKIE_USERNAME);
}
