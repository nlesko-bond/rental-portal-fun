import { NextRequest, NextResponse } from "next/server";
import {
  BOND_COOKIE_ACCESS,
  BOND_COOKIE_ID,
  BOND_COOKIE_USERNAME,
} from "@/lib/bond-auth-cookies";

/**
 * Allowlisted BFF paths to Bond `v1/organization/...`.
 * Cart routes must match hosted public OpenAPI (carts-public-api); adjust segments if Bond differs.
 */
function isAllowedBondPath(segments: string[]): boolean {
  if (segments.length < 3) return false;
  if (segments[0] !== "v1" || segments[1] !== "organization") return false;
  if (segments.some((s) => s.includes("..") || s.includes("/"))) return false;

  const orgId = segments[2];
  if (!/^\d+$/.test(orgId ?? "")) return false;

  if (segments.length === 3) return false;

  const rest = segments.slice(3);

  /** Hosted spec: `/v1/organization/{orgId}/cart/{cartId}` (+ `cart-item`, `finalize`). */
  if (rest[0] === "cart") {
    if (rest.length < 2 || !/^\d+$/.test(rest[1]!)) return false;
    if (rest.length === 2) return true;
    if (rest.length === 3 && rest[2] === "finalize") return true;
    if (rest.length === 4 && rest[2] === "cart-item" && /^\d+$/.test(rest[3]!)) return true;
    return false;
  }

  return true;
}

function userHeadersFrom(request: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  const access =
    request.headers.get("x-bonduseraccesstoken") ?? request.cookies.get(BOND_COOKIE_ACCESS)?.value;
  const id = request.headers.get("x-bonduseridtoken") ?? request.cookies.get(BOND_COOKIE_ID)?.value;
  const username =
    request.headers.get("x-bonduserusername") ??
    request.cookies.get(BOND_COOKIE_USERNAME)?.value;
  if (access) out["X-BondUserAccessToken"] = access;
  if (id) out["X-BondUserIdToken"] = id;
  if (username) out["X-BondUserUsername"] = decodeURIComponent(username);
  return out;
}

async function forward(
  request: NextRequest,
  segments: string[],
  init: RequestInit
): Promise<NextResponse> {
  const base = process.env.BOND_API_BASE_URL?.replace(/\/$/, "");
  const key = process.env.BOND_API_KEY;
  if (!base || !key) {
    return NextResponse.json(
      { error: "Missing BOND_API_BASE_URL or BOND_API_KEY" },
      { status: 500 }
    );
  }

  if (!isAllowedBondPath(segments)) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  const path = segments.join("/");
  const url = new URL(request.url);
  const target = `${base}/${path}${url.search}`;

  const res = await fetch(target, {
    ...init,
    headers: {
      "X-Api-Key": key,
      Accept: "application/json",
      ...userHeadersFrom(request),
      ...(init.headers as Record<string, string>),
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "application/json";
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return forward(request, path, { method: "GET" });
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const contentType = request.headers.get("content-type");
  const body = await request.text();
  return forward(request, path, {
    method: "POST",
    body: body || undefined,
    headers: contentType ? { "Content-Type": contentType } : {},
  });
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return forward(request, path, { method: "DELETE" });
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const contentType = request.headers.get("content-type");
  const body = await request.text();
  return forward(request, path, {
    method: "PUT",
    body: body || undefined,
    headers: contentType ? { "Content-Type": contentType } : {},
  });
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const contentType = request.headers.get("content-type");
  const body = await request.text();
  return forward(request, path, {
    method: "PATCH",
    body: body || undefined,
    headers: contentType ? { "Content-Type": contentType } : {},
  });
}
