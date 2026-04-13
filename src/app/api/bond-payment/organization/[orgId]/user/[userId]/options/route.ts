import { NextRequest, NextResponse } from "next/server";
import {
  BOND_COOKIE_ACCESS,
  BOND_COOKIE_ID,
  BOND_COOKIE_USERNAME,
} from "@/lib/bond-auth-cookies";

/**
 * Proxies `GET /v4/payment/organization/{orgId}/{userId}/options?platform=consumer`
 * with JWT cookies → Bond `X-BondUser*` headers. Never call Bond v4 from the browser.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ orgId: string; userId: string }> }
) {
  const { orgId, userId } = await ctx.params;
  if (!/^\d+$/.test(orgId) || !/^\d+$/.test(userId)) {
    return NextResponse.json({ error: "Invalid org or user id" }, { status: 400 });
  }

  /**
   * `v4/payment/...` is not on the trimmed public `v1` gateway. Default to the same host as
   * consumer auth (`BOND_AUTH_BASE_URL`), which typically exposes internal routes; override with
   * `BOND_PAYMENT_API_BASE_URL` when Bond documents a different base.
   */
  const base =
    process.env.BOND_PAYMENT_API_BASE_URL?.replace(/\/$/, "") ??
    process.env.BOND_AUTH_BASE_URL?.replace(/\/$/, "") ??
    process.env.BOND_API_BASE_URL?.replace(/\/$/, "");
  const key = process.env.BOND_API_KEY;
  if (!base || !key) {
    return NextResponse.json(
      {
        error:
          "Missing BOND_API_KEY or a payment base URL (set BOND_AUTH_BASE_URL, BOND_PAYMENT_API_BASE_URL, or BOND_API_BASE_URL)",
      },
      { status: 500 }
    );
  }

  const access = request.cookies.get(BOND_COOKIE_ACCESS)?.value;
  const id = request.cookies.get(BOND_COOKIE_ID)?.value;
  const usernameRaw = request.cookies.get(BOND_COOKIE_USERNAME)?.value;
  if (!access || !id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(`${base}/v4/payment/organization/${orgId}/${userId}/options`);
  url.searchParams.set("platform", "consumer");
  const incoming = request.nextUrl.searchParams.get("platform");
  if (incoming) url.searchParams.set("platform", incoming);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Api-Key": key,
    "X-BondUserAccessToken": access,
    "X-BondUserIdToken": id,
  };
  if (usernameRaw) {
    headers["X-BondUserUsername"] = decodeURIComponent(usernameRaw);
  }

  const res = await fetch(url.toString(), { method: "GET", headers, cache: "no-store" });
  const contentType = res.headers.get("content-type") ?? "application/json";
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}
