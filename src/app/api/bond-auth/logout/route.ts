import { NextResponse } from "next/server";
import { clearBondAuthCookies } from "@/lib/bond-auth-clear";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearBondAuthCookies(res);
  return res;
}
