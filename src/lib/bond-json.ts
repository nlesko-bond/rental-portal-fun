import { bondBffFetch } from "./bond-client";

export class BondBffError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "BondBffError";
    this.status = status;
    this.body = body;
  }
}

function previewNonJsonBody(text: string, max = 180): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (!oneLine) return "(empty body)";
  return oneLine.length > max ? `${oneLine.slice(0, max)}…` : oneLine;
}

function bondErrorMessageFromParsed(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  /** AWS API Gateway often uses capital `Message` (not Nest `message`). */
  const cap = o.Message;
  if (typeof cap === "string" && cap.length > 0) return cap;
  const m = o.message;
  if (typeof m === "string" && m.length > 0) return m;
  if (Array.isArray(m) && m.length > 0) {
    const lines = m.filter((x): x is string => typeof x === "string");
    if (lines.length > 0) return lines.join("; ");
  }
  if (m != null && typeof m === "object" && !Array.isArray(m)) {
    const nested = m as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.length > 0) return nested.message;
    const serialized = JSON.stringify(m);
    if (serialized !== "{}" && serialized !== "null") return serialized;
  }
  if (typeof o.error === "string" && o.error.length > 0) return o.error;
  return null;
}

async function bondBffJsonFromResponse<T>(res: Response): Promise<T> {
  const raw = await res.text();
  const text = raw.replace(/^\uFEFF/, "").trim();
  const contentType = res.headers.get("content-type") ?? "";

  let parsed: unknown;
  try {
    parsed = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    const hint =
      text.startsWith("<?xml") || contentType.includes("xml")
        ? " Often caused by BOND_API_BASE_URL ending in /public-api (Swagger). Use the host only, e.g. https://public.api.squad-c.bondsports.co"
        : "";
    throw new BondBffError(
      res.status,
      `Response was not JSON (${contentType || "unknown content-type"}).${hint}`,
      previewNonJsonBody(raw)
    );
  }
  if (!res.ok) {
    const extracted = bondErrorMessageFromParsed(parsed);
    const msg = extracted ?? `Request failed (${res.status})`;
    throw new BondBffError(res.status, msg, parsed);
  }
  return parsed as T;
}

export async function bondBffGetJson<T>(
  pathSegments: string[],
  searchParams?: URLSearchParams
): Promise<T> {
  const res = await bondBffFetch(pathSegments, { searchParams });
  return bondBffJsonFromResponse<T>(res);
}

/**
 * POST JSON to the BFF (e.g. `POST .../online-booking/create`). Uses cookies for JWT when set.
 */
export async function bondBffPostJson<T>(
  pathSegments: string[],
  body: unknown,
  searchParams?: URLSearchParams
): Promise<T> {
  const res = await bondBffFetch(pathSegments, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body ?? {}),
    searchParams,
  });
  return bondBffJsonFromResponse<T>(res);
}

/** DELETE via BFF; Bond may return 204 No Content. */
export async function bondBffDelete(pathSegments: string[], searchParams?: URLSearchParams): Promise<Response> {
  return bondBffFetch(pathSegments, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    searchParams,
  });
}

export async function bondBffDeleteJson<T>(
  pathSegments: string[],
  searchParams?: URLSearchParams
): Promise<T | null> {
  const res = await bondBffDelete(pathSegments, searchParams);
  if (res.status === 204) return null;
  const raw = await res.text();
  const text = raw.replace(/^\uFEFF/, "").trim();
  if (!text) {
    if (res.ok) return null;
    throw new BondBffError(res.status, `Request failed (${res.status})`, null);
  }
  const contentType = res.headers.get("content-type") ?? "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new BondBffError(
      res.status,
      `Response was not JSON (${contentType || "unknown content-type"}).`,
      previewNonJsonBody(raw)
    );
  }
  if (!res.ok) {
    const extracted = bondErrorMessageFromParsed(parsed);
    const msg = extracted ?? `Request failed (${res.status})`;
    throw new BondBffError(res.status, msg, parsed);
  }
  return parsed as T;
}
