# Component Map

Quick reference for where things live and what they own. Start here when adding a feature or tracking down a bug.

---

## Pages & Entry Points

| File | Role |
|---|---|
| `src/app/page.tsx` | Root route — renders `<BookingExperience>` inside Suspense |
| `src/app/layout.tsx` | Root layout — fonts, i18n provider, global CSS |
| `src/app/providers.tsx` | React Query + auth context wrappers |

---

## Primary UI Components

### `BookingExperience.tsx`
The main orchestrator. Owns the full page: breadcrumb nav, product card grid, schedule (date strip / calendar / timeline), available times list, and addon panel. Splits into a two-column desktop layout at `≥1068px` (left: 300px sticky calendar+controls, right: slots).

**Key internal state:** `useBookingUrlState` hook (product, date, duration, view, preferred start). All URL-driven — shareable links work out of the box.

**Key queries:** `scheduleQuery`, `scheduleSettingsQuery`, `requiredProductsQuery`, `bookingInfoQuery`.

---

### `BookingCheckoutDrawer.tsx`
The right-side checkout drawer. Steps: auth/login → participant → add-ons → membership (if required and not already satisfied) → questionnaires → booking summary → added-to-cart → bag/payment → confirmation. Manages create, merge, cart refresh, finalize, and confirmation state.

**Payment amount logic:** full-pay uses Bond cart totals via `bondCartPayableTotalForFinalize`; minimum-due uses `cartChargeableMinimum` when Bond exposes a real deposit/minimum signal. Custom amount is supported where the cart/payment UI allows it.

**Approval logic:** Products that require approval are submitted without charge. `combinedApprovalMap` (built from `bagSnapshots`) filters them out of `amountToPay`.

**Required products:** `required-products-extended.ts` parses the required-products tree. Satisfied memberships (`required: false`) suppress the membership step but are not sent to `POST .../online-booking/create` unless the customer actively selects a membership to purchase.

---

### `ProductDetailModal.tsx`
Info modal opened from the product card `ⓘ` button. Shows: panoramic hero image, description (left col), price + spaces + member benefits + addons (right col). Uses `ModalShell` as container.

**Layout breakpoint:** Two-column at `≥420px` modal width (modal max-width is `42rem`).

**Fields shown:** Price/duration, spaces/instructors, members-only gate, member discount %, available add-ons.  
**Fields omitted by design:** Duration as a standalone row (redundant — shown in price pill), punch pass, capacity, dimensions.

---

### `BookingAddonPanel.tsx`
Addon selection UI rendered below the slot grid and reused in checkout. Groups add-ons into reservation, slot, and hour rails. Reservation add-ons use a simple quantity stepper; slot/hour add-ons support "add to all" plus manual per-slot increments/decrements.

---

### `ScheduleMatrix.tsx`
Timeline grid view. Rows = resources (courts/spaces), columns = time slots. Sticky first column. Auto-scrolls to `state.date` on mount.

### `ScheduleCalendarView.tsx`
Week-calendar view. Alternative to the timeline, toggled via the List/Timeline segment control.

### `AvailableDateCalendarBody.tsx`
Inline mini-calendar used in the wide desktop left column. Also powers the date-picker modal on mobile.

---

## Modals & Drawers

| Component | Trigger | Purpose |
|---|---|---|
| `ModalShell` | Used by all modals | Backdrop + panel + title + close button wrapper |
| `ProductDetailModal` | Product card ⓘ button | Product info (image, price, spaces, addons) |
| `MembershipRequiredModal` | Slot click when gated | Explains membership requirement |
| `booking-picker-bodies.tsx` | Picker state in Experience | Date picker, duration picker, preferred start picker |
| `LoginModal.tsx` | Sign-in CTA | Bond auth login form |
| `RightDrawer.tsx` | Checkout flow | Right-edge sliding drawer container |
| `BookingCheckoutDrawer.tsx` | "Book" button | Full checkout multi-step flow |

---

## Auth

| File | Role |
|---|---|
| `BondAuthContext.tsx` | React context — session state, login/logout, `setLoginOpen` |
| `BookingForDrawer.tsx` | "Booking for" user selector inside checkout |
| `src/app/api/bond-auth/*` | BFF routes — login, session, logout (proxies to Bond auth API) |

---

## API / Data Layer

### BFF Routes (`src/app/api/`)
| Route | Proxies to |
|---|---|
| `bond/[...path]` | Bond `v1/organization/*` — schedule, cart, finalize, cart-item delete |
| `bond-auth/login` | Bond auth login |
| `bond-auth/session` | Bond session check |
| `bond-auth/logout` | Bond logout |
| `bond-payment/.../options` | Bond `v4/payment/.../options` (uses `BOND_PAYMENT_API_BASE_URL`) |

### Client API libs (`src/lib/`)
| File | What it does |
|---|---|
| `bond-cart-api.ts` | `getOrganizationCart`, `removeCartItem`, `closeCart`, `finalizeCart` |
| `bond-payment-api.ts` | `getPaymentOptions` (consumer payment methods) |
| `online-booking-user-api.ts` | `getUser`, booking-information, questionnaires, required products, `createBooking` |
| `online-booking-create-body.ts` | Builds the create-booking POST payload: `segments`, add-ons, purchased `requiredProducts`, answers, optional `cartId` |
| `bond-client.ts` | Fetch wrapper with `credentials: include` for cookie forwarding |

---

## Logic / Utility Libs (`src/lib/`)

| File | Key exports |
|---|---|
| `checkout-bag-totals.ts` | `bondCartPayableTotalForFinalize` (approval-aware), `cartItemLineAmountFromDto`, `flattenBondCartItemNodes` |
| `bond-cart-item-classify.ts` | `classifyCartItemLineKind` → `"booking" \| "membership" \| "addon"` |
| `cart-purchase-lines.ts` | `bagApprovalPolicy` → `"all_pay" \| "all_submission" \| "mixed"`; cart display lines and membership summaries |
| `checkout-card-model.ts` | Converts purchase display lines into checkout card props, badges, icons, and membership meta lines |
| `session-cart-snapshot.ts` | `coerceCartFromApi`, `positiveBondCartId`, persisted metadata for required products and product downpayments |
| `session-cart-grouping.ts` | Participant-aware cart grouping for merged/mixed-family carts |
| `bond-finalize-response.ts` | `parseFinalizeCartResponse` — normalises Bond's variable invoice response shape |
| `bond-cart-removal.ts` | Finds removable cart item ids and supports child-before-root segment deletion |
| `product-package-addons.ts` | `bookingOptionalAddons`, `resolveAddonDisplayPrice`, `addonLevelLabel` |
| `required-products-extended.ts` | Parses required-products trees, satisfied product ids, membership display summaries, and nested purchased ids |
| `booking-pricing.ts` | `productCatalogAllPricesNearZero`, `productHasVariableSchedulePricing`, `productMembershipGated` |
| `entitlement-discount.ts` | `describeEntitlementsForDisplay` — formats member discount labels |
| `schedule-settings.ts` | Parses Bond schedule settings (advance window, slot intervals, etc.) |
| `slot-selection.ts` | `PickedSlot` type + slot toggle/dedupe logic |
| `booking-url.ts` | URL state serialisation (product, date, duration, view) |
| `sanitize-html.ts` | DOMPurify wrapper for product description HTML |

---

## Primitives (`src/components/booking/primitives/`)

| Component | Purpose |
|---|---|
| `CbButton` | Styled button with primary/outline/ghost variants |
| `CbBusyInline` | Inline loading spinner |
| `CbCheckoutTotalRow` | Price row in checkout summary (label + amount) |
| `CbInfoHint` | Small info tooltip/hint block |

---

## Theming & Styles

All styles live in `src/app/globals.css`. No CSS modules; no Tailwind component classes — Tailwind is utility-only.

**Design tokens** (CSS custom properties, set in `:root` / `.consumer-booking`):

| Token | Purpose |
|---|---|
| `--cb-primary` | Brand primary (buttons, active states) |
| `--cb-accent` | Accent / highlight |
| `--cb-success` | Confirmation green |
| `--cb-bg-surface` | Card/modal background |
| `--cb-bg-surface-muted` | Subtle background |
| `--cb-border` | Default border color |
| `--cb-text` | Primary text |
| `--cb-text-muted` | Secondary / label text |
| `--cb-shadow-card` | Card drop shadow |

Override via URL params: `?primary=%230d4774&accent=%23f7b500&success=%2324c875`  
Override via env: `NEXT_PUBLIC_CB_PRIMARY`, `NEXT_PUBLIC_CB_ACCENT`, `NEXT_PUBLIC_CB_SUCCESS`

**CSS class prefix:** `.cb-` (consumer booking) — all custom classes use this prefix.

**Desktop layout breakpoint:** `min-[1068px]` (matches Tailwind custom breakpoint for the schedule two-column split).

---

## i18n

All user-visible strings live in `messages/en.json`, namespaced:
- `booking.*` — main booking UI
- `checkout.*` — checkout drawer
- `addons.*` — addon panel
- `errors.*` — error messages
- `common.*` — shared (loading, close, etc.)

Access via `useTranslations("booking")` etc. (`next-intl`).

---

## Testing

Tests live in `src/lib/__tests__/`. Run with `pnpm test`. Framework: Vitest + `vite-tsconfig-paths` for `@/` alias resolution.

| Test file | Covers |
|---|---|
| `checkout-bag-totals.test.ts` | `bondCartPayableTotalForFinalize`, deposit/minimum-due helpers |
| `cart-purchase-lines.test.ts` | `bagApprovalPolicy`, display-line expansion |
| `bond-cart-removal.test.ts` | cart item removal id selection and fallback behavior |
| `bond-finalize-response.test.ts` | `parseFinalizeCartResponse` |
| `session-cart-snapshot.test.ts` | `coerceCartFromApi`, `positiveBondCartId` |
| `required-products-extended.test.ts` | membership type/renewal/customer-type display parsing |
| `session-cart-grouping.test.ts` | participant-aware grouping for mixed-family carts |
| `online-booking-create-body.test.ts` | create payload shape, including required products during cart merge |
