<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# rental-portal-fun — agent context

## Plan (do this work here)

1. **`docs/RENTAL_PORTAL_PLAN.md`** — Phase 1 (portal, products, schedule) and Phase 2 (auth, checkout). **Treat as the source of truth** for this repo.
2. **`docs/IMPLEMENTATION_AND_ROADMAP.md`** — **What’s built, URL/env overrides, file map, and outstanding API work** — start here for handoffs.
3. **`docs/MIGRATION_AND_CURSOR.md`** — How to open this folder in Cursor and attach the plan in new chats.

## Bond APIs

- **Contract:** [Squad C Swagger](https://public.api.squad-c.bondsports.co/public-api/) (not squad-c source code).
- **Local copies:** `docs/bond/API_CONSUMER_PROMPTS.md`, `docs/bond/PUBLIC_APIS_FOR_AGENTS.md`.

## Implementation pointers

- **BFF:** `src/app/api/bond/[...path]/route.ts` — forwards `v1/organization/*` with server env `BOND_API_KEY`; reads user JWTs from httpOnly cookies set by `/api/bond-auth/login`.
- **Auth proxy:** `src/app/api/bond-auth/*` — login/session/logout; env `BOND_AUTH_BASE_URL`.
- **Client fetch helper:** `src/lib/bond-client.ts` (uses `credentials: "include"` for cookies).
- **User / checkout APIs:** `src/lib/online-booking-user-api.ts` (`getUser`, booking-information, questionnaires, `POST` create); `src/lib/online-booking-create-body.ts` (best-effort create payload).
- **Server state:** `@tanstack/react-query` via `src/app/providers.tsx`.

## Optional

Attach skills (e.g. barak-review) in chat when reviewing UI or architecture.
