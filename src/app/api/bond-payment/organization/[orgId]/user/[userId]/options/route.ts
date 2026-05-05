import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies `GET /v4/payment/organization/{orgId}/{userId}/options?platform=consumer` to Bond.
 * The browser forwards Bond SDK access/ID tokens via `X-BondUser*` headers; this route adds the
 * server-only `X-Api-Key` and never touches cookies.
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

  const access = request.headers.get("x-bonduseraccesstoken");
  const id = request.headers.get("x-bonduseridtoken");
  const username = request.headers.get("x-bonduserusername");
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
  if (username) {
    headers["X-BondUserUsername"] = username;
  }

  const res = await fetch(url.toString(), { method: "GET", headers, cache: "no-store" });
  const contentType = res.headers.get("content-type") ?? "application/json";
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}
