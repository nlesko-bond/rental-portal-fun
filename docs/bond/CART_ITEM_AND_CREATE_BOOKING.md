# Cart items vs `POST …/online-booking/create` (DTO map)

**Swagger** is authoritative; this file only ties **this repo** to the shapes you pasted.

## Response: `OrganizationCartDto`

| Field | Role |
|--------|------|
| `cartItems[]` | Priced lines Bond put on the cart. |
| `cartItems[].metadata` | `CartItemMetadataDto`: `description` uses **`CartItemDescriptionEnum`**, `isAddon` boolean. |
| `cartItems[].product` | Nested product (name, ids, etc.). |

**`CartItemDescriptionEnum`** tells you what Bond **classified** the line as *after* pricing (rental vs add-on vs membership, and add-on *kind*). It is **not** sent by the portal on create; it appears on the **response**.

**Parsing in this repo:** `getBondCartReceiptLineItems` / `aggregateBagCartLineBuckets` prefer `metadata.description` when present, then fall back to `metadata.isAddon` / `isAddon` / `product.productType` heuristics.

## Request: `CreateBookingDto` (operation `cartReservation`)

The hosted spec may not inline `requestBody` in every export; the body is still required at runtime.

| Field | This repo |
|--------|-----------|
| `segments[]` | Built in `buildOnlineBookingCreateBody` — one segment per picked slot (`spaceId`, `activity`, `facilityId`, `productId`, `slots[]`). |
| `addons[]` (root) | `{ productId, quantity }[]` — reservation-scoped optional add-ons. See `splitAddonPayloadForCreate` → `addonProductIdsToAddonDtos`. |
| `segments[i].addons[]` | Same shape — slot/hour add-ons for that segment’s slot (from user targeting). |
| `requiredProducts[]` | `{ productId, userId, quantity, unitPrice? }[]` — only products the customer is actively purchasing. Products returned by required-products with `required: false` are already satisfied eligibility and must not be sent as cart items. |
| `cartId` | Optional existing cart id when merging a new booking into the cart. Purchased `requiredProducts[]` still go with the merge payload. |
| `answers[]` | Questionnaire answers grouped by `userId`. |

**Why not `CartItemDescriptionEnum` on the request?** That enum describes **cart lines Bond returns**. For **create**, Bond expects **product ids** and **where** they attach (root vs segment). This portal derives “reservation vs slot/hour” from **`GET …/products` → `packages[]`** rows with `isAddon: true` and **`level`** (`reservation` \| `slot` \| `hour`) — see `product-package-addons.ts`. That lines up with Bond’s add-on **products**, not with `metadata.description` (which exists only after the cart exists).

## Quick mapping

| Catalog (`packages[].level`) | Create payload |
|------------------------------|----------------|
| `reservation` | id + qty in **root** `addons[]`. |
| `slot` / `hour` | id + qty in **`segments[i].addons[]`** for each targeted slot segment. |

| Response (`metadata.description`) | Receipt bucket |
|-----------------------------------|----------------|
| `reservation_type_rental`, `reservation_type_lesson`, … | Bookings |
| `*_addon` variants, `goods`, … | Add-ons |
| `membership`, `membership_package_child_item` | Memberships |

## Required products vs satisfied memberships

`GET .../products/{productId}/user/{userId}/required` serves two purposes:

- **Eligibility:** nodes marked `required: false` mean the user already satisfies that required product. Use this to suppress the membership gate.
- **Purchase options:** nodes still required can be selected in checkout. Only selected/purchased nodes and their nested required products belong in `POST .../online-booking/create` `requiredProducts[]`.

Do not infer membership type, audience, renewal cadence, or expiration from product names. Use structured fields from the required-products/cart payload (`customerType`, `membershipType`, `durationMonths`, `endDate`, nested membership/resource records) and render less detail when Bond omits the field.

## Debugging missing add-on or membership lines

1. **Request shape** — See `docs/bond/create-booking-dto.schema.json`. The portal sends **`addons[]`** (root + per segment) with quantities, **`requiredProducts[]`** only for active purchases, optional **`cartId`**, **`answers`**, plus full **`segments[]`**. The BFF forwards JSON **unchanged** (`src/app/api/bond/[...path]/route.ts`).
2. **If the response has no add-on rows** — `cartItems` may be a **tree** (`children[]`). This repo flattens that for display (`flattenBondCartItemNodes` in `checkout-bag-totals.ts`). If add-on **product ids appear in the request** but **no** matching lines exist anywhere under `cartItems` / `children`, Bond did not attach those products to the cart (server rules, eligibility, or **id type** mismatch).
3. **If membership rows are missing** — confirm the membership products were actually selected for purchase. Already-owned memberships should suppress the gate and should not be in `requiredProducts[]`.
4. **IDs** — We send **nested add-on product ids** from `GET …/products` → `packages[]` → nested `product`, and required product ids from `GET …/required`. If the API expects **package** ids or another identifier, only **Swagger / Bond** can confirm; compare with a known-good request from Bond backoffice or support.
