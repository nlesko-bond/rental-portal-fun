import {
  formatSlotKeyLongDate,
  formatSlotKeyTimeRangePretty,
  formatSlotKeysScheduleSummary,
} from "@/components/booking/booking-slot-labels";
import { parseSlotControlKey } from "@/lib/slot-selection";
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
import {
  type BagRemovePolicy,
  bagRemovePolicyForBondItem,
  bondCartItemIdFromRecord,
} from "@/lib/bond-cart-removal";
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
  /** Bag remove: one line vs whole reservation subsection (add-ons + rental root). */
  bagRemove?: BagRemovePolicy;
  /** Icon meta rows (cart drawer / Consumer DS) — participant, resource, date, time. */
  bagMetaRows?: {
    participant?: string;
    resource?: string;
    dateLine?: string;
    timeLine?: string;
  };
  /** Venue submit-for-approval rental line — show approval pill on cart card. */
  approvalPending?: boolean;
  /** Booking line with a non-zero `product.downPayment` — show deposit pill on cart card. */
  depositRequired?: boolean;
  /** Membership billing cadence row — e.g. "$45.99 / month × 1" — from `product.resource.membership.durationMonths`. */
  unitSubtitle?: string;
};

/** Bond cart membership item → billing cadence label ("month" / "year" / "3 months"). */
function membershipCadenceLabel(it: Record<string, unknown>): string | undefined {
  const product = it.product as Record<string, unknown> | undefined;
  const resource = product?.resource as Record<string, unknown> | undefined;
  const membership = resource?.membership as Record<string, unknown> | undefined;
  const months = typeof membership?.durationMonths === "number" ? membership.durationMonths : undefined;
  if (months == null || !Number.isFinite(months) || months <= 0) return undefined;
  if (months === 1) return "month";
  if (months === 12) return "year";
  if (months % 12 === 0) return `${months / 12} years`;
  return `${months} months`;
}

/** Membership cart item → unit subtitle like "$45.99 / month × 1". */
function membershipUnitSubtitle(
  it: Record<string, unknown>,
  fallbackCurrency: string
): string | undefined {
  const cadence = membershipCadenceLabel(it);
  const unit =
    typeof it.unitPrice === "number" && Number.isFinite(it.unitPrice)
      ? it.unitPrice
      : typeof it.price === "number" && Number.isFinite(it.price)
        ? it.price
        : undefined;
  if (unit == null || unit <= 0) return undefined;
  const qty =
    typeof it.quantity === "number" && Number.isFinite(it.quantity) && it.quantity > 0
      ? it.quantity
      : 1;
  const currency = typeof it.currency === "string" ? it.currency : fallbackCurrency;
  const price = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(unit);
  return cadence ? `${price} / ${cadence} × ${qty}` : `${price} × ${qty}`;
}

/** How checkout/payment applies across bag rows — considers per-productId approval for merged carts. */
export function bagApprovalPolicy(rows: SessionCartSnapshot[]): BagApprovalPolicy {
  if (rows.length === 0) return "all_pay";
  const values: boolean[] = [];
  for (const r of rows) {
    const map = r.approvalByProductId;
    if (map && Object.keys(map).length > 0) {
      for (const v of Object.values(map)) values.push(v === true);
    } else {
      values.push(r.approvalRequired === true);
    }
  }
  const all = values.every(Boolean);
  const none = values.every((f) => !f);
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
  if (opts.kind === "membership") return "";
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

function slotKeysForSegment(row: SessionCartSnapshot, segIdx: number): string[] {
  const rg = row.reservationGroups;
  if (rg != null && rg.length > 0) {
    const g = rg[segIdx] ?? rg[0];
    if (g?.slotKeys && g.slotKeys.length > 0) return g.slotKeys;
  }
  if (row.reservedSlotKeys != null && row.reservedSlotKeys.length > 0) return row.reservedSlotKeys;
  return [];
}

function parseResourceFromScheduleMeta(meta: string): string | undefined {
  const i = meta.indexOf(" · ");
  if (i <= 0) return undefined;
  const first = meta.slice(0, i).trim();
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(first)) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(first)) return undefined;
  return first.length > 0 ? first : undefined;
}

function readResourceFromBondItem(it: Record<string, unknown> | null | undefined): string | undefined {
  if (!it) return undefined;
  const meta = it.metadata && typeof it.metadata === "object" ? (it.metadata as Record<string, unknown>) : null;
  for (const k of ["resourceName", "spaceName", "facilityName", "locationName"] as const) {
    const v = meta?.[k] ?? it[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  const space = it.space;
  if (space && typeof space === "object") {
    const n = (space as Record<string, unknown>).name;
    if (typeof n === "string" && n.trim().length > 0) return n.trim();
  }
  return undefined;
}

function buildBagMetaRows(
  row: SessionCartSnapshot,
  segIdx: number,
  kind: CartLineKind,
  omit: boolean,
  subsectionBookingForLabel: string | undefined,
  bondItem: Record<string, unknown> | null | undefined,
  fallbackMeta: string
): CartPurchaseDisplayLine["bagMetaRows"] | undefined {
  if (!omit || kind === "membership") return undefined;
  const label =
    (typeof subsectionBookingForLabel === "string" && subsectionBookingForLabel.trim().length > 0
      ? subsectionBookingForLabel.trim()
      : undefined) ??
    (typeof row.bookingForLabel === "string" && row.bookingForLabel.trim().length > 0
      ? row.bookingForLabel.trim()
      : undefined);
  const keys = slotKeysForSegment(row, segIdx);
  let resource = readResourceFromBondItem(bondItem ?? null);
  if (!resource && fallbackMeta.length > 0) resource = parseResourceFromScheduleMeta(fallbackMeta);

  let dateLine: string | undefined;
  let timeLine: string | undefined;
  if (keys.length > 0) {
    const byDate = new Map<string, string[]>();
    for (const k of keys) {
      const p = parseSlotControlKey(k);
      if (!p) continue;
      const long = formatSlotKeyLongDate(k);
      const tr = formatSlotKeyTimeRangePretty(k);
      if (!long || !tr) continue;
      const arr = byDate.get(long) ?? [];
      arr.push(tr);
      byDate.set(long, arr);
    }
    const dates = [...byDate.keys()];
    if (dates.length === 1) {
      dateLine = dates[0];
      timeLine = byDate.get(dates[0]!)!.join(", ");
    } else if (dates.length > 1) {
      timeLine = dates
        .map((d) => {
          const parts = byDate.get(d)!;
          return `${d}: ${parts.join(", ")}`;
        })
        .join("; ");
    }
  }

  const participant = label;
  if (!participant && !resource && !dateLine && !timeLine) return undefined;
  return { participant, resource, dateLine, timeLine };
}

function parseSnapLineFlatIndex(key: string, rowIndex: number): number {
  const m = key.match(new RegExp(`^snap-${rowIndex}-(?:pending|saved|item)-(\\d+)-`));
  if (m) return Number(m[1]);
  return 0;
}

function finalizePurchaseDisplayLines(
  lines: CartPurchaseDisplayLine[],
  row: SessionCartSnapshot,
  rowIndex: number,
  options?: {
    omitBookingLabelInMeta?: boolean;
    structuredBagMeta?: boolean;
    subsectionBookingForLabel?: string;
  }
): CartPurchaseDisplayLine[] {
  const want = options?.structuredBagMeta === true;
  const omit = options?.omitBookingLabelInMeta === true;
  const subsection = options?.subsectionBookingForLabel;
  const approvalMap = row.approvalByProductId;
  const hasPerProductApproval = approvalMap != null && Object.keys(approvalMap).length > 0;
  /** Row-level fallback when the snapshot predates per-productId persistence (loaded carts, legacy rows). */
  const needApprovalFlags = row.approvalRequired === true;

  const c = row.cart as OrganizationCartDto;
  const flatBond = Array.isArray(c.cartItems)
    ? flattenBondCartItemNodes(c.cartItems as unknown[])
    : [];
  const hasAnyDeposit = flatBond.some((it) => bondItemHasDownpayment(it));
  if (!want && !needApprovalFlags && !hasPerProductApproval && !hasAnyDeposit) return lines;

  const segByFlat = flatIndexToSegmentMap(c);
  const segApprovalCache = new Map<number, boolean>();
  const segmentHasApprovalProduct = (segIdx: number): boolean => {
    if (segApprovalCache.has(segIdx)) return segApprovalCache.get(segIdx)!;
    let has = false;
    for (let k = 0; k < flatBond.length; k++) {
      if ((segByFlat.get(k) ?? 0) !== segIdx) continue;
      const kind = classifyCartItemLineKind(flatBond[k]!);
      if (kind !== "booking") continue;
      const pid = productIdFromBondItem(flatBond[k]!);
      if (pid != null && approvalMap && approvalMap[pid] === true) {
        has = true;
        break;
      }
    }
    segApprovalCache.set(segIdx, has);
    return has;
  };

  return lines.map((line) => {
    const j = parseSnapLineFlatIndex(line.key, rowIndex);
    const bondRec = flatBond[j] as Record<string, unknown> | undefined;
    const segIdx = segByFlat.get(j) ?? 0;
    const coKind: CartLineKind =
      line.lineKind === "membership" ? "membership" : line.lineKind === "addon" ? "addon" : "booking";
    const bagMetaRows = want
      ? buildBagMetaRows(row, segIdx, coKind, omit, subsection, bondRec ?? null, line.meta)
      : undefined;
    /** Per-product approval when available; otherwise row-level. Addons inherit the segment's booking. */
    let approvalPending = false;
    if (coKind === "booking") {
      if (hasPerProductApproval) {
        const pid = bondRec != null ? productIdFromBondItem(bondRec) : null;
        approvalPending = pid != null && approvalMap![pid] === true;
      } else {
        approvalPending = needApprovalFlags;
      }
    } else if (coKind === "addon" && hasPerProductApproval) {
      approvalPending = segmentHasApprovalProduct(segIdx);
    }
    const depositRequired =
      !approvalPending && coKind === "booking" && bondRec != null && bondItemHasDownpayment(bondRec);
    return {
      ...line,
      ...(bagMetaRows ? { bagMetaRows } : {}),
      ...(approvalPending ? { approvalPending: true } : {}),
      ...(depositRequired ? { depositRequired: true } : {}),
    };
  });
}

function productIdFromBondItem(it: Record<string, unknown>): number | null {
  const prod = it.product as Record<string, unknown> | undefined;
  const pid = typeof prod?.id === "number" ? prod.id : null;
  return pid != null && Number.isFinite(pid) && pid > 0 ? pid : null;
}

/** True when this Bond cart item's product carries a non-zero `downPayment`. */
function bondItemHasDownpayment(it: Record<string, unknown>): boolean {
  const prod = it.product as Record<string, unknown> | undefined;
  const dp =
    (prod?.downPayment as number | undefined) ??
    (prod?.downpayment as number | undefined) ??
    (it.downPayment as number | undefined) ??
    (it.downpayment as number | undefined);
  return typeof dp === "number" && Number.isFinite(dp) && dp > 0;
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
    /** Figma-style cart: icon rows for participant / resource / date / time. */
    structuredBagMeta?: boolean;
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
      return finalizePurchaseDisplayLines(
        saved.map((line, j) => {
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
        }),
        row,
        rowIndex,
        options
      );
    }
    return finalizePurchaseDisplayLines(
      saved.map((line, j) => {
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
      const bondRec =
        bondItem && typeof bondItem === "object" ? (bondItem as Record<string, unknown>) : null;
      const bondId = bondRec != null ? bondCartItemIdFromRecord(bondRec) : null;
      const bagRemove =
        typeof cartId === "number" && Number.isFinite(cartId) && cartId > 0 && bondRec != null
          ? bagRemovePolicyForBondItem(bondRec, kindMeta, bondId)
          : undefined;
      const unitSubtitle =
        kindMeta === "membership" && bondRec != null
          ? membershipUnitSubtitle(bondRec, c.currency ?? "USD")
          : undefined;
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
        ...(bagRemove ? { bagRemove } : {}),
        ...(unitSubtitle ? { unitSubtitle } : {}),
      };
    }),
      row,
      rowIndex,
      options
    );
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
      /**
       * For rental (`booking`) lines Bond's `cart_item.name` is auto-generated as
       * `"{firstName} Reservation"` — that's a back-office artifact, not a customer-facing
       * label. Prefer the consumer-facing product name (the one we pulled from the products
       * endpoint when the user picked the product) for those rows. For non-booking rows
       * (add-ons, memberships, commerce) the cart-item name is what the back office set up
       * for the consumer, so use that.
       */
      const bondTitle = titleFromCartItem(it);
      const productName = productNameFromCartItem(it);
      const title =
        kind === "booking"
          ? productName ??
            (typeof row.productName === "string" && row.productName.trim().length > 0
              ? row.productName.trim()
              : bondTitle)
          : bondTitle !== "Item"
            ? bondTitle
            : (productName ?? bondTitle);
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
      const lineCartId = bondCartItemIdFromRecord(it);
      const bagRemove =
        typeof cartId === "number" && Number.isFinite(cartId) && cartId > 0
          ? bagRemovePolicyForBondItem(it, kind, lineCartId)
          : undefined;
      const unitSubtitle =
        kind === "membership"
          ? membershipUnitSubtitle(it, c.currency ?? "USD")
          : undefined;
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
        ...(bagRemove ? { bagRemove } : {}),
        ...(unitSubtitle ? { unitSubtitle } : {}),
      });
    });
    if (lines.length > 0) return finalizePurchaseDisplayLines(lines, row, rowIndex, options);
  }

  const lineTotal =
    typeof c.subtotal === "number" && Number.isFinite(c.subtotal)
      ? c.subtotal
      : typeof c.price === "number" && Number.isFinite(c.price)
        ? c.price
        : null;

  return finalizePurchaseDisplayLines(
    [
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
    ],
    row,
    rowIndex,
    options
  );
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

/**
 * Returns the product-table `name` for the cart item, preferring known Bond field names that
 * carry the consumer-facing product name (set up in the back office for online listing) over
 * generic per-item fields. Returns `null` if no product name is present on the item.
 */
export function productNameFromCartItem(o: Record<string, unknown>): string | null {
  const p = o.product;
  if (!p || typeof p !== "object") return null;
  const pr = p as Record<string, unknown>;
  for (const key of [
    "consumerName",
    "onlineName",
    "publicName",
    "displayName",
    "name",
    "title",
  ]) {
    const v = pr[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

/** Line items for FAB / labels (Bond `cartItems`, optional `displayLines`, or one row per cart). */
export function countSessionCartLineItems(rows: SessionCartSnapshot[]): number {
  return rows.reduce((acc, row, i) => acc + expandSnapshotForPurchaseList(row, i).length, 0);
}
