import type { ExtendedRequiredProductNode } from "@/lib/required-products-extended";
import {
  isMembershipRequiredProduct,
  parseExtendedRequiredProductsList,
  partitionMembershipVsOtherRequired,
} from "@/lib/required-products-extended";
import { parseRequiredProductsResponse } from "@/lib/required-products-parse";

/**
 * True when `GET .../products/{productId}/user/{userId}/required` still lists at least one
 * membership the user must add (they do not already satisfy it). Used for UI hints only.
 */
export function userNeedsMembershipFromRequiredResponse(raw: unknown): boolean {
  const extended = parseExtendedRequiredProductsList(raw);
  if (extended.length > 0) {
    const { membershipOptions } = partitionMembershipVsOtherRequired(extended);
    return membershipOptions.length > 0;
  }
  const legacy = parseRequiredProductsResponse(raw);
  return legacy.some((r) => isMembershipRequiredProduct(r as ExtendedRequiredProductNode));
}
