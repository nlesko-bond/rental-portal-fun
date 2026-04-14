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

/** OpenAPI `removeCartItem` returns updated `OrganizationCartDto` on 200. */
export async function removeCartItem(
  orgId: number,
  cartId: number,
  cartItemId: number
): Promise<OrganizationCartDto | null> {
  return bondBffDeleteJson<OrganizationCartDto>([...cartPath(orgId, cartId), "cart-item", String(cartItemId)]);
}

/** Close / abandon cart — see module docblock for OpenAPI + AWS troubleshooting. */
export async function closeCart(orgId: number, cartId: number): Promise<unknown | null> {
  return bondBffDeleteJson<unknown>([...cartPath(orgId, cartId)]);
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
