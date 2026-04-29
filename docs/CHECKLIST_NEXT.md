# Next-up working checklist

> Throwaway scratchpad — agent-readable to-do list for the **next set of tracks** in this branch sequence. Delete or fold into `docs/IMPLEMENTATION_AND_ROADMAP.md` when each track lands.

**Branch context:** Started from `fix/product-card-single-tag` after the addons + booking-summary redesign. Each track below should be its own focused branch off `main`.

---

## 0a. STILL OPEN: Membership renewal cadence — blocked on Bond API field

**What we know from the BFF logs (`/products/:id/user/:uid/required`):**
- Each membership product node has these top-level keys:
  `id, organizationId, name, quantity, description, downpayment, startDate, endDate, prices, isAll, isProRated, taxes, timezone, productType, required, requiredProducts, isGated, isPunchPass, packages`
- `endDate: "2200-01-01"` is a **sentinel** ("no real expiration" — auto-renewing). Do **not** display.
- `prices[].name` is the product name, not the cadence (the prior bug).
- `membership` / `resource.membership.durationMonths` is **not** present on this endpoint — that field only shows up after the membership is added to a cart.
- In the latest response, `packages` is present as a key but resolves to `null`, so there is no structured renewal period to extract from the current required-products payload.

**Current product decision:** do not infer cadence from descriptions or marketing text. Until the API includes a structured cadence on required-products, render the amount without a `/ period` suffix.

**Until then:** memberships with no derivable cadence render `"$44"` alone, which is the correct conservative output rather than the prior bogus `"exp Dec 31, 2199"` or `"/ Gold membership"` suffix.

---

## 0. STILL OPEN: "Pay minimum due" returns "invalid payment information"

**Symptom (user-reported, persists after the cart-only `cartChargeableMinimum = cart.minimumPrice` fix):**
Clicking "Pay minimum due" on a deposit-eligible booking still flashes `Invalid payment information` from Bond's `/finalize` endpoint.

**What we've ruled out:**
- We are no longer summing `product.downpayment` + `cart.minimumDownpayment` (that double-count is gone).
- `cartChargeableMinimum(cart)` now returns `cart.minimumPrice` exactly.
- We hide the Pay-min CTA when `minimumPrice >= price`.

**What still to check (next session):**
1. **`amountToPay` rounding.** Bond may reject a value with floating-point fuzz (`88.6200000001`). Confirm `bondCartPayableTotalForFinalize()` and the place that hands `amountToPay` to `finalizeCart` round to 2 decimals (or send cents int).
2. **Multiple bags.** When the user has more than one cart in the bag, we currently sum `cartChargeableMinimum` across snapshots and POST a single number — but each Bond `finalize` call is per-cart. Confirm we're sending the right per-cart amount on each request, not the aggregate.
3. **Currency.** Make sure we send `cart.currency` (not USD-by-default) on the finalize payload.
4. **BFF-side correlation.** Add a one-shot debug log in `route.ts` for `POST /carts/:id/finalize` that prints the body alongside the GET-cart shape we already log, so we can diff `amountToPay` vs `minimumPrice` for the failing cart.

**Files to touch first:**
- `src/lib/checkout-bag-totals.ts` — `bondCartPayableTotalForFinalize`
- `src/components/booking/BookingCheckoutDrawer.tsx` — search for `finalizeCart(` and the `amountToPay` payload
- `src/app/api/bond/[...path]/route.ts` — add finalize-payload logging

---

## 1. Mobile drawer width — **HIGH PRIORITY** (feels broken on phones)

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

## 1b. Empty cart state when last item is removed — **DONE** (2026-04-28)

**Shipped:** Drawer no longer auto-closes when the bag empties. Bag-mode renders a proper empty state (icon, headline, subtitle, "Keep browsing" CTA) inside `BookingCheckoutDrawer.tsx`. Both `onRemoveBagLine` branches in `BookingExperience.tsx` updated; the X / "Keep browsing" paths still close as expected.

---

### Original spec (kept for posterity)

**Symptom:** When the user removes the last item from the bag, the bag drawer **closes entirely**. They lose context — they expect to see "Your cart is empty" with a clear way to keep browsing.

**Where:** `src/components/booking/BookingExperience.tsx` `onRemoveBagLine` callback. Currently:
```ts
if (next.length === 0) {
  setCheckoutDrawerOpen(false);
  clearSlotSelection();
}
```

**Fix:**
- Keep the drawer open when bag becomes empty (drop the `setCheckoutDrawerOpen(false)`).
- Add an empty-cart state inside `BookingCheckoutDrawer.tsx` bag mode: friendly headline ("Your cart is empty"), a "Keep browsing" CTA that closes the drawer, optional illustration.
- `clearSlotSelection()` is still appropriate (no in-progress booking to keep around if the bag is gone).

**Acceptance:**
- Remove last bag item → drawer stays open, shows empty state.
- "Keep browsing" closes the drawer and returns to the portal.
- Auto-close still happens if the user explicitly hits X.

---

## 2. Cart review — verify correctness

**Goal:** End-to-end audit that the cart line items, totals, and remove flow match Bond's authoritative cart shape — especially after adds/removes/merges.

**Areas to walk through:**
- `src/lib/bond-cart-api.ts` — `getOrganizationCart`, `removeCartItem(WithIllegalPriceFallback)`, `closeCart`, `finalizeCart`
- `src/lib/bond-cart-removal.ts` — `bondRootCartItemIdForRemoval`, `bagRemovePolicyForBondItem` (subsection vs line cascade)
- `src/lib/checkout-bag-totals.ts` — `bondCartPayableTotalForFinalize` (approval-aware), `flattenBondCartItemNodes`, `aggregateBag*`
- `src/lib/cart-purchase-lines.ts` — `bagApprovalPolicy` (`all_pay | all_submission | mixed`), `expandSnapshotForPurchaseList`
- `src/lib/session-cart-snapshot.ts` — `coerceCartFromApi`, `loadSessionCartSnapshots`, `positiveBondCartId`

**Known issues** (from `docs/IMPLEMENTATION_AND_ROADMAP.md` — fix during this pass):
1. **Mixed-cart `finalize` 400** — `bondCartPayableTotalForFinalize` and `computedDepositDollars` sum the **whole** cart; must exclude approval-required products from `amountToPay`. Both "Pay in full" and "Pay minimum due" fail on mixed carts today.
2. **Spurious 2nd `DELETE cart-item` 400** after a subsection cascade — Bond returns 400 for the now-orphaned child id. Cart clears correctly; noise only. Suspect: legacy per-line X button at the old offset (now removed?), or rapid-fire clicks racing.
3. **Confirmation screen regression in prod** — after `finalizeCart` succeeds, "Booking Confirmed" / "Booking Submitted" view doesn't render. Audit `BookingCheckoutDrawer.tsx` `submitBookingRequestMutation.onSuccess`, `parseFinalizeCartResponse`, `answersStaleAfterFinalizeRef`, parent `onFinalizeBookingSuccess` ordering, and Bond response shape (`204` vs `201`).

**Add tests for:**
- `bondCartPayableTotalForFinalize` w/ mixed carts (approval items excluded)
- `parseFinalizeCartResponse` w/ `204`/empty body case
- Cart-remove cascade end-to-end (subsection delete → no spurious child delete)

---

## 3. Figma parity — every screen

**Goal:** Walk every screen + match Figma exactly. No "close enough."

**Process suggestion:**
1. Screen-by-screen list (use the consumer flow from `docs/CONSUMER_FLOW.md` as the spine):
   - [ ] Header (logo, sign-in, theme toggle, user)
   - [ ] Selection row (facility / category / activity)
   - [ ] Sign-in strip
   - [ ] Product cards (single-tag policy already shipped on `fix/product-card-single-tag`)
   - [ ] Product detail modal
   - [ ] Date + duration + start-time pickers (incl. modal)
   - [ ] Schedule list view + calendar view + matrix/timeline view
   - [ ] Slot pills (selected / disabled / member-priced)
   - [ ] **Add-on rail** (this branch — verify against the Figma we just used)
   - [ ] Login modal
   - [ ] Booking-for drawer (family picker)
   - [ ] Membership step
   - [ ] Forms / questionnaires
   - [ ] **Booking summary** (this branch)
   - [ ] "Added to cart" confirmation
   - [ ] Bag drawer
   - [ ] Cart / payment screen
   - [ ] Booking confirmed / submitted / mixed / deposit
2. For each: Figma URL, current screenshot (light + dark + mobile), delta list, owner.
3. Track in a Notion sub-page or Jira sub-tasks under [BOND-16799](https://bond-sports.atlassian.net/browse/BOND-16799).

**Already noted gaps to chase:**
- Some `.cb-*` text uses `var(--cb-text-muted)` which can be too faint in dark mode; standardize a "strong meta" variant (we just added `cb-checkout-review-meta-rows--strong` — apply the same pattern elsewhere).
- Yellow badges (addon corner badge) — confirm Figma color matches `--cb-accent` (currently `#f7b500`).
- Card border thickness on selected state — we use 2px; Figma may differ.

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
| Mixed cart (approval + pay-now) | **Currently broken** — see track #2 |
| With required membership | Membership step lets user add the required pass; then proceeds to forms/summary |
| With questionnaires | Forms step auto-collapses panel when fully satisfied; can't continue with mandatory unanswered |
| With per-slot addons | This branch — verify across all flows |
| With per-reservation addons | This branch — verify stepper works, qty persists into cart |

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
- **Track sequencing:** ship #1 (mobile width — quick, blocking) → #2 (cart correctness — production bugs) → #3 (Figma parity) → #4 (flow QA) → #5 (refactor).
