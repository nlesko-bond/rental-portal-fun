# rental-portal-fun

Custom **online rental / booking** UI that talks to Bond’s **hosted public HTTP APIs** only (no Bond monorepo dependency). The app keeps **`X-Api-Key` on the server** and exposes a small BFF under `/api/bond/...`.

## Docs in this repo

| Doc | Purpose |
|-----|--------|
| **[docs/RENTAL_PORTAL_PLAN.md](docs/RENTAL_PORTAL_PLAN.md)** | Full Phase 1 / Phase 2 plan (migrate your Cursor work around this file). |
| **[docs/MIGRATION_AND_CURSOR.md](docs/MIGRATION_AND_CURSOR.md)** | How to move Cursor / “the agent” to this folder and attach the plan. |
| **[docs/bond/](docs/bond/)** | Copied integrator reference; **Swagger is still canonical** for request shapes. |

## Stack

- **Next.js 16** (App Router, React 19) — Route Handlers for the BFF, strong defaults for performance and DX
- **TanStack Query** — server-state for portal, products, and schedule
- **TypeScript** + **Tailwind CSS**

## Setup

1. Copy env template and fill in values:

   ```bash
   cp .env.example .env.local
   ```

2. Set:

   - `BOND_API_BASE_URL` — e.g. `https://public.api.squad-c.bondsports.co`
   - `BOND_API_KEY` — organization public API key (**server only**, never `NEXT_PUBLIC_*`)
   - `BOND_AUTH_BASE_URL` — Bond auth host for consumer login/refresh, e.g. `https://api.squad-c.bondsports.co` (used only by `/api/bond-auth/*` Route Handlers)
   - `NEXT_PUBLIC_BOND_ORG_ID` / `NEXT_PUBLIC_BOND_PORTAL_ID` — for the booking experience config

3. Run the dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## BFF

- **GET/POST** `/api/bond/v1/organization/...` forwards to `{BOND_API_BASE_URL}/v1/organization/...` with `X-Api-Key`.
- Only paths under `v1/organization/` are allowed (admin and other prefixes are blocked).
- User JWTs: the browser sends **httpOnly cookies** set by `/api/bond-auth/login`; the BFF reads them and forwards `X-BondUserAccessToken` / `X-BondUserIdToken`. You can still pass those headers explicitly if needed.

## Auth (consumer login)

- **POST** `/api/bond-auth/login` — body `{ "email", "password" }`; proxies to `{BOND_AUTH_BASE_URL}/auth/login` with `platform: "consumer"`.
- **GET** `/api/bond-auth/session` — returns whether the user is authenticated; refreshes tokens when the access token is near expiry.
- **POST** `/api/bond-auth/logout` — clears session cookies.

Use `src/lib/bond-client.ts` from client code to build URLs to this BFF.

## Docs

- Hosted spec: [Squad C Swagger](https://public.api.squad-c.bondsports.co/public-api/)

## Deploy

Configure the same env vars on your host (Vercel, etc.). Never expose `BOND_API_KEY` to the client bundle.
