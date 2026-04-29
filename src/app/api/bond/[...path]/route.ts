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

function safeDecodeURIComponent(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
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
  if (username) out["X-BondUserUsername"] = safeDecodeURIComponent(username);
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

  /**
   * Temporary BFF debug: when a `finalize` call returns 4xx/5xx, log both the request body we
   * forwarded and the Bond response so we can diagnose `INVALID_PAYMENT_AMOUNT` and friends in
   * dev. Remove once the deposit-amount math is locked.
   */
  if (segments[3] === "cart" && segments[5] === "finalize" && res.status >= 400) {
    let reqBodyText = "(no body)";
    if (typeof init.body === "string") reqBodyText = init.body;
    const respText = new TextDecoder().decode(body);
    // eslint-disable-next-line no-console
    console.error("[bond-bff] finalize failed", {
      status: res.status,
      cartPath: path,
      reqBody: reqBodyText,
      respBody: respText.slice(0, 1000),
    });
  }

  /**
   * Temporary BFF debug: snapshot Bond's price-shape fields on every cart GET so we can compare
   * `minimumDownpayment` / `minimumPrice` / `price` to whatever we eventually send on finalize.
   * Remove once the deposit-amount math is locked.
   */
  if (
    init.method === "GET" &&
    segments[3] === "cart" &&
    segments.length === 5 &&
    res.status === 200
  ) {
    try {
      const json = JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>;
      const flattenForLog = (
        nodes: unknown[] | undefined,
      ): Array<Record<string, unknown>> => {
        if (!Array.isArray(nodes)) return [];
        const out: Array<Record<string, unknown>> = [];
        for (const raw of nodes) {
          if (!raw || typeof raw !== "object") continue;
          const it = raw as Record<string, unknown>;
          const meta = (it.metadata as Record<string, unknown> | undefined) ?? null;
          const prod = (it.product as Record<string, unknown> | undefined) ?? null;
          out.push({
            id: it.id,
            itemName: it.name,
            itemTitle: it.title,
            productId: it.productId ?? prod?.id,
            productName: prod?.name,
            productExtraNameKeys: prod
              ? Object.keys(prod).filter((k) => /name/i.test(k) && k !== "name")
              : [],
            amount: it.amount ?? it.price ?? it.subtotal,
            purchaseType: meta?.purchaseType ?? it.purchaseType,
            isAddon: it.isAddon,
            itemDownPayment: it.downPayment ?? it.downpayment,
            productDownPayment: prod?.downPayment ?? prod?.downpayment,
          });
          if (Array.isArray(it.children)) out.push(...flattenForLog(it.children as unknown[]));
        }
        return out;
      };
      // eslint-disable-next-line no-console
      console.log("[bond-bff] cart GET shape", JSON.stringify({
        cartPath: path,
        price: json.price,
        minimumPrice: json.minimumPrice,
        downpayment: json.downpayment ?? (json as { downPayment?: unknown }).downPayment,
        minimumDownpayment: json.minimumDownpayment,
        purchaseType: json.purchaseType,
        topLevelKeys: Object.keys(json),
        items: flattenForLog(json.cartItems as unknown[] | undefined),
      }, null, 2));
    } catch {
      /* ignore non-JSON payloads */
    }
  }

  /**
   * Temporary BFF debug: snapshot the required-products tree so we can confirm where Bond stores
   * membership renewal cadence (`durationMonths`?) vs fixed-price expiration (`endDate`?). Used by
   * `membershipFrequencyLabel` in `src/lib/required-products-extended.ts`. Remove once verified.
   */
  if (
    init.method === "GET" &&
    /\/products\/\d+\/user\/\d+\/required/.test(path) &&
    body.byteLength > 0
  ) {
    try {
      const json = JSON.parse(new TextDecoder().decode(body)) as unknown;
      const rows: Array<Record<string, unknown>> = Array.isArray(json)
        ? (json as Array<Record<string, unknown>>)
        : Array.isArray((json as { data?: unknown })?.data)
          ? ((json as { data: Array<Record<string, unknown>> }).data)
          : [];
      const summarize = (n: Record<string, unknown>): unknown => {
        const product = n.product as Record<string, unknown> | undefined;
        const resource = (n.resource ?? product?.resource) as Record<string, unknown> | undefined;
        const membership = (resource?.membership ?? n.membership) as Record<string, unknown> | undefined;
        const pkgs = Array.isArray(n.packages) ? (n.packages as Array<Record<string, unknown>>) : [];
        const packagesSummary = pkgs.length === 0 ? null : pkgs.map((p) => ({
          id: p.id,
          name: p.name,
          allKeys: Object.keys(p),
          durationMonths: p.durationMonths ?? p.lengthMonths ?? p.months,
          renewalInterval: p.renewalInterval ?? p.recurrenceInterval ?? p.interval ?? p.cadence ?? p.frequency,
          renewalCount: p.renewalCount ?? p.recurrenceCount,
          isRenewing: p.isRenewing ?? p.autoRenew,
          startDate: p.startDate,
          endDate: p.endDate,
          full: p,
        }));
        return {
          id: n.id,
          name: n.name,
          productType: n.productType,
          productSubType: n.productSubType,
          required: n.required,
          quantity: n.quantity,
          description: typeof n.description === "string" ? (n.description as string).slice(0, 240) : n.description,
          allKeys: Object.keys(n),
          membershipKeys: membership ? Object.keys(membership) : null,
          durationMonths: membership?.durationMonths ?? n.durationMonths,
          endDate: membership?.endDate ?? n.endDate ?? product?.endDate,
          expirationDate:
            membership?.expirationDate ?? n.expirationDate ?? product?.expirationDate,
          validUntil: membership?.validUntil ?? n.validUntil ?? product?.validUntil,
          pricesFull: Array.isArray(n.prices) ? n.prices : null,
          packagesSummary,
          nestedSummary: Array.isArray(n.requiredProducts)
            ? (n.requiredProducts as Array<Record<string, unknown>>).map(summarize)
            : null,
        };
      };
      // eslint-disable-next-line no-console
      console.log("[bond-bff] required products shape", JSON.stringify({
        path,
        count: rows.length,
        rows: rows.map(summarize),
      }, null, 2));
    } catch {
      /* ignore non-JSON */
    }
  }

  /**
   * Temporary BFF debug: snapshot product list response so we can identify which name field the
   * online (consumer) UI should use vs the back-office name, and which downpayment field the
   * deposit logic should read. Remove after the cart-naming + deposit fix.
   */
  if (
    init.method === "GET" &&
    /\/category\/\d+\/products/.test(path) &&
    body.byteLength > 0
  ) {
    try {
      const json = JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>;
      const data = Array.isArray(json.data) ? (json.data as Array<Record<string, unknown>>) : [];
      const findDeepDeposit = (
        v: unknown,
        breadcrumbs: string,
        out: Array<{ path: string; value: unknown }>,
        depth = 0,
      ): void => {
        if (depth > 4 || !v) return;
        if (Array.isArray(v)) {
          for (let i = 0; i < Math.min(v.length, 4); i++) {
            findDeepDeposit(v[i], `${breadcrumbs}[${i}]`, out, depth + 1);
          }
          return;
        }
        if (typeof v !== "object") return;
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
          if (/down\s*payment|deposit|min(imum)?\s*pay|min(imum)?\s*price/i.test(k)) {
            out.push({ path: `${breadcrumbs}.${k}`, value: val });
          }
          findDeepDeposit(val, `${breadcrumbs}.${k}`, out, depth + 1);
        }
      };

      const sample = data.map((p) => {
        const nameFields: Record<string, unknown> = {};
        for (const k of Object.keys(p)) {
          if (/name|title|displayName|consumer|online/i.test(k)) nameFields[k] = p[k];
        }
        const depositFinds: Array<{ path: string; value: unknown }> = [];
        findDeepDeposit(p, "$", depositFinds);
        return {
          id: p.id,
          name: p.name,
          allKeys: Object.keys(p),
          nameFields,
          depositFinds,
          pricesPreview: Array.isArray(p.prices) ? (p.prices as unknown[]).slice(0, 3) : undefined,
        };
      });
      // eslint-disable-next-line no-console
      console.log("[bond-bff] products shape", JSON.stringify({ path, count: data.length, sample }, null, 2));
    } catch {
      /* ignore non-JSON */
    }
  }

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
