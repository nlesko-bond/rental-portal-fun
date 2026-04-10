import { classifyCartItemLineKind, type CartLineKind } from "@/lib/bond-cart-item-classify";
import {
  cartItemLineAmountFromDto,
  computeBondLineStrikeAmount,
  describeCartItemDiscountLabels,
  flattenBondCartItemNodes,
  getBondCartReceiptLineItems,
  resolveBondLineDisplayAmounts,
} from "@/lib/checkout-bag-totals";
import type { OrganizationCartDto } from "@/types/online-booking";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";

export type BagApprovalPolicy = "all_submission" | "all_pay" | "mixed";

export type CartPurchaseDisplayLine = {
  key: string;
  title: string;
  meta: string;
  /** Mixed cart: how this line is settled (approval vs pay). */
  checkoutNote?: string;
  amount: number | null;
  lineKind?: "booking" | "membership" | "addon";
  /** Shown under meta when participant already has qualifying membership and reservation is $0. */
  memberAccessNote?: string;
  /** Membership / promo / Bond line discount — shown under meta (name, %, code). */
  discountNote?: string;
  /** Pre-discount list price (rental line only) when Bond sends strike vs net. */
  strikeAmount?: number;
};

/** How checkout/payment applies across bag rows (per-category approval at add time). */
export function bagApprovalPolicy(rows: SessionCartSnapshot[]): BagApprovalPolicy {
  if (rows.length === 0) return "all_pay";
  const flags = rows.map((r) => r.approvalRequired === true);
  const all = flags.every(Boolean);
  const none = flags.every((f) => !f);
  if (all) return "all_submission";
  if (none) return "all_pay";
  return "mixed";
}

function bookingBitForMeta(row: SessionCartSnapshot, omitBookingLabelInMeta: boolean): string {
  if (omitBookingLabelInMeta) return "";
  return typeof row.bookingForLabel === "string" && row.bookingForLabel.length > 0
    ? ` · ${row.bookingForLabel}`
    : "";
}

/** Line meta only — venue approval for rentals & add-ons is explained once at order level when `approvalRequired`. */
function buildLineMeta(opts: {
  cartId: number;
  bookingBit: string;
  kind: CartLineKind;
  scheduleSummary?: string;
}): string {
  const bb = opts.bookingBit;
  const sched = opts.scheduleSummary?.trim();
  if (opts.kind === "membership") {
    return `Membership charge${bb}`;
  }
  if (opts.cartId <= 0) {
    if (sched) return `${sched}${bb}`;
    return `In your order${bb}`;
  }
  return `In your order${bb}`;
}

function savedLineMetaOrFallback(
  lineMeta: string | undefined,
  row: SessionCartSnapshot,
  opts: {
    cartId: number;
    bookingBit: string;
    kind: CartLineKind;
    scheduleSummary?: string;
  }
): string {
  if (typeof lineMeta === "string" && lineMeta.trim().length > 0) return lineMeta;
  const name = row.productName?.trim() ?? "Booking";
  const bit = opts.bookingBit;
  const glue = bit.length > 0 ? `${name}${bit}` : name;
  return glue.length > 0 ? glue : buildLineMeta(opts);
}

function checkoutNoteForMixedLine(
  policy: BagApprovalPolicy | undefined,
  kind: CartLineKind,
  rowApprovalRequired: boolean,
  hideVenueApprovalLineNotes?: boolean
): string | undefined {
  if (policy !== "mixed") return undefined;
  if (kind === "membership") return "Pay now";
  if (hideVenueApprovalLineNotes && rowApprovalRequired) return undefined;
  return rowApprovalRequired ? "Submits for venue approval" : "Pay at checkout";
}

function mergeDiscountNotes(...parts: (string | undefined)[]): string | undefined {
  const s = parts
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim());
  return s.length > 0 ? s.join(" · ") : undefined;
}

/** When the cart groups by person, strip trailing ` · For {name}` from saved slot summaries (heading already names them). */
function stripBookingForFromMeta(meta: string, bookingForLabel: string | undefined, omit: boolean): string {
  if (!omit) return meta;
  const name = bookingForLabel?.trim();
  if (!name) return meta;
  const suffix = ` · For ${name}`;
  if (meta.endsWith(suffix)) return meta.slice(0, -suffix.length).trimEnd();
  return meta;
}

function scheduleSummaryForLineMeta(
  raw: string | undefined,
  bookingForLabel: string | undefined,
  omit: boolean
): string | undefined {
  if (typeof raw !== "string" || raw.trim().length === 0) return undefined;
  const s = stripBookingForFromMeta(raw.trim(), bookingForLabel, omit);
  return s.length > 0 ? s : undefined;
}

/**
 * Renders one or more purchase rows per session snapshot: prefers client `displayLines`
 * from add-to-cart, then Bond `cartItems`, then a single line from `productName` / totals.
 */
export function expandSnapshotForPurchaseList(
  row: SessionCartSnapshot,
  rowIndex: number,
  options?: {
    omitBookingLabelInMeta?: boolean;
    bagPolicy?: BagApprovalPolicy;
    /** When true and category uses venue approval, omit per-line “Submits for venue approval” (order-level notice). */
    hideVenueApprovalLineNotes?: boolean;
  }
): CartPurchaseDisplayLine[] {
  const c = row.cart as OrganizationCartDto;
  const cartId = c.id;
  const omit = options?.omitBookingLabelInMeta === true;
  const policy = options?.bagPolicy;
  const bookingBit = bookingBitForMeta(row, omit);
  const rowApproval = row.approvalRequired === true;
  const hideVenueNotes = options?.hideVenueApprovalLineNotes === true;
  const scheduleForMeta = scheduleSummaryForLineMeta(row.scheduleSummary, row.bookingForLabel, omit);

  const saved = row.displayLines;
  const flatForDiscount =
    Array.isArray(saved) && saved.length > 0
      ? flattenBondCartItemNodes(c.cartItems as unknown[] | undefined)
      : [];
  const bondReceiptLines =
    Array.isArray(saved) && saved.length > 0 ? getBondCartReceiptLineItems(c) : [];
  const bondZipOk =
    Array.isArray(saved) &&
    bondReceiptLines.length > 0 &&
    bondReceiptLines.length === saved.length;

  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map((line, j) => {
      const kind = line.lineKind ?? "booking";
      const kindMeta: CartLineKind =
        kind === "membership" ? "membership" : kind === "addon" ? "addon" : "booking";
      const metaFallback = buildLineMeta({
        cartId,
        bookingBit,
        kind: kindMeta,
        scheduleSummary: scheduleForMeta,
      });
      const metaRaw =
        typeof line.meta === "string" && line.meta.trim().length > 0
          ? line.meta
            : savedLineMetaOrFallback(undefined, row, {
              cartId,
              bookingBit,
              kind: kindMeta,
              scheduleSummary: scheduleForMeta,
            });
      const metaJoined = metaRaw.trim().length > 0 ? metaRaw : metaFallback;
      const meta = stripBookingForFromMeta(metaJoined, row.bookingForLabel, omit);
      const coKind: CartLineKind =
        kind === "membership" ? "membership" : kind === "addon" ? "addon" : "booking";
      const amt = line.amount;
      const memberAccessNote =
        row.participantHasQualifyingMembership === true &&
        kind === "booking" &&
        typeof amt === "number" &&
        Number.isFinite(amt) &&
        amt <= 0.0001
          ? "Qualifying membership — reservation at member rate ($0)"
          : undefined;
      const bondItem = flatForDiscount[j];
      const bondLine = bondZipOk ? bondReceiptLines[j] : undefined;
      const bondItemLabels =
        (kindMeta === "booking" || kindMeta === "membership") && bondItem
          ? describeCartItemDiscountLabels(bondItem)
          : undefined;
      const discountNote = mergeDiscountNotes(
        line.discountNote,
        bondZipOk ? bondLine?.discountNote ?? bondItemLabels : bondItemLabels
      );
      const netFromBond =
        bondItem && typeof bondItem === "object"
          ? cartItemLineAmountFromDto(bondItem)
          : null;
      const displayBase =
        netFromBond != null && Number.isFinite(netFromBond) ? netFromBond : amt;
      const resolved =
        bondItem &&
        (kindMeta === "booking" || kindMeta === "membership") &&
        typeof displayBase === "number" &&
        Number.isFinite(displayBase)
          ? resolveBondLineDisplayAmounts(bondItem as Record<string, unknown>, kindMeta)
          : null;
      const strikeAmount =
        bondLine?.strikeAmount ??
        resolved?.strike ??
        ((kindMeta === "booking" || kindMeta === "membership") &&
        bondItem &&
        typeof displayBase === "number" &&
        Number.isFinite(displayBase)
          ? computeBondLineStrikeAmount(bondItem as Record<string, unknown>, displayBase)
          : undefined);
      const amount =
        bondLine != null && Number.isFinite(bondLine.amount) ? bondLine.amount : resolved?.net ?? displayBase;
      return {
        key: `snap-${rowIndex}-saved-${j}-${cartId}`,
        title: line.title,
        meta,
        checkoutNote: checkoutNoteForMixedLine(policy, coKind, rowApproval, hideVenueNotes),
        amount,
        lineKind: line.lineKind,
        memberAccessNote,
        ...(discountNote ? { discountNote } : {}),
        ...(strikeAmount != null ? { strikeAmount } : {}),
      };
    });
  }

  const items = c.cartItems;
  if (Array.isArray(items) && items.length > 0) {
    const flat = flattenBondCartItemNodes(items);
    const lines: CartPurchaseDisplayLine[] = [];
    flat.forEach((o, i) => {
      const fromItem = cartItemLineAmountFromDto(o);
      if (fromItem == null) return;
      const it = o as Record<string, unknown>;
      const kind = classifyCartItemLineKind(it);
      const title =
        kind === "booking" && typeof row.productName === "string" && row.productName.length > 0
          ? `${row.productName} — reservation`
          : titleFromCartItem(it);
      const meta = buildLineMeta({
        cartId,
        bookingBit,
        kind,
        scheduleSummary: scheduleForMeta,
      });
      const note = checkoutNoteForMixedLine(policy, kind, rowApproval, hideVenueNotes);
      const memberAccessNote =
        row.participantHasQualifyingMembership === true &&
        kind === "booking" &&
        fromItem <= 0.0001
          ? "Qualifying membership — reservation at member rate ($0)"
          : undefined;
      const discountNote =
        kind === "booking" || kind === "membership"
          ? describeCartItemDiscountLabels(it)
          : undefined;
      const resolved = kind === "booking" || kind === "membership" ? resolveBondLineDisplayAmounts(it, kind) : null;
      const lineAmount = resolved?.net ?? fromItem;
      const strikeAmount =
        resolved?.strike ??
        (kind === "booking" || kind === "membership"
          ? computeBondLineStrikeAmount(it, lineAmount)
          : undefined);
      lines.push({
        key: `snap-${rowIndex}-item-${i}-${cartId}`,
        title,
        meta,
        checkoutNote: note,
        amount: lineAmount,
        lineKind: kind,
        memberAccessNote,
        ...(discountNote ? { discountNote } : {}),
        ...(strikeAmount != null ? { strikeAmount } : {}),
      });
    });
    if (lines.length > 0) return lines;
  }

  const lineTotal =
    typeof c.subtotal === "number" && Number.isFinite(c.subtotal)
      ? c.subtotal
      : typeof c.price === "number" && Number.isFinite(c.price)
        ? c.price
        : null;

  return [
    {
      key: `snap-${rowIndex}-main-${cartId}`,
      title: row.productName,
      meta: buildLineMeta({
        cartId,
        bookingBit,
        kind: "booking",
        scheduleSummary: scheduleForMeta,
      }),
      checkoutNote: checkoutNoteForMixedLine(policy, "booking", rowApproval, hideVenueNotes),
      amount: lineTotal,
      lineKind: "booking",
      memberAccessNote:
        row.participantHasQualifyingMembership === true &&
        lineTotal != null &&
        Number.isFinite(lineTotal) &&
        lineTotal <= 0.0001
          ? "Qualifying membership — reservation at member rate ($0)"
          : undefined,
    },
  ];
}

export function titleFromCartItem(o: Record<string, unknown>): string {
  if (typeof o.name === "string" && o.name.length > 0) return o.name;
  if (typeof o.title === "string" && o.title.length > 0) return o.title;
  const p = o.product;
  if (p && typeof p === "object") {
    const pr = p as Record<string, unknown>;
    if (typeof pr.name === "string" && pr.name.length > 0) return pr.name;
  }
  return "Item";
}

/** Line items for FAB / labels (Bond `cartItems`, optional `displayLines`, or one row per cart). */
export function countSessionCartLineItems(rows: SessionCartSnapshot[]): number {
  return rows.reduce((acc, row, i) => acc + expandSnapshotForPurchaseList(row, i).length, 0);
}
