import { isBondIllegalPriceError, isBondMissingCartItemError } from "@/lib/bond-errors";
import {
  allBondFlatLineIndices,
  bondRemovableCartItemIdsForIndices,
  bondRootCartItemIdForRemoval,
} from "@/lib/bond-cart-removal";
import { bondBffDeleteJson, bondBffGetJson, bondBffPostJson } from "@/lib/bond-json";
import type { OrganizationCartDto } from "@/types/online-booking";

/**
 * Hosted OpenAPI (`bond-public-api.json`, `carts-public-api`):
 *
 * - **GET** `…/cart/{cartId}` — `getCart`
 * - **DELETE** `…/cart/{cartId}` — `closeCart` (no body; path + JWT + API key only)
 * - **DELETE** `…/cart/{cartId}/cart-item/{cartItemId}` — `removeCartItem` (no body)
 *
 * There is **no requestBody** on these DELETE operations. Wrong paths or extra JSON will not fix
 * `{"Message":"…execute-api:Invoke…"}` — that response is **AWS API Gateway** (wrong `BOND_API_BASE_URL`,
 * IAM-only execute-api URL, or API key policy missing **DELETE** on that route). Match the same base URL
 * devs use (e.g. `https://public.api.squad-c.bondsports.co` with **no** `/public-api` suffix).
 */
function cartPath(orgId: number, cartId: number): string[] {
  return ["v1", "organization", String(orgId), "cart", String(cartId)];
}

export async function getOrganizationCart(orgId: number, cartId: number): Promise<OrganizationCartDto> {
  return bondBffGetJson<OrganizationCartDto>(cartPath(orgId, cartId));
}

/**
 * After `CART.MISSING_CART_ITEM`, try reservation root then other removable line ids from a fresh cart
 * (stale id / wrong line id from merged UI).
 */
async function removeOneLineAfterMissingCartItem(
  orgId: number,
  cartId: number,
  fresh: OrganizationCartDto,
  cartFlatLineIndices?: readonly number[]
): Promise<OrganizationCartDto | null> {
  const tried = new Set<number>();
  const tryRemove = async (id: number | null): Promise<OrganizationCartDto | null> => {
    if (id == null || !Number.isFinite(id) || id <= 0 || tried.has(id)) return null;
    tried.add(id);
    try {
      return await removeCartItem(orgId, cartId, id);
    } catch (e) {
      if (isBondMissingCartItemError(e)) return null;
      throw e;
    }
  };

  let result = await tryRemove(bondRootCartItemIdForRemoval(fresh, cartFlatLineIndices));
  if (result != null) return result;

  const indices =
    cartFlatLineIndices != null && cartFlatLineIndices.length > 0
      ? [...cartFlatLineIndices]
      : allBondFlatLineIndices(fresh);
  for (const id of bondRemovableCartItemIdsForIndices(fresh, indices)) {
    result = await tryRemove(id);
    if (result != null) return result;
  }
  return null;
}

/** OpenAPI `removeCartItem` returns updated `OrganizationCartDto` on 200. */
export async function removeCartItem(
  orgId: number,
  cartId: number,
  cartItemId: number
): Promise<OrganizationCartDto | null> {
  return bondBffDeleteJson<OrganizationCartDto>([...cartPath(orgId, cartId), "cart-item", String(cartItemId)]);
}

/**
 * DELETE one line; if Bond responds with illegal-price repricing 400, retry once by removing the
 * reservation root for this snapshot (removes the whole booking subtree Bond ties together).
 */
export async function removeCartItemWithIllegalPriceFallback(
  orgId: number,
  cartId: number,
  cartItemId: number,
  cart: OrganizationCartDto,
  cartFlatLineIndices?: readonly number[]
): Promise<OrganizationCartDto | null> {
  try {
    return await removeCartItem(orgId, cartId, cartItemId);
  } catch (e) {
    if (isBondMissingCartItemError(e)) {
      const fresh = await getOrganizationCart(orgId, cartId);
      const recovered = await removeOneLineAfterMissingCartItem(orgId, cartId, fresh, cartFlatLineIndices);
      if (recovered != null) return recovered;
      throw e;
    }
    if (!isBondIllegalPriceError(e)) throw e;
    const rootId = bondRootCartItemIdForRemoval(cart, cartFlatLineIndices);
    if (rootId == null || rootId === cartItemId) throw e;
    return removeCartItem(orgId, cartId, rootId);
  }
}

/**
 * DELETE multiple lines in order; if Bond returns illegal price mid-way (stale tree / bundle rules),
 * GET a fresh cart and remove the reservation root once.
 */
export async function removeCartItemsSequentiallyWithFallback(
  orgId: number,
  cartId: number,
  cartItemIds: readonly number[],
  cartFlatLineIndices: readonly number[] | undefined,
  getFreshCart: () => Promise<OrganizationCartDto>
): Promise<OrganizationCartDto | null> {
  let updated: OrganizationCartDto | null = null;
  try {
    for (const id of cartItemIds) {
      updated = await removeCartItem(orgId, cartId, id);
    }
    return updated;
  } catch (e) {
    if (isBondMissingCartItemError(e)) {
      const fresh = await getFreshCart();
      const recovered = await removeOneLineAfterMissingCartItem(orgId, cartId, fresh, cartFlatLineIndices);
      if (recovered != null) return recovered;
      throw e;
    }
    if (!isBondIllegalPriceError(e)) throw e;
    const fresh = await getFreshCart();
    const rootId = bondRootCartItemIdForRemoval(fresh, cartFlatLineIndices);
    if (rootId == null) throw e;
    return removeCartItem(orgId, cartId, rootId);
  }
}

/** Close / abandon cart — see module docblock for OpenAPI + AWS troubleshooting. */
export async function closeCart(orgId: number, cartId: number): Promise<unknown | null> {
  return bondBffDeleteJson<unknown>([...cartPath(orgId, cartId)]);
}

/** Best-effort abandon (e.g. before logout while JWT is still valid). Ignores failures per cart. */
export async function closeOrganizationCartsBestEffort(orgId: number, cartIds: Iterable<number>): Promise<void> {
  const seen = new Set<number>();
  for (const raw of cartIds) {
    const id = typeof raw === "number" && Number.isFinite(raw) ? raw : Number(raw);
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    try {
      await closeCart(orgId, id);
    } catch {
      /* cart already finalized, expired, or session lost */
    }
  }
}

/**
 * Pay or submit-for-approval finalization; body must match Swagger
 * (`paymentMethodId`, `amountToPay` when Bond validates `CART.INVALID_PAYMENT_AMOUNT`, etc.).
 */
export async function finalizeCart(
  orgId: number,
  cartId: number,
  body: Record<string, unknown>
): Promise<unknown> {
  return bondBffPostJson<unknown>([...cartPath(orgId, cartId), "finalize"], body);
}
