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
| `addonProductIds` (root) | **Reservation-scoped** optional add-ons + **required** product ids + ids not found on `product.packages` — see `splitAddonPayloadForCreate`. |
| `segments[i].addonProductIds` | **Slot** / **hour** optional add-ons that apply to that segment’s slot, from user targeting — same split. |

**Why not `CartItemDescriptionEnum` on the request?** That enum describes **cart lines Bond returns**. For **create**, Bond expects **product ids** and **where** they attach (root vs segment). This portal derives “reservation vs slot/hour” from **`GET …/products` → `packages[]`** rows with `isAddon: true` and **`level`** (`reservation` \| `slot` \| `hour`) — see `product-package-addons.ts`. That lines up with Bond’s add-on **products**, not with `metadata.description` (which exists only after the cart exists).

## Quick mapping

| Catalog (`packages[].level`) | Create payload |
|------------------------------|----------------|
| `reservation` | id in **root** `addonProductIds`. |
| `slot` / `hour` | id in **`segments[i].addonProductIds`** for each targeted slot segment. |

| Response (`metadata.description`) | Receipt bucket |
|-----------------------------------|----------------|
| `reservation_type_rental`, `reservation_type_lesson`, … | Bookings |
| `*_addon` variants, `goods`, … | Add-ons |
| `membership`, `membership_package_child_item` | Memberships |

## Debugging missing add-on lines

1. **Request shape** — The create body is **not** “only” `addonProductIds`. Bond still expects the full booking DTO: `userId`, `onlineBookingPortalId`, `categoryId`, `segments[]` (each with `spaceId`, `activity`, `facilityId`, `productId`, `slots[]`), and optionally **`addonProductIds`** (root) and **`segments[i].addonProductIds`**. Optional `answers` are separate. The BFF forwards JSON **unchanged** (`src/app/api/bond/[...path]/route.ts`).
2. **If the response has no add-on rows** — `cartItems` may be a **tree** (`children[]`). This repo flattens that for display (`flattenBondCartItemNodes` in `checkout-bag-totals.ts`). If add-on **product ids appear in the request** but **no** matching lines exist anywhere under `cartItems` / `children`, Bond did not attach those products to the cart (server rules, eligibility, or **id type** mismatch).
3. **IDs** — We send **nested add-on product ids** from `GET …/products` → `packages[]` → nested `product`. If the API expects **package** ids or another identifier, only **Swagger / Bond** can confirm; compare with a known-good request from Bond backoffice or support.
