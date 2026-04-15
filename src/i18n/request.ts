import { readFileSync } from "node:fs";
import path from "node:path";
import { getRequestConfig } from "next-intl/server";

/** Read JSON from disk so dev (Turbopack) always picks up new keys without a full restart. */
function loadEnMessages(): Record<string, unknown> {
  const filePath = path.join(process.cwd(), "messages", "en.json");
  return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
}

export default getRequestConfig(async () => ({
  locale: "en",
  messages: loadEnMessages(),
}));
