import { describe, expect, it } from "vitest";
import { parseProductFormIds } from "@/lib/product-form-ids";
import type { ExtendedProductDto } from "@/types/online-booking";

describe("parseProductFormIds", () => {
  it("preserves the order Bond returns for product forms", () => {
    const product = {
      forms: [{ id: 30 }, { id: 10 }, { id: 20 }],
      questionnaireIds: [10, 40],
    } as unknown as ExtendedProductDto;

    expect(parseProductFormIds(product)).toEqual([30, 10, 20, 40]);
  });
});
