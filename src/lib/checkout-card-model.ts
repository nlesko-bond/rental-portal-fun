/**
 * Card model for the **bag drawer** redesign (Figma: cart states 1.1 / 1.2 / 1.3 / 1.4).
 *
 * Builds on top of `expandSnapshotForPurchaseList(... { structuredBagMeta: true })` so we get the
 * same battle-tested title / resource / date / time / amount / discount / badge resolution that
 * the legacy bag and payment-step rows use. We then **group** sequential `addon` lines under the
 * preceding rental booking so the Figma "one card per item, with extras rolled up" layout works.
 *
 * Why not call the Bond DTO directly: Bond names rental cart items "{firstName} Reservation" and
 * spreads resource / schedule data across `metadata`, `space`, `reservation`, and `slotControlKey`
 * payloads (and a session `displayLines` cache for pending merges). `expandSnapshotForPurchaseList`
 * already handles every shape; reading raw `cart.cartItems[].product.name` produces "Russell
 * burgess Reservation" with no resource and a $0 base price.
 */

import {
  expandSnapshotForPurchaseList,
  type CartPurchaseDisplayLine,
} from "@/lib/cart-purchase-lines";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";

/** Visual variant of a `CheckoutItemCard`. Drives layout + which meta lines / badges render. */
export type CheckoutCardKind =
  | "rental"
  | "reservation_addon"
  | "membership"
  | "commerce"
  | "other";

/** Icon hint for a meta row inside the card body. */
export type CheckoutCardMetaIcon = "person" | "location" | "date" | "membership" | "category";

export type CheckoutCardMetaLine = {
  icon: CheckoutCardMetaIcon;
  text: string;
};

export type CheckoutCardBadgeKind = "approval" | "deposit_optional" | "promo";

export type CheckoutCardBadge = {
  kind: CheckoutCardBadgeKind;
  text: string;
};

export type CheckoutCardExtrasSummary = {
  count: number;
  amount: number;
};

export type CheckoutCardModel = {
  /** Stable React key — derived from the underlying `CartPurchaseDisplayLine.key`. */
  key: string;
  kind: CheckoutCardKind;
  /** Top-level `cartItem.id` for the remove API call. `null` when bag remove is subsection-only. */
  cartItemId: number | null;
  /** Snapshot index in the bag — needed by the existing `onRemoveBagLine` callback. */
  snapshotIndex: number;
  /** Flattened cart-line indices this card covers (rental + its rolled-up add-ons). */
  cartFlatLineIndices: number[];
  removable: boolean;
  title: string;
  participantLabel: string | null;
  metaLines: CheckoutCardMetaLine[];
  badges: CheckoutCardBadge[];
  /** Roll-up "Extras (N items) $X" line for a rental — `null` for non-rental cards. */
  extras: CheckoutCardExtrasSummary | null;
  /** Net (post-discount) base price for the rental row. Same as `itemTotal − extras.amount`. */
  basePrice: number;
  /** List price before line discount (rental line) — drives the strike-through next to base price. */
  baseStrikeAmount: number | null;
  /** Card-level total (rental + extras for a rental, line amount for everything else). */
  itemTotal: number;
  approvalRequired: boolean;
  /** Whole-cart "remove subsection" action (rental cascade) — set on rental cards only. */
  removeKind: "line" | "subsection";
};

const ROUND = (v: number) => Math.round(v * 100) / 100;

/** Pull the flat cart-line index back out of the key shape `expandSnapshotForPurchaseList` produces. */
function flatLineIndexFromLineKey(key: string, snapshotIndex: number): number {
  const m = key.match(new RegExp(`^snap-${snapshotIndex}-(?:pending|saved|item)-(\\d+)-`));
  if (m) return Number(m[1]);
  return 0;
}

function metaLinesFromBondMeta(
  bagMeta: CartPurchaseDisplayLine["bagMetaRows"] | undefined,
  fallbackMeta: string,
): CheckoutCardMetaLine[] {
  const out: CheckoutCardMetaLine[] = [];
  if (bagMeta?.participant) out.push({ icon: "person", text: bagMeta.participant });
  if (bagMeta?.resource) out.push({ icon: "location", text: bagMeta.resource });
  const dateText = bagMeta?.dateLine
    ? bagMeta.timeLine
      ? `${bagMeta.dateLine} · ${bagMeta.timeLine}`
      : bagMeta.dateLine
    : bagMeta?.timeLine ?? "";
  if (dateText) {
    out.push({ icon: "date", text: dateText });
  } else if (out.length === 0 && fallbackMeta) {
    out.push({ icon: "date", text: fallbackMeta });
  }
  return out;
}

function badgesFromLine(line: CartPurchaseDisplayLine): CheckoutCardBadge[] {
  const out: CheckoutCardBadge[] = [];
  if (line.approvalPending) out.push({ kind: "approval", text: "Approval required" });
  if (line.depositRequired) out.push({ kind: "deposit_optional", text: "Deposit available" });
  if (line.discountNote) out.push({ kind: "promo", text: line.discountNote });
  return out;
}

/** Walk one snapshot's purchase lines and emit cards (rental + addon roll-up). */
export function checkoutCardsFromSnapshot(
  snapshot: SessionCartSnapshot,
  snapshotIndex: number,
): CheckoutCardModel[] {
  const lines = expandSnapshotForPurchaseList(snapshot, snapshotIndex, {
    omitBookingLabelInMeta: true,
    structuredBagMeta: true,
    hideVenueApprovalLineNotes: true,
  });

  const cards: CheckoutCardModel[] = [];
  let currentRental: CheckoutCardModel | null = null;

  for (const line of lines) {
    const flatIdx = flatLineIndexFromLineKey(line.key, snapshotIndex);
    const baseAmount = typeof line.amount === "number" && Number.isFinite(line.amount) ? line.amount : 0;

    if (line.lineKind === "addon" && currentRental) {
      const summary = currentRental.extras ?? { count: 0, amount: 0 };
      currentRental.extras = {
        count: summary.count + 1,
        amount: ROUND(summary.amount + baseAmount),
      };
      currentRental.itemTotal = ROUND(currentRental.itemTotal + baseAmount);
      currentRental.cartFlatLineIndices.push(flatIdx);
      continue;
    }

    const kind: CheckoutCardKind =
      line.lineKind === "membership"
        ? "membership"
        : line.lineKind === "addon"
          ? "reservation_addon"
          : "rental";

    const removeKind: "line" | "subsection" = kind === "rental" ? "subsection" : "line";
    const cartItemId =
      line.bagRemove?.kind === "line" ? line.bagRemove.cartItemId : null;
    const removable = line.bagRemove != null && kind !== "membership";

    const baseStrikeAmount =
      typeof line.strikeAmount === "number" &&
      Number.isFinite(line.strikeAmount) &&
      line.strikeAmount > baseAmount + 0.005
        ? ROUND(line.strikeAmount)
        : null;

    const card: CheckoutCardModel = {
      key: line.key,
      kind,
      cartItemId,
      snapshotIndex,
      cartFlatLineIndices: [flatIdx],
      removable,
      title: line.title,
      participantLabel: line.bagMetaRows?.participant ?? null,
      metaLines: metaLinesFromBondMeta(line.bagMetaRows, line.meta),
      badges: badgesFromLine(line),
      extras: null,
      basePrice: ROUND(baseAmount),
      baseStrikeAmount,
      itemTotal: ROUND(baseAmount),
      approvalRequired: line.approvalPending === true,
      removeKind,
    };

    cards.push(card);
    currentRental = kind === "rental" ? card : null;
  }

  return cards;
}

/** Convenience: walk every snapshot in the bag and produce a flat list of cards in display order. */
export function checkoutCardsFromBag(bagSnapshots: readonly SessionCartSnapshot[]): CheckoutCardModel[] {
  const out: CheckoutCardModel[] = [];
  bagSnapshots.forEach((snap, idx) => {
    out.push(...checkoutCardsFromSnapshot(snap, idx));
  });
  return out;
}
