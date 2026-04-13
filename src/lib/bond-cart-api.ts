import { bondBffDeleteJson, bondBffGetJson, bondBffPostJson } from "@/lib/bond-json";
import type { OrganizationCartDto } from "@/types/online-booking";

/** Path prefix: `v1/organization/{orgId}/cart/{cartId}` (singular `cart` per hosted OpenAPI). */
function cartPath(orgId: number, cartId: number): string[] {
  return ["v1", "organization", String(orgId), "cart", String(cartId)];
}

export async function getOrganizationCart(orgId: number, cartId: number): Promise<OrganizationCartDto> {
  return bondBffGetJson<OrganizationCartDto>(cartPath(orgId, cartId));
}

export async function removeCartItem(
  orgId: number,
  cartId: number,
  cartItemId: number
): Promise<unknown | null> {
  return bondBffDeleteJson<unknown>([...cartPath(orgId, cartId), "cart-item", String(cartItemId)]);
}

/**
 * Close / abandon cart (`DELETE …/cart/{cartId}` per hosted OpenAPI).
 *
 * If Bond’s API Gateway returns **403** / `execute-api:Invoke` denied, DELETE is not enabled for this
 * consumer route on the deployed stage — that is a **Bond/AWS** policy fix, not this app.
 */
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
