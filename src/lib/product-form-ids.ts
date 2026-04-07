import type { ExtendedProductDto } from "@/types/online-booking";

function pushParsedIds(raw: unknown, into: Set<number>): void {
  if (!Array.isArray(raw)) return;
  for (const item of raw) {
    if (typeof item === "number" && Number.isFinite(item)) {
      into.add(item);
      continue;
    }
    if (item && typeof item === "object" && "id" in item) {
      const id = Number((item as { id: unknown }).id);
      if (Number.isFinite(id)) into.add(id);
      continue;
    }
    if (typeof item === "string" && /^\d+$/.test(item)) {
      into.add(Number(item));
    }
  }
}

/**
 * Questionnaire IDs for checkout: Bond may send `forms`, `questionnaireIds`, and/or
 * `questionnairesIds` (see `ExtendedProductDto` in [Bond Public API](https://public.api.squad-c.bondsports.co/public-api/bond-public-api.json)).
 */
export function parseProductFormIds(product: ExtendedProductDto | undefined): number[] {
  if (!product) return [];
  const into = new Set<number>();
  pushParsedIds(product.forms, into);
  pushParsedIds(product.questionnaireIds, into);
  pushParsedIds(product.questionnairesIds, into);
  return [...into].sort((a, b) => a - b);
}
