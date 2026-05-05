import type { ExtendedProductDto } from "@/types/online-booking";

function mediaUrlFromProduct(product: ExtendedProductDto): string | undefined {
  const u = product.mainMedia?.url ?? product.media?.find((m) => m.url)?.url;
  return typeof u === "string" && u.trim() ? u.trim() : undefined;
}

function envPlaceholderUrl(): string | undefined {
  const v = process.env.NEXT_PUBLIC_BOOKING_PRODUCT_PLACEHOLDER_IMAGE;
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export type ProductCardImageFallbackStep = 0 | 1 | 2;

/**
 * Source priority for product card art:
 *
 * - **0:** Bond `mainMedia.url` (from products API with `expand=media`) → first `media[]` entry
 *   → `NEXT_PUBLIC_BOOKING_PRODUCT_PLACEHOLDER_IMAGE` → deterministic SVG gradient.
 * - **1, 2:** SVG gradient (used when the previous tier's image fired `onError`).
 */
export function resolveProductCardImageAtStep(
  product: ExtendedProductDto,
  activity: string,
  step: ProductCardImageFallbackStep
): string {
  if (step === 0) {
    const fromApi = mediaUrlFromProduct(product);
    if (fromApi) return fromApi;
    const envUrl = envPlaceholderUrl();
    if (envUrl) return envUrl;
  }
  return productPlaceholderSvgDataUrl(product, activity);
}

/** Deterministic abstract SVG when no remote image succeeds (no external fetch). */
export function productPlaceholderSvgDataUrl(product: ExtendedProductDto, activity: string): string {
  const seed = `${product.id}-${product.name}-${activity}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const c1 = `hsl(${h % 360} 42% 42%)`;
  const c2 = `hsl(${(h >> 8) % 360} 38% 58%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#g)"/>
    <circle cx="480" cy="80" r="120" fill="#fff" opacity="0.08"/>
    <circle cx="120" cy="280" r="90" fill="#fff" opacity="0.06"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Image source for service cards: Bond `mainMedia` / first `media[]` when present, else env
 * placeholder, else a deterministic SVG gradient. Use {@link resolveProductCardImageAtStep} with
 * a step counter when handling `onError` on `<img>`.
 */
export function resolveProductCardImageSrc(product: ExtendedProductDto, activity: string): string {
  return resolveProductCardImageAtStep(product, activity, 0);
}
