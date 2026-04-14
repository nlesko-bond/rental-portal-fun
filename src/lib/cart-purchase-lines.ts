import { formatSlotKeysScheduleSummary } from "@/components/booking/booking-slot-labels";
import {
  classifyCartItemLineKind,
  getCartItemMetadataDescription,
  receiptBadgeForCartLine,
  type CartLineKind,
} from "@/lib/bond-cart-item-classify";
import {
  cartItemLineAmountFromDto,
  computeBondLineStrikeAmount,
  describeCartItemDiscountLabels,
  flattenBondCartItemNodes,
  getBondCartReceiptLineItems,
  resolveBondLineDisplayAmounts,
} from "@/lib/checkout-bag-totals";
import { dedupeDiscountCaptionSegments } from "@/lib/entitlement-discount";
import type { SessionCartSnapshot } from "@/lib/session-cart-snapshot";
import { flatLineIndexSegmentsForMergedBookings } from "@/lib/session-cart-grouping";
import type { OrganizationCartDto } from "@/types/online-booking";

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
  /** Reservation vs slot add-on — from Bond `metadata.description` when present. */
  badge?: string;
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

function bookingBitForMeta(
  row: SessionCartSnapshot,
  omitBookingLabelInMeta: boolean,
  bookingForOverride?: string
): string {
  if (omitBookingLabelInMeta) return "";
  const label =
    (typeof bookingForOverride === "string" && bookingForOverride.trim().length > 0
      ? bookingForOverride.trim()
      : undefined) ??
    (typeof row.bookingForLabel === "string" && row.bookingForLabel.trim().length > 0
      ? row.bookingForLabel.trim()
      : "");
  return label.length > 0 ? ` · ${label}` : "";
}

function flatIndexToSegmentMap(cart: OrganizationCartDto): Map<number, number> {
  const segments = flatLineIndexSegmentsForMergedBookings(cart);
  const m = new Map<number, number>();
  if (segments != null) {
    for (let s = 0; s < segments.length; s++) {
      for (const idx of segments[s]!) m.set(idx, s);
    }
  }
  return m;
}

/** Slot day/time for one flattened cart line from session `reservationGroups` / `reservedSlotKeys`. */
function lineScheduleSummaryForSegment(
  row: SessionCartSnapshot,
  kind: CartLineKind,
  segmentIndex: number
): string | undefined {
  if (kind === "membership") return undefined;
  const rg = row.reservationGroups;
  if (rg != null && rg.length > 0) {
    const g = rg[segmentIndex];
    if (g == null || g.slotKeys.length === 0) return undefined;
    const s = formatSlotKeysScheduleSummary(g.slotKeys);
    return s.length > 0 ? s : undefined;
  }
  if (row.reservedSlotKeys != null && row.reservedSlotKeys.length > 0) {
    const s = formatSlotKeysScheduleSummary(row.reservedSlotKeys);
    return s.length > 0 ? s : undefined;
  }
  return undefined;
}

/** Line meta — venue approval is explained once at order level when `approvalRequired`. */
function buildLineMeta(opts: {
  bookingBit: string;
  kind: CartLineKind;
  scheduleSummary?: string;
  /** Parsed from `slotControlKey` rows for this cart line’s reservation segment. */
  lineScheduleSummary?: string;
}): string {
  const bb = opts.bookingBit;
  const lineSched = opts.lineScheduleSummary?.trim();
  const sched = opts.scheduleSummary?.trim();
  const primary = lineSched && lineSched.length > 0 ? lineSched : sched;
  if (opts.kind === "membership") {
    return `Membership charge${bb}`;
  }
  if (primary && primary.length > 0) return `${primary}${bb}`;
  return `Reservation details${bb}`;
}

function savedLineMetaOrFallback(
  lineMeta: string | undefined,
  opts: {
    bookingBit: string;
    kind: CartLineKind;
    scheduleSummary?: string;
    lineScheduleSummary?: string;
  }
): string {
  if (typeof lineMeta === "string" && lineMeta.trim().length > 0) return lineMeta;
  return buildLineMeta(opts);
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
  return dedupeDiscountCaptionSegments(s.length > 0 ? s.join(" · ") : undefined);
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
    /** Merged cart: only include these flattened `cartItems` indices. */
    cartFlatLineIndexFilter?: ReadonlySet<number>;
    /** Merged cart subsection: use this label for “For {name}” meta instead of `row.bookingForLabel`. */
    subsectionBookingForLabel?: string;
  }
): CartPurchaseDisplayLine[] {
  const c = row.cart as OrganizationCartDto;
  const cartId = c.id;
  const omit = options?.omitBookingLabelInMeta === true;
  const policy = options?.bagPolicy;
  const metaBookingFor = options?.subsectionBookingForLabel ?? row.bookingForLabel;
  const bookingBit = bookingBitForMeta(row, omit, options?.subsectionBookingForLabel);
  const rowApproval = row.approvalRequired === true;
  const hideVenueNotes = options?.hideVenueApprovalLineNotes === true;
  const scheduleForMeta = scheduleSummaryForLineMeta(row.scheduleSummary, metaBookingFor, omit);
  const idxFilter = options?.cartFlatLineIndexFilter;
  const segByFlat = flatIndexToSegmentMap(c);

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

  /** Pending checkout rows (`cart.id === 0`) use client `displayLines` only — ignore empty Bond `cartItems` so add-on lines aren’t dropped. */
  const isPendingPricePreview =
    typeof cartId === "number" && Number.isFinite(cartId) && cartId === 0;

  if (Array.isArray(saved) && saved.length > 0) {
    if (isPendingPricePreview) {
      return saved.map((line, j) => {
        const kind = line.lineKind ?? "booking";
        const kindMeta: CartLineKind =
          kind === "membership" ? "membership" : kind === "addon" ? "addon" : "booking";
        const lineSchedSeg = lineScheduleSummaryForSegment(row, kindMeta, 0);
        const metaRaw =
          typeof line.meta === "string" && line.meta.trim().length > 0
            ? line.meta.trim()
            : buildLineMeta({
                bookingBit,
                kind: kindMeta,
                scheduleSummary: scheduleForMeta,
                lineScheduleSummary: lineSchedSeg,
              });
        const meta = stripBookingForFromMeta(metaRaw, metaBookingFor, omit);
        const coKind: CartLineKind =
          kind === "membership" ? "membership" : kind === "addon" ? "addon" : "booking";
        const amt =
          typeof line.amount === "number" && Number.isFinite(line.amount)
            ? line.amount
            : typeof c.subtotal === "number" && Number.isFinite(c.subtotal)
              ? c.subtotal
              : null;
        const memberAccessNote =
          row.participantHasQualifyingMembership === true &&
          kind === "booking" &&
          amt != null &&
          amt <= 0.0001
            ? "Qualifying membership — reservation at member rate ($0)"
            : undefined;
        const pendingBadge =
          kindMeta === "addon" ? receiptBadgeForCartLine("addon", undefined) : undefined;
        return {
          key: `snap-${rowIndex}-pending-${j}-${cartId}`,
          title: line.title,
          meta,
          checkoutNote: checkoutNoteForMixedLine(policy, coKind, rowApproval, hideVenueNotes),
          amount: amt,
          lineKind: line.lineKind,
          memberAccessNote,
          ...(pendingBadge ? { badge: pendingBadge } : {}),
          ...(line.discountNote ? { discountNote: line.discountNote } : {}),
          ...(line.strikeAmount != null ? { strikeAmount: line.strikeAmount } : {}),
        };
      });
    }
    return saved.map((line, j) => {
      const kind = line.lineKind ?? "booking";
      const kindMeta: CartLineKind =
        kind === "membership" ? "membership" : kind === "addon" ? "addon" : "booking";
      const segIdx = segByFlat.get(j) ?? 0;
      const lineSchedSeg = lineScheduleSummaryForSegment(row, kindMeta, segIdx);
      const metaFallback = buildLineMeta({
        bookingBit,
        kind: kindMeta,
        scheduleSummary: scheduleForMeta,
        lineScheduleSummary: lineSchedSeg,
      });
      const metaRaw =
        typeof line.meta === "string" && line.meta.trim().length > 0
          ? line.meta
            : savedLineMetaOrFallback(undefined, {
              bookingBit,
              kind: kindMeta,
              scheduleSummary: scheduleForMeta,
              lineScheduleSummary: lineSchedSeg,
            });
      const metaJoined = metaRaw.trim().length > 0 ? metaRaw : metaFallback;
      const meta = stripBookingForFromMeta(metaJoined, metaBookingFor, omit);
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
      const descForBadge =
        bondItem && typeof bondItem === "object"
          ? getCartItemMetadataDescription(bondItem as Record<string, unknown>)
          : undefined;
      const badge =
        bondLine?.badge ??
        (bondItem && typeof bondItem === "object"
          ? receiptBadgeForCartLine(kindMeta, descForBadge)
          : undefined);
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
        ...(badge ? { badge } : {}),
      };
    });
  }

  const items = c.cartItems;
  if (Array.isArray(items) && items.length > 0) {
    const flat = flattenBondCartItemNodes(items);
    const lines: CartPurchaseDisplayLine[] = [];
    flat.forEach((o, i) => {
      if (idxFilter != null && !idxFilter.has(i)) return;
      const fromItem = cartItemLineAmountFromDto(o);
      if (fromItem == null) return;
      const it = o as Record<string, unknown>;
      const kind = classifyCartItemLineKind(it);
      const title =
        kind === "booking" && typeof row.productName === "string" && row.productName.trim().length > 0
          ? row.productName.trim()
          : titleFromCartItem(it);
      const segIdx = segByFlat.get(i) ?? 0;
      const lineSchedSeg = lineScheduleSummaryForSegment(row, kind, segIdx);
      const meta = buildLineMeta({
        bookingBit,
        kind,
        scheduleSummary: scheduleForMeta,
        lineScheduleSummary: lineSchedSeg,
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
      const descForBadge = getCartItemMetadataDescription(it);
      const badge = receiptBadgeForCartLine(kind, descForBadge);
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
        ...(badge ? { badge } : {}),
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
        bookingBit,
        kind: "booking",
        scheduleSummary: scheduleForMeta,
        lineScheduleSummary: lineScheduleSummaryForSegment(row, "booking", 0),
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
