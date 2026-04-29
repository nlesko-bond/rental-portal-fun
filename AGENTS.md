<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# rental-portal-fun — agent expert briefing

> **Read this whole file before making changes.** It is the single canonical onboarding doc for any agent. After reading, an agent should be able to navigate the repo, understand the data flow, follow conventions, and make changes safely without further context.

---

## 1. What this project is

A **standalone Next.js 16 / React 19 consumer rental & booking portal** that talks to **Bond Sports' hosted public HTTP APIs only**. There is no Bond monorepo dependency — the integration boundary is a thin **BFF** at `/api/bond/...` that holds `X-Api-Key` server-side and proxies allowlisted requests.

The UI implements the full consumer rental v2 epic ([BOND-9840](https://bond-sports.atlassian.net/browse/BOND-9840), portal experience epic [BOND-16799](https://bond-sports.atlassian.net/browse/BOND-16799)): facility/category/activity discovery → product selection → date/duration/start time → slot selection → add-ons → checkout (auth, participant, membership, forms, summary) → cart & payment → confirmation.

**Product reference:** [Lovable prototype](https://rentals3.lovable.app/onlinebooking?preset=socceroof).

---

## 2. Hard constraints (non-negotiable)

1. **`X-Api-Key` is server-only.** Never appears in client bundles, never `NEXT_PUBLIC_*`. All Bond traffic goes through `/api/bond/...`.
2. **Standalone repo.** No imports from Bond `squad-c` / `apiv2`. Integration is **hosted Swagger only**: [Squad C public API](https://public.api.squad-c.bondsports.co/public-api/).
3. **BFF allowlist only.** `src/app/api/bond/[...path]/route.ts` rejects anything outside `v1/organization/{numericOrgId}/...` and explicit `cart` shapes. Adding a new Bond endpoint = update the allowlist.
4. **User JWTs flow via httpOnly cookies** set by `/api/bond-auth/login`. The BFF reads them and forwards `X-BondUserAccessToken` / `X-BondUserIdToken` / `X-BondUserUsername`. Client code never touches tokens directly.
5. **Trust hosted Swagger over local types.** OpenAPI is loose for `category.settings` and similar — extend types locally in `src/types/online-booking.ts` and validate against real JSON.
6. **Server truth wins.** When Bond returns a `cartId`, refetch via `getOrganizationCart` for authoritative line items / totals. Client estimates are display-only fallbacks.

---

## 3. Stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16** (App Router), **React 19** |
| Server state | `@tanstack/react-query` (configured in `src/app/providers.tsx`) |
| Styling | **Tailwind CSS v4** utilities + custom `.cb-*` classes in `src/app/globals.css` |
| i18n | `next-intl` (`messages/en.json`) |
| HTML sanitization | `dompurify` via `src/lib/sanitize-html.ts` |
| Tests | **Vitest** + `vite-tsconfig-paths` for `@/*` alias |
| Package manager | **pnpm** (use `pnpm`, not `npm`/`yarn`) |
| Linter | `eslint` with `eslint-config-next` (a few hook rules disabled — see `eslint.config.mjs`) |

Dev scripts: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`.

---

## 4. Environment

Copy `.env.example` → `.env.local`:

| Variable | Scope | Purpose |
|---|---|---|
| `BOND_API_BASE_URL` | server | Bond public API host (no trailing slash) |
| `BOND_API_KEY` | server | Org public API key (BFF only) |
| `BOND_AUTH_BASE_URL` | server | Bond consumer auth host (login/refresh) |
| `BOND_PAYMENT_API_BASE_URL` | server | Optional override for `v4/payment/...` proxy; defaults to `BOND_AUTH_BASE_URL`, then `BOND_API_BASE_URL` |
| `NEXT_PUBLIC_BOND_ORG_ID` | client | Default org id loaded by the UI |
| `NEXT_PUBLIC_BOND_PORTAL_ID` | client | Default online-booking portal id |
| `NEXT_PUBLIC_BOND_CONSUMER_WEB_ORIGIN` | client | Optional consumer web shell origin (reservations/invoices) |
| `NEXT_PUBLIC_BOOKING_PRIMARY` / `_ACCENT` / `_SUCCESS` | client | Optional theme defaults |
| `NEXT_PUBLIC_BOOKING_FONT_FAMILY` / `_FONT` | client | Optional font overrides |
| `NEXT_PUBLIC_BOOKING_APPEARANCE` | client | `system` / `light` / `dark` default |

**URL dev overrides** (read by `src/components/booking/booking-url.ts`, preserved across writes):
- `?orgId=` / `?org=`, `?portalId=` / `?portal=`
- `?primary=`, `?accent=` (alias `?secondary=`), `?success=` — hex (`#` URL-encoded as `%23`)

Theme resolution order: **URL → portal `options.branding` → env → CSS defaults** (`src/lib/booking-theme.ts`).

---

## 5. Architecture

```
Browser ──fetch──▶ /api/bond/v1/organization/...        (BFF — Next route handler)
                    │
                    │ + X-Api-Key
                    │ + X-BondUser* (from httpOnly cookies)
                    ▼
              Bond public API  (https://public.api.squad-c.bondsports.co)

Browser ──fetch──▶ /api/bond-auth/login | session | logout    (proxies BOND_AUTH_BASE_URL)
Browser ──fetch──▶ /api/bond-payment/organization/{orgId}/user/{userId}/options   (proxies v4)
```

### BFF entry: `src/app/api/bond/[...path]/route.ts`

- Implements **GET / POST / PUT / PATCH / DELETE** to `{BOND_API_BASE_URL}/{path}`.
- Allowlist: only `v1/organization/{numericOrgId}/...`. Any `cart/...` segment is additionally constrained: `cart/{cartId}`, `cart/{cartId}/finalize`, `cart/{cartId}/cart-item/{numericId}`.
- Forwards raw body for write methods, transparently passes through response status + body + content-type.
- Always sets `cache: "no-store"` (BFF is a pure pass-through).

### Auth proxy: `src/app/api/bond-auth/*`

- `POST /login` — issues `bond_access`, `bond_id`, `bond_username` httpOnly cookies on success.
- `GET /session` — checks cookies, refreshes near expiry.
- `POST /logout` — clears cookies.
- Cookie names live in `src/lib/bond-auth-cookies.ts`.

### Payment proxy: `src/app/api/bond-payment/organization/[orgId]/user/[userId]/options/route.ts`

- Hits `v4/payment/organization/{orgId}/{userId}/options?platform=consumer` on `BOND_PAYMENT_API_BASE_URL` (defaults to `BOND_AUTH_BASE_URL` because v4 is **not** on the trimmed `v1` public host).

### Client HTTP

- `src/lib/bond-client.ts` — builds `/api/bond/...` URLs and wraps `fetch` with `credentials: "include"` (so the BFF receives the auth cookies).
- `src/lib/bond-json.ts` — `bondBffGetJson` / `bondBffPostJson`, `BondBffError` (carries Bond error envelope).

### Domain wrappers (one file per concern)

| File | What it does |
|---|---|
| `src/lib/online-booking-api.ts` | Portal, products, schedule settings, schedule (with recovery variants for known instructor-resource quirks) |
| `src/lib/online-booking-user-api.ts` | `getUser`, booking-information, questionnaires, required products, `POST .../online-booking/create` |
| `src/lib/online-booking-create-body.ts` | Builds `POST create` payload (`segments` + flat `addonProductIds` + optional `answers`) — `splitAddonPayloadForCreate` separates rental/addon legs |
| `src/lib/bond-cart-api.ts` | `getOrganizationCart`, `removeCartItem(WithIllegalPriceFallback)`, `closeCart`, `closeOrganizationCartsBestEffort`, `finalizeCart` |
| `src/lib/bond-payment-api.ts` | `fetchConsumerPaymentOptions`, fee math + flatten/format helpers |
| `src/lib/bond-finalize-response.ts` | `parseFinalizeCartResponse` — normalizes Bond's variable-shape finalize response into `FinalizeSuccessDisplay` |

**Rule:** add new Bond traffic by extending these files (or creating a new sibling) as a thin `bondBffGetJson` / `Post` / `Delete` wrapper. Never call `fetch("/api/bond/...")` from a component.

---

## 6. Directory layout

```
docs/                              # all human/agent-readable specs
  RENTAL_PORTAL_PLAN.md            # Phase 1/2 product plan
  IMPLEMENTATION_AND_ROADMAP.md    # what's built + roadmap (Phases 3–7) + known issues
  COMPONENT_MAP.md                 # quick file-by-file reference
  CONSUMER_FLOW.md                 # end-user flow diagram + ticket map
  FE_TECH_DESIGN_DRAFT.md          # FE tech design (draft for Notion)
  MIGRATION_AND_CURSOR.md          # Cursor workspace setup
  bond/                            # Bond integrator notes (Swagger is canonical)
public/
  images/                          # local product photos (rinks, etc.)
  docs/                            # static HTML version of consumer flow diagram
messages/en.json                   # all i18n strings (booking, checkout, addons, errors, common)
src/
  app/
    api/bond/[...path]/route.ts    # BFF entry
    api/bond-auth/{login,session,logout}/route.ts
    api/bond-payment/.../options/route.ts
    page.tsx                       # renders <BookingExperience>
    layout.tsx                     # fonts (Geist, Inter, Montserrat), NextIntlClientProvider
    providers.tsx                  # React Query + BondAuthProvider
    globals.css                    # all CSS — .cb-* classes, design tokens
  components/
    PageLoadingFallback.tsx
    auth/
      BondAuthContext.tsx          # session state + login/logout
      LoginModal.tsx
      BookingForDrawer.tsx         # participant picker
    booking/
      BookingExperience.tsx        # main orchestrator (~2.6k lines)
      BookingCheckoutDrawer.tsx    # full checkout drawer (~4.7k lines — see §10)
      BookingAddonPanel.tsx        # add-on selection rails
      BookingSelectionPortal.tsx   # bottom selection bar (cart FAB + Book CTA)
      BookingDelayedFunLoader.tsx
      ProductDetailModal.tsx
      ScheduleMatrix.tsx | ScheduleCalendarView.tsx | AvailableDateCalendarBody.tsx
      MembershipRequiredModal.tsx
      CheckoutQuestionField.tsx | CheckoutQuestionnairePanels.tsx
      ModalShell.tsx
      SlotMemberPriceLabel.tsx
      activity-icons.tsx | booking-icons.tsx | booking-picker-bodies.tsx
      booking-slot-labels.ts | booking-url.ts
      hooks/
      primitives/
        CbButton.tsx | CbBusyInline.tsx | CbCheckoutTotalRow.tsx | CbInfoHint.tsx
    ui/
      RightDrawer.tsx | WelcomeToast.tsx
  hooks/                           # cross-component hooks (useHydrated, useMediaQuery, …)
  i18n/                            # next-intl wiring
  lib/                             # all logic, helpers, API wrappers (see §7)
    __tests__/                     # Vitest specs
  types/
    online-booking.ts              # portal/products/schedule DTOs (loose where Swagger is loose)
    bond-cart-dto.ts | create-booking-dto.ts
```

---

## 7. The `src/lib/` map (memorize this)

These are the canonical helpers. **Reuse before creating new files.** Group by concern:

### HTTP / errors
- `bond-client.ts`, `bond-json.ts` — fetch wrappers + `BondBffError`
- `bond-errors.ts` — friendly error copy (e.g. `ONLINE_BOOKING.INVALID_PRODUCT`, customer/org name interpolation)
- `bond-refresh-fetch.ts` — auth-refresh-aware fetch
- `bond-auth-cookies.ts`, `bond-auth-tokens.ts`, `bond-auth-clear.ts`, `jwt-payload.ts`
- `bond-user-types.ts`, `bond-consumer-web.ts` (consumer reservations/invoice URLs)

### Cart / checkout (the densest area — read these first when touching checkout)
- `bond-cart-api.ts` — Bond cart endpoints
- `bond-cart-item-classify.ts` — `classifyCartItemLineKind` → `"booking" | "membership" | "addon"`
- `bond-cart-removal.ts` — `bondRootCartItemIdForRemoval`, `bagRemovePolicyForBondItem` (subsection-vs-line cascade rules)
- `cart-purchase-lines.ts` — `bagApprovalPolicy` (`"all_pay" | "all_submission" | "mixed"`), `expandSnapshotForPurchaseList`, `countSessionCartLineItems`
- `checkout-bag-totals.ts` — `bondCartPayableTotalForFinalize` (approval-aware), `cartItemLineAmountFromDto`, `flattenBondCartItemNodes`, `aggregateBag*`
- `bond-finalize-response.ts` — finalize response parser
- `session-cart-snapshot.ts` — `coerceCartFromApi`, `loadSessionCartSnapshots`, `saveSessionCartSnapshots`, `positiveBondCartId`, `SessionCartSnapshot` / `SessionReservationGroup` / `SessionCartDisplayLine`
- `session-cart-grouping.ts` — `flatLineIndexSegmentsForMergedBookings`
- `session-booking-display-lines.ts` — `buildBookingDisplayLinesForCart`, `formatScheduleSummaryForBooking`

### Schedule, slots, durations
- `schedule-settings.ts` — parses Bond schedule settings (intervals, dates)
- `schedule-resource-type.ts` — `isInstructorScheduleResourceType` etc.
- `slot-selection.ts` — `PickedSlot`, `validateSlotSelection`, `pickedSlotConflictsWithBookedSlices`, `slotControlKey`, `slotDurationMinutes`
- `booking-schedule-start.ts` — `filterStartTimesByMinimumNotice`, `snapPreferredStartToEligible`
- `booking-information-slices.ts` — `bookedSlicesFromUserBookingInformation`
- `booking-slot-group-display.ts`

### Category / product rules
- `category-booking-settings.ts` — durations, advance window, hours/sequential limits, `formatDurationLabel`, `formatDurationPriceBadge`
- `category-approval.ts` — approval-required logic
- `category-settings.ts`
- `booking-pricing.ts` — `productCatalogMinUnitPrice`, `productHasVariableSchedulePricing`, `productMembershipGated`, `productCatalogShowsMemberFree`, `cashUnitPriceForBondFallback`
- `booking-party-options.ts`
- `booking-profile-contact.ts`
- `booking-activity-display.ts`

### Add-ons (a major UX surface — see §11)
- `product-package-addons.ts` — `bookingOptionalAddons`, `resolveAddonDisplayPrice`, `addonLevelLabel`, `addonPriceSuffixForLevel`, `addonEstimatedChargeForSlot`
- `addon-slot-targeting.ts` — `getEffectiveAddonSlotKeys`

### Required products / membership
- `required-products-parse.ts`, `required-products-extended.ts`, `required-products-eligibility.ts`
- `entitlement-discount.ts` — `applyEntitlementDiscountsToUnitPrice`, `reverseEntitlementDiscountsToUnitPrice`, `describeEntitlementsForDisplay`

### Forms / questionnaires
- `questionnaire-parse.ts`, `questionnaire-prefill.ts`
- `product-form-ids.ts`

### Theming / appearance / loading
- `booking-theme.ts` — `resolveBookingThemeStyle`, `bookingAppearanceClass`, `BookingThemeUrlOverrides`
- `booking-appearance.ts` — `CB_BOOKING_APPEARANCE_KEY`, `CB_BOOKING_APPEARANCE_EVENT`
- `booking-views.ts` — `clientScheduleViews` (allowed schedule views)
- `booking-loading-copy.ts` — `pickSportsFact`
- `product-card-image.ts` — `resolveProductCardImageAtStep` (Unsplash → org → fallback)
- `sanitize-html.ts` — DOMPurify wrapper (`sanitizeBookingDescriptionHtml`)
- `body-scroll-lock.ts`

---

## 8. Data flow — `OrganizationCartDto` vs client state

| Concern | Source of truth |
|---|---|
| Slots, add-on selection, `pickedSlots`, `addonSlotTargeting` | Client (`BookingExperience`, `BookingCheckoutDrawer`) |
| `POST .../online-booking/create` payload | `online-booking-create-body.ts` |
| `OrganizationCartDto` (`cartItems`, `discounts[]`, `subtotal`, `tax`, `total`, …) | **Bond response only** |
| Bag receipt line boxes | `flattenBondCartItemNodes` over `cartItems[]` (with `metadata.description` when present, classified by `bond-cart-item-classify.ts`) |
| Subtotal / discount / tax / total rows | `getBondCartReceiptSummaryRows`, else `getBondCartPricingDisplayRows` (`checkout-bag-totals.ts`) |
| Cart line list | `expandSnapshotForPurchaseList` (`cart-purchase-lines.ts`) → `cartItemLineAmountFromDto` |
| `amountToPay` for `finalize` | `bondCartPayableTotalForFinalize` — **must exclude approval-required products** (see Known Issues) |

### Lifecycle

1. User picks slots + (optionally) add-ons in `BookingExperience`.
2. User opens checkout drawer → `BookingCheckoutDrawer` runs through: login (if needed) → participant → membership (if required) → forms → summary.
3. **Add to Cart** → `POST .../online-booking/create` (with optional `cartId` to merge into existing cart). Bond returns `cartId` and a fresh cart shape.
4. Parent + drawer **`GET .../cart/{cartId}`** for authoritative line items / totals; opening the bag drawer triggers the same refresh per cart id.
5. **Bag remove** → per-line `DELETE .../cart-item/{cartItemId}` for add-ons; `{ kind: "subsection" }` `DELETE .../cart-item/{rootId}` for rentals (Bond cascades attached add-ons); falls back to `closeCart` (`DELETE .../cart/{cartId}`) when subsection empties. Logic in `bond-cart-removal.ts` → `bagRemovePolicyForBondItem`.
6. **Pay / submit** → `POST .../cart/{cartId}/finalize` with `paymentMethodId` from the v4 options proxy. Approval-only carts submit without charge; mixed carts must filter `amountToPay` to non-approval items.
7. Confirmation screen rendered from `parseFinalizeCartResponse` (see Known Issue: confirmation regression in prod).

---

## 9. URL state (deep-linkable)

`src/components/booking/booking-url.ts` exposes `readBookingUrl` / `writeBookingUrl`. Booking state keys: `facility`, `category`, `activity`, `product`, `date`, `duration`, `view` (`list` | `calendar` | `matrix`), `page`. Dev overrides (`orgId`/`org`, `portalId`/`portal`, `primary`, `accent`/`secondary`, `success`) are **always preserved** across writes.

`useBookingUrlState` (in `BookingExperience`) is the canonical state hook — never bypass it for booking-state mutation.

`view` is **portal-driven**: only values present in portal `options.views` (filtered through `clientScheduleViews` in `booking-views.ts`) are valid. Invalid `view=` falls back to portal `defaultView`.

---

## 10. The two big components (touch with care)

### `BookingExperience.tsx` (~2.6k lines)
Owns the whole pre-checkout page. Holds:
- Breadcrumb / picker modals (facility, category, activity)
- Product card grid + pagination + product detail modal opener
- Date strip, calendar modal, duration chips, preferred-start picker
- Schedule fetch (with recovery variants) + matrix table + calendar view + list view
- Add-on panel rendering + `addonSlotTargeting` state + pruning effects
- Selection bar / cart FAB
- Session cart snapshots (sync with bag)
- Theme application (`--cb-*`), appearance class, dev overrides

**Refactor target (Phase 6):** split into route-level sections (schedule vs chrome vs checkout) + hooks. Until then, prefer narrow patches and add new helpers to `src/lib/` rather than growing this file.

### `BookingCheckoutDrawer.tsx` (~4.7k lines)
Right-side checkout. Steps (rendered conditionally):
1. **Login** (if not authenticated) — opens `LoginModal`
2. **Participant** (`BookingForDrawer`) — for accounts with family members
3. **Membership** (if `membershipRequiredForProductFromResponse` true) — `MembershipRequiredPanel`
4. **Forms** — `CheckoutQuestionnairePanels` (auto-collapse on satisfaction)
5. **Booking summary** — slot list + required + optional add-ons + estimated totals
6. **Add to Cart** → `postOnlineBookingCreate` → refetch cart → "Added to Cart" screen
7. **Cart & checkout** — payment options (cards/ACH with live fee recalc), pay/submit CTAs gated by `bagApprovalPolicy`
8. **Confirmation** — `parseFinalizeCartResponse` → confirmed/submitted/mixed/deposit views

Critical state:
- `combinedApprovalMap` from `bagSnapshots` filters approval items out of `amountToPay`.
- `submitBookingRequestMutation.onSuccess` sets `finalizeSuccess` via `parseFinalizeCartResponse`.
- `answersStaleAfterFinalizeRef` + parent `onFinalizeBookingSuccess` clear session cart after success — beware of clearing **before** the success view mounts (open prod bug).

When changing checkout, **always run** `pnpm test` (most regressions land in `checkout-bag-totals.test.ts`, `cart-purchase-lines.test.ts`, `bond-cart-removal.test.ts`, `bond-finalize-response.test.ts`, `session-cart-snapshot.test.ts`).

---

## 11. Add-ons (current model — likely to change soon)

- **Source:** `product.packages` entries with `isAddon: true` (nested package arrays walked) — `product-package-addons.ts → bookingOptionalAddons`.
- **Levels:** `reservation` (one flat charge) | `slot` (per slot) | `hour` (per booked hour).
- **UI gating:** add-on panel only renders after at least one slot is picked — even per-reservation add-ons (avoids implying purchase without times).
- **Per-slot targeting:** slot/hour add-ons expose **select-all + per-slot chips**; targeting state is `addonSlotTargeting: Record<addonId, { all: boolean; keys: string[] }>` (`BookingAddonPanel.tsx`). `getEffectiveAddonSlotKeys` resolves the active set (handles `all=true` + keys empty case). `BookingExperience` prunes targeting when slots change.
- **Quantities:** per-add-on quantity (`addonQuantities`) and per-slot-per-add-on quantity (`addonSlotQuantities`) supported by `BookingAddonPanel` via `QtyStepperInline`. Max qty 50.
- **Pricing display:** `+price / reservation | / slot | / hr`. Per-slot estimated chip lines were intentionally removed; `addonEstimatedChargeForSlot` remains for cart/checkout math.

> **Heads up:** the user is preparing a redesign of the add-ons surface and a new booking-summary layout that lists every slot uniquely with its add-ons + inline manage/remove. When those land, expect changes to `BookingAddonPanel.tsx`, the booking-summary section of `BookingCheckoutDrawer.tsx`, and possibly the targeting model in `addon-slot-targeting.ts`.

---

## 12. Theming

- All design tokens are CSS custom properties in `src/app/globals.css` under `.consumer-booking`:
  `--cb-primary`, `--cb-accent`, `--cb-success`, `--cb-bg-surface`, `--cb-bg-surface-muted`, `--cb-border`, `--cb-text`, `--cb-text-muted`, `--cb-shadow-card`, plus font vars.
- All custom classes use the **`.cb-`** prefix — keep this convention.
- **No CSS modules**; Tailwind is utility-only (no `@apply`-style component classes outside `globals.css`).
- Resolution order: URL → portal `options.branding` → env → CSS defaults (`booking-theme.ts → resolveBookingThemeStyle`).
- Appearance (light/dark/system) cycles via `bookingAppearanceClass`, persisted to `localStorage` under `CB_BOOKING_APPEARANCE_KEY` and broadcast via `CB_BOOKING_APPEARANCE_EVENT`.
- **Desktop split breakpoint:** `min-[1068px]` (custom Tailwind breakpoint for the schedule two-column layout).

---

## 13. i18n

- Single source: `messages/en.json`, namespaced (`booking.*`, `checkout.*`, `addons.*`, `errors.*`, `common.*`, `auth.*`, `meta.*`).
- Use `useTranslations("namespace")` in client components; `getTranslations` in server (`layout.tsx → generateMetadata`).
- **All user-visible strings + `aria-*` attributes must come from `en.json`** (Barak-review guardrail). When adding strings, add the key in the same PR.

---

## 14. Testing

- **Vitest**, run with `pnpm test` (single) or `pnpm test:watch`.
- Specs live in `src/lib/__tests__/` (logic-only — no DOM rendering). Mirror filename: `foo.ts → foo.test.ts`.
- The `@/*` alias works in tests via `vite-tsconfig-paths` (`vitest.config.ts`).
- Always add a test when fixing a money-math, approval-routing, or cart-removal bug.

---

## 15. Workflow conventions

### Branches
`squad-*` style is **not** used here. Common patterns:
- `feat/<scope>` — new feature
- `fix/<scope>` — bug fix
- `experiment/<idea>` — exploratory
- `docs/<topic>` — docs only
- `chore/<thing>`

PRs target `main`. There is no `develop` / `staging` branch.

### Commits
Conventional-commit-ish in practice (see `git log`):
- `feat(scope): …`, `fix(scope): …`, `chore: …`, `docs(area): …`, `style(area): …`
- Scopes commonly seen: `booking`, `ui`, `checkout`, `product-detail`, `deps`, `roadmap`.
- Keep messages concise and impact-focused.

### Coding standards (workspace rules apply)

The repo inherits all the always-applied workspace rules. The most relevant for this codebase:

- **No `any`.** Strict TypeScript. Use `unknown` + type guards for untrusted Bond payloads.
- **Interface naming:** `IFoo` for interfaces; PascalCase for type aliases; UPPER_SNAKE_CASE for enum values, `*Enum` suffix on enum names. (Existing local types in `src/types/` predate this in spots — match existing style in a file unless renaming the whole file.)
- **No magic numbers.** Hoist to a named `const` (e.g. `ADDON_MAX_QTY = 50` in `BookingAddonPanel.tsx`).
- **No emojis in code.** Logging/strings stay plain ASCII; emojis live only in markdown docs and product copy explicitly approved by spec.
- **No inline narration comments.** JSDoc on exported functions/types only. Replace step comments with named helpers.
- **Promise.all for independent async** (no sequential `await` for independent ops).

### Performance / React patterns

- Server state via React Query. Default `staleTime: 60_000`, `refetchOnWindowFocus: false` (`providers.tsx`). Colocate query keys with their fetcher.
- Reuse `useBondEnv(searchParams.toString())` pattern in `BookingExperience` rather than duplicating org/portal id resolution.
- Three hook lint rules are intentionally off (`set-state-in-effect`, `refs`, `preserve-manual-memoization`) — see `eslint.config.mjs` for the rationale. Don't re-enable without owner sign-off.

### Don't
- Don't add `X-Api-Key` to client code.
- Don't add a new Bond endpoint without updating the BFF allowlist.
- Don't import from `node_modules/next/dist/...` runtime — read its `docs/` directory if you need Next 16 specifics.
- Don't widen `category.settings` to `any` — extend `src/types/online-booking.ts` and parse explicitly.
- Don't compute totals from client state when a `cartId` exists — refetch and use Bond's authoritative figures.
- Don't push to `main` — open a PR.

---

## 16. Decision tree — "Where do I put this?"

| You want to… | Do this |
|---|---|
| Call a new Bond endpoint | Update BFF allowlist (`src/app/api/bond/[...path]/route.ts`) → add a wrapper in the appropriate `src/lib/online-booking-*.ts` or `bond-*-api.ts` → call from a React Query hook |
| Add a new schedule/slot rule | `src/lib/slot-selection.ts` (validation) or `src/lib/category-booking-settings.ts` (caps/windows) — never inline in `BookingExperience` |
| Change cart math | `src/lib/checkout-bag-totals.ts` or `src/lib/cart-purchase-lines.ts` + add a Vitest spec |
| Change cart-remove behavior | `src/lib/bond-cart-removal.ts` — never inline DELETE logic in components |
| Add an add-on capability | `src/lib/product-package-addons.ts` (data) + `BookingAddonPanel.tsx` (UI) + `addon-slot-targeting.ts` (targeting) |
| Add a checkout step | New panel component → wire into `BookingCheckoutDrawer.tsx` step sequence (search for the `Fragment`-rendered step list) |
| Add a Bond error mapping | `src/lib/bond-errors.ts` (`formatBondUserMessage` / `formatConsumerBookingErrorUnknown`) |
| Add user-visible copy | `messages/en.json` first, then reference via `useTranslations` |
| Add a design token | `src/app/globals.css` `--cb-*` block + (optionally) plumb through `booking-theme.ts` if it should be runtime-configurable |
| Add a URL parameter | `src/components/booking/booking-url.ts` (read + write — the writer must preserve dev overrides) |
| Add a test | `src/lib/__tests__/<thing>.test.ts` (Vitest, no DOM) |

---

## 17. Pinned items / known issues (read before touching the relevant area)

From `docs/IMPLEMENTATION_AND_ROADMAP.md` — keep that file in sync if status changes.

- **Pinned (not in active build):** SSO / enterprise identity; payment add-card / tokenize; deposit modal + 3DS.
- **Mixed-cart `finalize` 400** ("invalid payment information"): `bondCartPayableTotalForFinalize` and `computedDepositDollars` currently sum the entire cart. Approval items must be excluded from `amountToPay`. Fix points: `src/lib/checkout-bag-totals.ts` + deposit memo in `BookingCheckoutDrawer.tsx`.
- **Confirmation screen regression in prod:** After successful `finalizeCart`, "Booking Confirmed" / "Booking Submitted" view does not render. Audit: `BookingCheckoutDrawer.tsx` `submitBookingRequestMutation.onSuccess`, `parseFinalizeCartResponse`, `answersStaleAfterFinalizeRef` / parent `onFinalizeBookingSuccess` ordering, response shape (`204`/`201`/body variations).
- **Spurious 2nd `DELETE cart-item` 400** after subsection cascade — noise only, cart clears correctly. Suspects: legacy per-line X button, rapid clicks racing.
- **Lessons / instructor-as-resource:** Bond returns inconsistent shapes; recovery variants live in `fetchBookingScheduleRecovering`. **Do not** add more variants until Bond clarifies the API.
- **BFF hardening backlog:** stricter allowlists, structured logging, rate limits — not done.

---

## 18. Quick-start for a new agent

1. **Read** this file end to end (you're here).
2. **Skim** `docs/IMPLEMENTATION_AND_ROADMAP.md` for current status + the file map at the bottom.
3. **Skim** `docs/CONSUMER_FLOW.md` for the user-facing flow + ticket map.
4. **Open** `src/components/booking/BookingExperience.tsx` and `src/components/booking/BookingCheckoutDrawer.tsx` — get a sense of imports + hook layout (don't try to read either end-to-end).
5. **Verify env:** `cp .env.example .env.local`, fill `BOND_API_KEY` (server-only), `NEXT_PUBLIC_BOND_ORG_ID`, `NEXT_PUBLIC_BOND_PORTAL_ID`.
6. **Run:** `pnpm install && pnpm dev`.
7. **For new Bond traffic:** open the [Squad C Swagger](https://public.api.squad-c.bondsports.co/public-api/) for the exact `operationId` / schema before writing the wrapper.

---

## 19. Reference docs (in this repo)

| Doc | When to read |
|---|---|
| `docs/RENTAL_PORTAL_PLAN.md` | Product framing — Phase 1 (discovery + schedule) and Phase 2 (checkout) |
| `docs/IMPLEMENTATION_AND_ROADMAP.md` | What's built today, env/URL map, file map, **roadmap (Phases 3–7)**, **known issues**. Keep updated as the source of handoff truth. |
| `docs/COMPONENT_MAP.md` | Quick file/component reference (a more compact version of §6 / §7) |
| `docs/CONSUMER_FLOW.md` | End-user flow diagram + the BOND-1752x ticket map |
| `docs/FE_TECH_DESIGN_DRAFT.md` | FE tech-design draft for Notion |
| `docs/MIGRATION_AND_CURSOR.md` | Cursor workspace setup tips |
| `docs/bond/README.md` + neighbors | Bond integrator notes (Swagger remains canonical) |

External:
- **API contract:** [Squad C public Swagger](https://public.api.squad-c.bondsports.co/public-api/) · [bond-public-api.json](https://public.api.squad-c.bondsports.co/public-api/bond-public-api.json)
- **Epic:** [BOND-9840](https://bond-sports.atlassian.net/browse/BOND-9840) (Online Rentals 2.0), [BOND-16799](https://bond-sports.atlassian.net/browse/BOND-16799) (consumer portal experience)

---

*Single source of agent truth. Update this file when project conventions, the BFF allowlist, the directory layout, or pinned items change.*
