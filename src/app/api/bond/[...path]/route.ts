import { NextRequest, NextResponse } from "next/server";
import { BOND_COOKIE_ACCESS, BOND_COOKIE_ID } from "@/lib/bond-auth-cookies";

function isAllowedBondPath(segments: string[]): boolean {
  if (segments.length < 3) return false;
  if (segments[0] !== "v1" || segments[1] !== "organization") return false;
  if (segments.some((s) => s.includes("..") || s.includes("/"))) return false;
  return true;
}

function userHeadersFrom(request: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  const access =
    request.headers.get("x-bonduseraccesstoken") ?? request.cookies.get(BOND_COOKIE_ACCESS)?.value;
  const id = request.headers.get("x-bonduseridtoken") ?? request.cookies.get(BOND_COOKIE_ID)?.value;
  if (access) out["X-BondUserAccessToken"] = access;
  if (id) out["X-BondUserIdToken"] = id;
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
