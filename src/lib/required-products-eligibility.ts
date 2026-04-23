import type { ExtendedRequiredProductNode } from "@/lib/required-products-extended";
import {
  isMembershipRequiredProduct,
  parseExtendedRequiredProductsList,
  partitionMembershipVsOtherRequired,
} from "@/lib/required-products-extended";
import { parseRequiredProductsResponse } from "@/lib/required-products-parse";

/**
 * True when `GET .../products/{productId}/user/{userId}/required` lists membership options
 * the user hasn't satisfied yet. Top-level memberships are **OR options** (pick any one), so
 * the user is eligible as soon as Bond marks **any** option with `required: false`. The gate
 * only shows when no membership in the list is satisfied.
 */
export function userNeedsMembershipFromRequiredResponse(raw: unknown): boolean {
  const extended = parseExtendedRequiredProductsList(raw);
  if (extended.length > 0) {
    const { membershipOptions } = partitionMembershipVsOtherRequired(extended);
    if (membershipOptions.length === 0) return false;
    return !membershipOptions.some((n) => n.required === false);
  }
  const legacy = parseRequiredProductsResponse(raw);
  const memberships = legacy.filter((r) => isMembershipRequiredProduct(r as ExtendedRequiredProductNode));
  if (memberships.length === 0) return false;
  return !memberships.some((r) => r.required === false);
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
