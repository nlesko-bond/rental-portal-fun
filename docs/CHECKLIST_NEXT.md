# Next-up working checklist

Current handoff list for the rental portal polish pass. Keep this short and fold completed tracks into `docs/IMPLEMENTATION_AND_ROADMAP.md`.

**Branch context:** Work is currently on `main`. Start the next focused branch from `main` unless explicitly asked to commit directly.

---

## Shipped in the last pass

- **Membership create payloads:** satisfied memberships (`required: false`) are eligibility context only. They are not sent in `requiredProducts` unless the customer actively selects a membership to purchase.
- **Required-products metadata:** membership display reads structured fields from `GET .../products/{productId}/user/{userId}/required`, including nested membership records, `membershipType`, `durationMonths`, `endDate`, and `customerType` when Bond returns it. No product-name inference.
- **Mixed-participant cart grouping:** cart rows now prefer Bond participant/product-user ownership from `cartItems` and keep membership/add-on lines with the correct participant segment.
- **Membership/deposit display:** booking summary and cart cards use required-products metadata for membership type/renewal details, and carry product downpayment metadata so deposit badges survive cart refresh/merge.
- **Cart remove for complex rows:** deletion collects all removable cart item ids for a booking segment and removes children before roots.
- **Welcome toast:** short duration with a dismiss button.
- **Regression tests added:** `online-booking-create-body.test.ts`, `required-products-extended.test.ts`, `session-cart-grouping.test.ts`, and `bond-cart-removal.test.ts` cover the recent membership/cart fixes.

---

## 0. Verify live: "Pay minimum due"

**Why still on the list:** code and tests now use Bond's `cart.minimumPrice` for the minimum-due path, but this needs one more live end-to-end confirmation on the current API.

**Current implementation:**
- `cartChargeableMinimum(cart)` returns `cart.minimumPrice` only when the cart has a real deposit signal and `minimumPrice < price`.
- `bondCartPayableTotalForFinalize()` still sends full `cart.price` for the full-pay path.
- Tests in `checkout-bag-totals.test.ts` cover full-pay vs minimum-due behavior.

**Live QA checklist:**
1. Deposit-eligible purchase-only cart → Pay minimum due succeeds.
2. Deposit-eligible purchase-only cart → Pay full succeeds.
3. Cart with no deposit → no minimum-due option.
4. Multiple bag rows → each finalize request sends the per-cart amount, not an aggregate from another cart.

**Files to touch first:**
- `src/lib/checkout-bag-totals.ts` — `bondCartPayableTotalForFinalize`
- `src/components/booking/BookingCheckoutDrawer.tsx` — search for `finalizeCart(` and the `amountToPay` payload
- `src/app/api/bond/[...path]/route.ts` — add finalize-payload logging

---

## 1. Mobile drawer width — high priority

**Symptom:** On mobile, the right drawer (`RightDrawer.tsx`) is too wide, forcing horizontal scroll on the underlying page. The drawer should clamp to **`min(100vw, …)`** so it never exceeds viewport width.

**Files to audit:**
- `src/components/ui/RightDrawer.tsx`
- Any `.cb-right-drawer-*` rules in `src/app/globals.css` (search for `cb-right-drawer`, `cb-checkout-drawer`)
- `BookingCheckoutDrawer.tsx` for any inline width / `min-w-*` Tailwind classes

**Acceptance:**
- iPhone SE width (375px) → drawer fits, no horizontal page scroll
- iPad (768px) → drawer is reasonable width (480–520px feels right), still no horizontal scroll
- Desktop ≥1068px → unchanged
- Body scroll lock continues to work (uses `body-scroll-lock.ts`)

**Quick fix idea:** `width: min(100vw, 28rem)` on the drawer panel; ensure `box-sizing: border-box` and no children overflow horizontally.

---

## 2. Cart review — remaining live QA

**Goal:** End-to-end audit that the cart line items, totals, and remove flow match Bond's authoritative cart shape — especially after adds/removes/merges.

**Areas to walk through:**
- `src/lib/bond-cart-api.ts` — `getOrganizationCart`, `removeCartItem(WithIllegalPriceFallback)`, `closeCart`, `finalizeCart`
- `src/lib/bond-cart-removal.ts` — removable id collection and child-before-root deletion helpers
- `src/lib/checkout-bag-totals.ts` — `bondCartPayableTotalForFinalize` (approval-aware), `flattenBondCartItemNodes`, `aggregateBag*`
- `src/lib/cart-purchase-lines.ts` — `bagApprovalPolicy` (`all_pay | all_submission | mixed`), `expandSnapshotForPurchaseList`
- `src/lib/session-cart-snapshot.ts` — `coerceCartFromApi`, `loadSessionCartSnapshots`, `positiveBondCartId`

**Remaining checks:**
1. **Mixed cart finalize:** approval-required products must be excluded from pay-now `amountToPay`; verify both Pay full and Pay minimum due against Bond.
2. **Remove complex cart rows:** memberships, slot add-ons, reservation add-ons, and root rental rows should disappear together with no visible error.
3. **Confirmation screen:** after `finalizeCart` succeeds, the "Booking Confirmed" / "Booking Submitted" view should render reliably in local and production-like builds. Audit `BookingCheckoutDrawer.tsx` `submitBookingRequestMutation.onSuccess`, `parseFinalizeCartResponse`, `answersStaleAfterFinalizeRef`, parent `onFinalizeBookingSuccess` ordering, and Bond response shape (`204` vs `201`).

**Tests still worth adding:**
- `parseFinalizeCartResponse` with the exact production success payload if Bond differs from the fixtures.
- A create-payload test for "already owns membership" once a minimal required-products fixture is extracted.

---

## 3. Figma parity — every screen

**Goal:** Walk every screen + match Figma exactly. No "close enough."

**Process suggestion:**
1. Screen-by-screen list (use the consumer flow from `docs/CONSUMER_FLOW.md` as the spine):
   - [ ] Header (logo, sign-in, theme toggle, user)
   - [ ] Selection row (facility / category / activity)
   - [ ] Sign-in strip
   - [ ] Product cards
   - [ ] Product detail modal
   - [ ] Date + duration + start-time pickers (incl. modal)
   - [ ] Schedule list view + calendar view + matrix/timeline view
   - [ ] Slot pills (selected / disabled / member-priced)
   - [ ] Add-on rail (horizontal rail, scroll affordance, quantity steppers)
   - [ ] Login modal
   - [ ] Booking-for drawer (family picker)
   - [ ] Membership step
   - [ ] Forms / questionnaires
   - [ ] Booking summary membership/rental/add-on cards
   - [ ] "Added to cart" confirmation
   - [ ] Bag drawer
   - [ ] Cart / payment screen
   - [ ] Booking confirmed / submitted / mixed / deposit
2. For each: Figma URL, current screenshot (light + dark + mobile), delta list, owner.
3. Track in a Notion sub-page or Jira sub-tasks under [BOND-16799](https://bond-sports.atlassian.net/browse/BOND-16799).

**Already noted gaps to chase:**
- Some `.cb-*` text uses `var(--cb-text-muted)` which can be too faint in dark mode; standardize a strong-meta variant where Figma needs higher contrast.
- Yellow badges and notification pills: confirm whether Figma wants `--cb-accent` or a separate token.
- Card selected border thickness and shadow: verify against Figma per card type.
- Confirmation screen still needs the updated Figma pass.

---

## 4. End-to-end flow QA

**Goal:** Run every consumer flow path manually + confirm no regressions.

**Flow matrix** (from `docs/CONSUMER_FLOW.md`, condensed):

| State | Path |
|---|---|
| Guest | Land → pick facility/category/activity → product → date+slots → click Add to cart → forced login → … |
| Returning logged-in, single user | Schedule shows member pricing → pick slots → addons → forms → booking summary → cart → pay-now or submit-request |
| Multi-family account | Pick participant → required products evaluated per person → membership (if needed) → switch participant mid-flow clears membership/required correctly |
| Approval-required category | Slots picked → submit request → Bond returns approval → confirmation = "Submitted" |
| Mixed cart (approval + pay-now) | Verify against current code — see track #2 |
| With required membership | If not already owned, membership step lets user add the required pass; if already owned, gate is suppressed and no requiredProducts are sent |
| With questionnaires | Forms step auto-collapses panel when fully satisfied; can't continue with mandatory unanswered |
| With per-slot addons | Verify add-to-all and manual per-slot quantities across all flows |
| With per-reservation addons | Verify stepper works and quantity persists into cart |

**Acceptance per row:** screenshots at each stage + cart payload (browser network tab) saved to a Notion page. Any mismatch = ticket.

---

## 5. Refactor & scale

**Goal:** Break the two giant components into smaller, faster, properly-i18n'd services that follow Bond consumer process conventions.

**Concrete targets:**

### 5a. Split `BookingExperience.tsx` (~2.6k lines)
- `BookingHeader` — logo, breadcrumbs, sign-in, theme
- `BookingProductGrid` — product card grid + pagination
- `BookingScheduleSection` — date/duration/start-time + schedule grid (wraps `ScheduleMatrix` / `ScheduleCalendarView`)
- `BookingAddonsSection` — wraps `BookingAddonPanel`, owns visibility logic
- `useBookingState` (hook) — current `useBookingUrlState` + slot/addon/targeting state
- `useBondEnv` (hook) — already pattern-named; extract for real
- `BookingExperience` becomes a thin orchestrator (<300 lines)

### 5b. Split `BookingCheckoutDrawer.tsx` (~4.7k lines)
- `CheckoutShell` — drawer + step header + nav + back button
- `CheckoutStepAddons`
- `CheckoutStepMembership`
- `CheckoutStepForms`
- `CheckoutStepSummary` (the big booking-review block)
- `CheckoutStepCart` (bag + payment)
- `CheckoutStepConfirmation`
- Hooks: `useCheckoutFlow`, `useCheckoutCart`, `useFinalize`, `useRequiredProducts`

### 5c. Performance
- Memoize big derived models (`syntheticBookingReviewModel`, `groupedBagWithTotals`, `paymentLines`) — already memoized; audit deps.
- Lazy-load step components with `next/dynamic` so the bag/payment code doesn't ship until needed.
- Image optimization for product cards: switch to `next/image` if not already.
- Bundle-analyze (`pnpm dlx @next/bundle-analyzer`) and trim heavy imports.

### 5d. i18n hygiene
- Extract every literal string in checkout drawer + summary to `messages/en.json` (some still hardcoded).
- Add `messages/es.json` skeleton + locale-detection in `next-intl` config (consumer-facing; pick highest-traffic locales first).

### 5e. Bond consumer process alignment
- Confirm our flow matches Bond's documented consumer process (Slack #consumer-portal channel + Bond design docs).
- Move all client-side cart math into `src/lib/checkout-bag-totals.ts` with full Vitest coverage.
- Generated OpenAPI types (`pnpm dlx openapi-typescript https://public.api.squad-c.bondsports.co/public-api/bond-public-api.json`) + replace hand-rolled `src/types/online-booking.ts` interfaces (or merge).

### 5f. File-size budget
- Every component file ≤ ~600 lines after the split.
- Every `src/lib/*.ts` ≤ ~400 lines, each with at least one named test.
- ESLint rule (`max-lines`) once we hit the budget across the codebase.

---

## Cross-cutting reminders

- **No new Bond endpoints without updating the BFF allowlist** (`src/app/api/bond/[...path]/route.ts`).
- **Cart math lives in lib + tests** — never inline new totals logic in components.
- **Workspace rules apply** — see `AGENTS.md` §15: no `any`, no inline narration comments, no magic numbers, no emojis in code.
- **Track sequencing:** ship #1 (mobile width) → #2 (cart/payment live QA) → #3 (Figma parity) → #4 (flow QA) → #5 (refactor).
