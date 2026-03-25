import { BondBffError } from "./bond-json";

export type BondApiErrorBody = {
  statusCode?: number;
  code?: string;
  message?: string;
  path?: string;
  timestamp?: string;
};

export function asBondApiErrorBody(body: unknown): BondApiErrorBody | null {
  if (!body || typeof body !== "object") return null;
  return body as BondApiErrorBody;
}

/** User-facing line: message plus code when useful. */
export function formatBondUserMessage(err: BondBffError): string {
  const body = asBondApiErrorBody(err.body);
  const code = body?.code;
  const base = err.message || "Request failed";
  if (code && !base.includes(code)) {
    return `${base} (${code})`;
  }
  return base;
}

export function extractEarliestBookableInstantFromNoticeMessage(message: string): string | null {
  const quoted = message.match(/which\s+is\s+["']([^"']+)["']/i);
  if (quoted?.[1]) return normalizeInstant(quoted[1]);
  const iso = message.match(/(\d{4}-\d{2}-\d{2}[tT]\d{2}:\d{2}:\d{2}(?:\.\d+)?)/);
  if (iso?.[1]) return normalizeInstant(iso[1]);
  return null;
}

function normalizeInstant(s: string): string {
  return s.trim().replace("t", "T");
}

/** Calendar key Bond uses in `dates[]` — notice payloads usually include it as the date prefix of the instant. */
export function calendarDateKeyFromNoticeInstant(iso: string): string {
  return normalizeInstant(iso).slice(0, 10);
}

export function isScheduleMinimumNoticeViolation(err: unknown): err is BondBffError {
  if (!(err instanceof BondBffError) || err.status !== 400) return false;
  const b = asBondApiErrorBody(err.body);
  return b?.code === "SCHEDULE.MINIMUM_NOTICE_VIOLATION";
}
