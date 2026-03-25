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

export async function bondBffGetJson<T>(
  pathSegments: string[],
  searchParams?: URLSearchParams
): Promise<T> {
  const res = await bondBffFetch(pathSegments, { searchParams });
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
    let msg = `Request failed (${res.status})`;
    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      if (typeof o.message === "string" && o.message.length > 0) {
        msg = o.message;
      } else if (typeof o.error === "string" && o.error.length > 0) {
        msg = o.error;
      }
    }
    throw new BondBffError(res.status, msg, parsed);
  }
  return parsed as T;
}
