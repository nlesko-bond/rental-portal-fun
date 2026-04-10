import type { ExtendedRequiredProductNode } from "@/lib/required-products-extended";
import {
  isMembershipRequiredProduct,
  parseExtendedRequiredProductsList,
  partitionMembershipVsOtherRequired,
} from "@/lib/required-products-extended";
import { parseRequiredProductsResponse } from "@/lib/required-products-parse";

/**
 * True when `GET .../products/{productId}/user/{userId}/required` still lists at least one
 * membership the user must add. Bond sets **`required: false`** on a row when the user
 * already satisfies it (e.g. holds the membership) — those rows must be ignored here.
 */
export function userNeedsMembershipFromRequiredResponse(raw: unknown): boolean {
  const extended = parseExtendedRequiredProductsList(raw);
  if (extended.length > 0) {
    const { membershipOptions } = partitionMembershipVsOtherRequired(extended);
    return membershipOptions.some((n) => n.required !== false);
  }
  const legacy = parseRequiredProductsResponse(raw);
  return legacy.some((r) => {
    if (!isMembershipRequiredProduct(r as ExtendedRequiredProductNode)) return false;
    if (r.required === false) return false;
    return true;
  });
}

/**
 * True when this rental product lists at least one **membership** gate in GET …/required (extended or legacy).
 * Used to show “has qualifying membership” vs “needs membership” only when the **product** requires it — not for
 * unrelated account-level tier badges.
 */
export function membershipRequiredForProductFromResponse(raw: unknown): boolean {
  const extended = parseExtendedRequiredProductsList(raw);
  if (extended.length > 0) {
    const { membershipOptions } = partitionMembershipVsOtherRequired(extended);
    return membershipOptions.length > 0;
  }
  const legacy = parseRequiredProductsResponse(raw);
  return legacy.some((r) => isMembershipRequiredProduct(r as ExtendedRequiredProductNode));
}
