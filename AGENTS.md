<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# rental-portal-fun — agent context

## Plan (do this work here)

1. **`docs/RENTAL_PORTAL_PLAN.md`** — Phase 1 (portal, products, schedule) and Phase 2 (auth, checkout). **Treat as the source of truth** for this repo.
2. **`docs/IMPLEMENTATION_AND_ROADMAP.md`** — **What’s built, URL/env overrides, file map, Roadmap backlog (Phases 3–7), pinned SSO + payment methods** — start here for handoffs.
3. **`docs/MIGRATION_AND_CURSOR.md`** — How to open this folder in Cursor and attach the plan in new chats.

## Bond APIs

- **Contract:** [Squad C Swagger](https://public.api.squad-c.bondsports.co/public-api/) (not squad-c source code).
- **Local copies:** `docs/bond/API_CONSUMER_PROMPTS.md`, `docs/bond/PUBLIC_APIS_FOR_AGENTS.md`.

## Implementation pointers

- **BFF:** `src/app/api/bond/[...path]/route.ts` — forwards allowlisted `v1/organization/*` (incl. **`cart/{cartId}`** GET + DELETE close, **`cart-item/{id}`** DELETE, **`finalize`** POST) with `BOND_API_KEY` + user cookies → `X-BondUser*` (+ `X-BondUserUsername` when present). **`DELETE` / `PUT` / `PATCH`** supported where Bond needs them.
- **Payment proxy:** `src/app/api/bond-payment/organization/[orgId]/user/[userId]/options/route.ts` — **`GET`** → Bond **`v4/payment/organization/{orgId}/{userId}/options`**; **`BOND_PAYMENT_API_BASE_URL`** optional (defaults to **`BOND_AUTH_BASE_URL`** so v4 is not called on the public `v1` host).
- **Auth proxy:** `src/app/api/bond-auth/*` — login/session/logout; env `BOND_AUTH_BASE_URL`.
- **Client fetch helper:** `src/lib/bond-client.ts` (uses `credentials: "include"` for cookies).
- **User / checkout APIs:** `src/lib/online-booking-user-api.ts` (`getUser`, booking-information, questionnaires, required products, `POST` create); `src/lib/online-booking-create-body.ts` (create payload). **`src/lib/bond-cart-api.ts`** — `getOrganizationCart`, `removeCartItem`, `closeCart`, `finalizeCart`. **`src/lib/bond-payment-api.ts`** — consumer payment options (local BFF URL).
- **Roadmap / gaps:** `docs/IMPLEMENTATION_AND_ROADMAP.md` — booking-information enforcement, server cart/totals vs client estimates, payment pins.
- **Server state:** `@tanstack/react-query` via `src/app/providers.tsx`.

## Optional

Attach skills (e.g. barak-review) in chat when reviewing UI or architecture.
