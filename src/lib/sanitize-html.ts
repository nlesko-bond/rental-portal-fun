import DOMPurify from "dompurify";
import type { Config } from "dompurify";

const SANITIZE_OPTS: Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "div",
    "span",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel", "width", "height", "colspan", "rowspan"],
  ALLOW_DATA_ATTR: false,
};

/**
 * Rich text from Bond (HTML). Call only in the browser — DOMPurify needs `window`.
 */
export function sanitizeBookingDescriptionHtml(html: string): string {
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, SANITIZE_OPTS);
}
