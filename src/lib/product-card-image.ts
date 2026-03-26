import type { ExtendedProductDto } from "@/types/online-booking";

function hashPick(seed: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return modulo <= 0 ? 0 : h % modulo;
}

/** Slugs like `basket_ball` → words Bond may send from the portal. */
function normalizeForStockMatch(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mediaUrlFromProduct(product: ExtendedProductDto): string | undefined {
  const u = product.mainMedia?.url ?? product.media?.find((m) => m.url)?.url;
  return typeof u === "string" && u.trim() ? u.trim() : undefined;
}

function envPlaceholderUrl(): string | undefined {
  const v = process.env.NEXT_PUBLIC_BOOKING_PRODUCT_PLACEHOLDER_IMAGE;
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/**
 * Indoor / court imagery only — avoid track & field photos mistaken for “court”.
 * Unsplash often 404s older `photo-*` ids; keep this list to URLs that still resolve.
 */
const BASKETBALL_IMAGES = [
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577416412292-747c6607f055?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600534220378-df36338afc40?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615174438196-b3538fe68737?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1602357280104-742c517a1d82?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563302905-4830598613c0?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1572454181157-0b40dd7667fe?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559692048-79a3f837883d?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1709264407689-da8c63f63c2d?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1719521178357-64ac2316f0ea?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601391721091-4646369e0bb5?w=640&q=80&auto=format&fit=crop",
];

const SOCCER_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=640&q=80&auto=format&fit=crop",
];

const TENNIS_IMAGES = [
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599586120429-48281b6a0a3d?w=640&q=80&auto=format&fit=crop",
];

const VOLLEYBALL_IMAGES = [
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1592656094267-764a45160876?w=640&q=80&auto=format&fit=crop",
];

const BASEBALL_IMAGES = [
  "https://images.unsplash.com/photo-1566577739112-5180d4a8772a?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1471295253337-3ceaaed13298?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=640&q=80&auto=format&fit=crop",
];

const AMERICAN_FOOTBALL_IMAGES = [
  "https://images.unsplash.com/photo-1504450758481-7338bbe7529a?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1496886849808-1e5ef8361222?w=640&q=80&auto=format&fit=crop",
];

/** When activity slug is unknown — still rotate across several indoor / court photos (not one static URL). */
const GENERIC_INDOOR_SPORTS_IMAGES = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593079831263-33839b7ae2b5?w=640&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=640&q=80&auto=format&fit=crop",
];

type StockRow = {
  test: (s: string) => boolean;
  url: string | ((seed: string) => string);
};

const STOCK: StockRow[] = [
  {
    test: (s) => /american football|\bflag football\b|\bnfl\b/i.test(s),
    url: (seed) => AMERICAN_FOOTBALL_IMAGES[hashPick(seed, AMERICAN_FOOTBALL_IMAGES.length)]!,
  },
  {
    test: (s) => /soccer|foot\s*ball|futbol/i.test(s) && !/american|nfl/i.test(s),
    url: (seed) => SOCCER_IMAGES[hashPick(seed, SOCCER_IMAGES.length)]!,
  },
  {
    test: (s) => /basket\s*ball|basketball|hoops?/i.test(s),
    url: (seed) => BASKETBALL_IMAGES[hashPick(seed, BASKETBALL_IMAGES.length)]!,
  },
  {
    test: (s) => /tennis/i.test(s),
    url: (seed) => TENNIS_IMAGES[hashPick(seed, TENNIS_IMAGES.length)]!,
  },
  {
    test: (s) => /volleyball/i.test(s),
    url: (seed) => VOLLEYBALL_IMAGES[hashPick(seed, VOLLEYBALL_IMAGES.length)]!,
  },
  {
    test: (s) => /baseball|softball|batting/i.test(s),
    url: (seed) => BASEBALL_IMAGES[hashPick(seed, BASEBALL_IMAGES.length)]!,
  },
  {
    test: (s) => /pickle\s*ball|pickleball/i.test(s),
    url: (seed) => TENNIS_IMAGES[hashPick(seed, TENNIS_IMAGES.length)]!,
  },
  {
    test: (s) => /\b(cage|simulator|hittrax|batting\s*cage)\b/i.test(s),
    url: (seed) => BASEBALL_IMAGES[hashPick(seed, BASEBALL_IMAGES.length)]!,
  },
  {
    test: (s) => /\b(lacrosse|field hockey|ice hockey|hockey)\b/i.test(s),
    url: (seed) => SOCCER_IMAGES[hashPick(seed, SOCCER_IMAGES.length)]!,
  },
  {
    test: (s) => /\b(badminton|squash|racquetball)\b/i.test(s),
    url: (seed) => TENNIS_IMAGES[hashPick(seed, TENNIS_IMAGES.length)]!,
  },
];

function pickStock(needle: string, seed: string): string {
  const s = normalizeForStockMatch(needle);
  for (const row of STOCK) {
    if (row.test(s)) {
      return typeof row.url === "function" ? row.url(seed) : row.url;
    }
  }
  return GENERIC_INDOOR_SPORTS_IMAGES[hashPick(seed, GENERIC_INDOOR_SPORTS_IMAGES.length)]!;
}

/**
 * Stock art uses portal **activity** + **product name** (Bond slugs often omit the sport word),
 * with a stable per-product seed so the same service keeps the same image while different products vary.
 */
export function resolveCuratedStockImageUrl(product: ExtendedProductDto, activity: string): string {
  const seed = `${product.id}-${activity}`;
  const name = typeof product.name === "string" ? product.name : "";
  const needle = `${normalizeForStockMatch(activity)} ${name}`;
  return pickStock(needle, seed);
}

export type ProductCardImageFallbackStep = 0 | 1 | 2;

/**
 * Tiered sources so a broken Bond URL can fall back to activity-matched Unsplash before the SVG gradient.
 *
 * - **0:** API media → env placeholder → curated stock
 * - **1:** curated stock (skipped if step 0 was already stock-only, to avoid a load loop)
 * - **2:** deterministic SVG data URL
 */
export function resolveProductCardImageAtStep(
  product: ExtendedProductDto,
  activity: string,
  step: ProductCardImageFallbackStep
): string {
  const fromApi = mediaUrlFromProduct(product);
  const envUrl = envPlaceholderUrl();
  const curated = resolveCuratedStockImageUrl(product, activity);
  const svg = productPlaceholderSvgDataUrl(product, activity);

  if (step === 0) {
    if (fromApi) return fromApi;
    if (envUrl) return envUrl;
    return curated;
  }
  if (step === 1) {
    const primaryWasOnlyCurated = !fromApi && !envUrl;
    if (primaryWasOnlyCurated) return svg;
    return curated;
  }
  return svg;
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
 * Image for service card: Bond `mainMedia` / first `media[]` when present, else env default,
 * else activity/product-matched stock photo. Use {@link resolveProductCardImageAtStep} with a step counter
 * when handling `onError` on `<img>`.
 */
export function resolveProductCardImageSrc(product: ExtendedProductDto, activity: string): string {
  return resolveProductCardImageAtStep(product, activity, 0);
}

/** @deprecated Prefer `resolveProductCardImageAtStep(..., 2)` — kept for older call sites. */
export function productCardBackgroundFallback(product: ExtendedProductDto, activity: string): string {
  return resolveProductCardImageAtStep(product, activity, 2);
}
