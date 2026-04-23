"use client";

import type { ExtendedProductDto, PublicResourceDto } from "@/types/online-booking";
import { formatDurationLabel } from "@/lib/category-booking-settings";
import { ModalShell } from "./ModalShell";
import { resolveProductCardImageAtStep, type ProductCardImageFallbackStep } from "@/lib/product-card-image";
import {
  addonLevelLabel,
  addonPriceSuffixForLevel,
  bookingOptionalAddons,
  resolveAddonDisplayPrice,
  type PackageAddonLine,
} from "@/lib/product-package-addons";
import { sanitizeBookingDescriptionHtml } from "@/lib/sanitize-html";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";
import {
  productCatalogAllPricesNearZero,
  productHasVariableSchedulePricing,
  productMembershipGated,
} from "@/lib/booking-pricing";
import { isInstructorScheduleResourceType } from "@/lib/schedule-resource-type";
import {
  IconCalendarDetail,
  IconClockDetail,
  IconDollarDetail,
  IconLockDetail,
  IconPeakTrend,
} from "./booking-icons";
import { describeEntitlementsForDisplay } from "@/lib/entitlement-discount";

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

type Props = {
  open: boolean;
  product: ExtendedProductDto | null;
  activity: string;
  facilityName?: string;
  durationMinutes: number;
  /** True when member-only flag or a required membership product applies */
  membershipGated?: boolean;
  /** From schedule settings for this product (instructors, spaces, …). */
  scheduleResources?: PublicResourceDto[];
  scheduleResourcesLoading?: boolean;
  onClose: () => void;
};

const RESOURCE_PREVIEW = 5;

function ResourceStackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h16M4 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function priceRangeLabel(p: ExtendedProductDto): string {
  const prices = p.prices ?? [];
  if (prices.length === 0) return "—";
  const nums = prices.map((x) => x.price).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return "—";
  const cur = prices[0]!.currency;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) return formatPrice(min, cur);
  return `${formatPrice(min, cur)} – ${formatPrice(max, cur)}`;
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="cb-detail-row">
      <div className="cb-detail-row-icon" aria-hidden>
        {icon}
      </div>
      <div className="cb-detail-row-body">
        <div className="cb-detail-row-label">{label}</div>
        <div className="cb-detail-row-value">{children}</div>
      </div>
    </li>
  );
}

function AddonsGrouped({ addons }: { addons: PackageAddonLine[] }) {
  const tb = useTranslations("booking");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const groups: Array<{ key: "slot" | "hour" | "reservation"; items: PackageAddonLine[] }> = [
    { key: "slot", items: [] },
    { key: "hour", items: [] },
    { key: "reservation", items: [] },
  ];
  const seenIds = new Set<number>();
  for (const a of addons) {
    if (seenIds.has(a.id)) continue;
    seenIds.add(a.id);
    const g = groups.find((gr) => gr.key === a.level);
    if (g) g.items.push(a);
  }
  const renderItem = (a: PackageAddonLine) => {
    const resolved = resolveAddonDisplayPrice(a);
    const extra = resolved ? formatPrice(resolved.price, resolved.currency) : "";
    return (
      <li key={a.id} className="cb-detail-addon-chip">
        <span className="cb-detail-addon-chip-name">{a.name}</span>
        {extra ? (
          <span className="cb-detail-addon-chip-price">
            {extra}
            {addonPriceSuffixForLevel(a.level)}
          </span>
        ) : null}
      </li>
    );
  };
  return (
    <div className="cb-detail-addon-groups">
      {groups.map((g) => {
        if (g.items.length === 0) return null;
        const isExpanded = expanded[g.key] ?? false;
        const hiddenCount = Math.max(0, g.items.length - 1);
        const shown = isExpanded ? g.items : g.items.slice(0, 1);
        return (
          <div key={g.key} className="cb-detail-addon-group">
            <div className="cb-detail-addon-group-label">{addonLevelLabel(g.key)}</div>
            <ul className="cb-detail-addon-chips">{shown.map(renderItem)}</ul>
            {hiddenCount > 0 ? (
              <button
                type="button"
                className="cb-detail-resource-more"
                onClick={() => setExpanded((prev) => ({ ...prev, [g.key]: !isExpanded }))}
              >
                {isExpanded ? tb("resourceShowLess") : tb("resourceViewMore", { count: hiddenCount })}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ResourcesNamesList({ items }: { items: PublicResourceDto[] }) {
  const tb = useTranslations("booking");
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, items.length - RESOURCE_PREVIEW);
  const shown = expanded ? items : items.slice(0, RESOURCE_PREVIEW);
  return (
    <>
      <ul className="cb-detail-resource-list">
        {shown.map((r) => (
          <li key={r.id} className="cb-detail-resource-item">
            <span className="cb-detail-resource-name">{r.name}</span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="cb-detail-resource-more-link"
          onClick={() => setExpanded((x) => !x)}
        >
          {expanded ? tb("resourceShowLess") : tb("resourceViewMore", { count: hiddenCount })}
        </button>
      ) : null}
    </>
  );
}

function ProductResourcesSection({
  resources,
  loading,
}: {
  resources: PublicResourceDto[] | undefined;
  loading: boolean;
}) {
  const tb = useTranslations("booking");
  const tc = useTranslations("common");
  const { spaces, instructors } = useMemo(() => {
    const sp: PublicResourceDto[] = [];
    const ins: PublicResourceDto[] = [];
    for (const r of resources ?? []) {
      if (isInstructorScheduleResourceType(r.type)) ins.push(r);
      else sp.push(r);
    }
    const byName = (a: PublicResourceDto, b: PublicResourceDto) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    sp.sort(byName);
    ins.sort(byName);
    return { spaces: sp, instructors: ins };
  }, [resources]);

  if (loading && (!resources || resources.length === 0)) {
    return (
      <DetailRow icon={<ResourceStackIcon className="text-[var(--cb-primary)]" />} label={tb("productDetailAvailability")}>
        <span className="cb-muted text-sm">{tc("loading")}</span>
      </DetailRow>
    );
  }

  if (spaces.length === 0 && instructors.length === 0) return null;

  return (
    <>
      {spaces.length > 0 ? (
        <DetailRow key="spaces" icon={<ResourceStackIcon className="text-[var(--cb-primary)]" />} label={tb("productDetailSpaces")}>
          <ResourcesNamesList items={spaces} />
        </DetailRow>
      ) : null}
      {instructors.length > 0 ? (
        <DetailRow
          key="instructors"
          icon={<ResourceStackIcon className="text-[var(--cb-primary)]" />}
          label={tb("productDetailInstructors")}
        >
          <ResourcesNamesList items={instructors} />
        </DetailRow>
      ) : null}
    </>
  );
}

function ProductDetailHeroImage({
  product,
  activity,
  showMembersOnly,
}: {
  product: ExtendedProductDto;
  activity: string;
  showMembersOnly: boolean;
}) {
  const tb = useTranslations("booking");
  const [failStep, setFailStep] = useState(0);

  const step = Math.min(2, failStep) as ProductCardImageFallbackStep;
  const hero = resolveProductCardImageAtStep(product, activity, step);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hero}
        alt=""
        className="cb-product-detail-img"
        referrerPolicy="no-referrer"
        onError={() => setFailStep((s) => Math.min(s + 1, 2))}
      />
      {showMembersOnly ? (
        <div className="cb-product-detail-hero-tags">
          <span className="cb-product-detail-pill">
            <IconLockDetail className="size-3 shrink-0 opacity-95" />
            {tb("productDetailMembersOnly")}
          </span>
        </div>
      ) : null}
    </>
  );
}

export function ProductDetailModal({
  open,
  product,
  activity,
  facilityName,
  durationMinutes,
  membershipGated = false,
  scheduleResources,
  scheduleResourcesLoading = false,
  onClose,
}: Props) {
  const tb = useTranslations("booking");
  const tc = useTranslations("checkout");
  const tcommon = useTranslations("common");
  const descriptionRaw = product?.description ?? "";
  const safeDescription = useMemo(() => {
    if (!open || !descriptionRaw || typeof window === "undefined") return "";
    return sanitizeBookingDescriptionHtml(descriptionRaw);
  }, [open, descriptionRaw]);

  if (!product) return null;

  const down = product.downPayment ?? product.downpayment;
  const addons = bookingOptionalAddons(product);
  const entitlements = product.entitlementDiscounts;
  const entitlementLabel = describeEntitlementsForDisplay(Array.isArray(entitlements) ? entitlements : []);
  const hasMemberBenefit = Array.isArray(entitlements) && entitlements.length > 0;
  const showMembersOnly = Boolean(membershipGated || product.memberOnly);
  const hasScheduleResources =
    Array.isArray(scheduleResources) && scheduleResources.length > 0;
  const currency = product.prices[0]?.currency ?? "USD";

  return (
    <ModalShell open={open} title={product.name} panelClassName="cb-modal-panel--detail" onClose={onClose}>
      <div className="cb-product-detail">
        <div className="cb-product-detail-hero">
          <ProductDetailHeroImage
            key={`${product.id}-${open}`}
            product={product}
            activity={activity}
            showMembersOnly={showMembersOnly}
          />
        </div>

        {product.description ? (
          <section className="cb-detail-block">
            <h3 className="cb-detail-block-title">{tb("productDetailAbout")}</h3>
            {safeDescription ? (
              <div
                className="cb-detail-html cb-detail-block-text"
                dangerouslySetInnerHTML={{ __html: safeDescription }}
              />
            ) : (
              <p className="cb-detail-block-text cb-muted text-sm">{tb("productDetailDescriptionFallback")}</p>
            )}
          </section>
        ) : null}

        <section className="cb-detail-block">
          <h3 className="cb-detail-block-title">{tb("productDetailDetails")}</h3>
          <ul className="cb-detail-row-list">
            <DetailRow icon={<IconClockDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailDuration")}>
              {formatDurationLabel(durationMinutes)}
            </DetailRow>
            <DetailRow icon={<IconDollarDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailPrice")}>
              {productMembershipGated(product) && productCatalogAllPricesNearZero(product) ? (
                <span className="cb-detail-price-pill">
                  <span className="cb-detail-price-pill-amount">{tb("productDetailFreeForMembers")}</span>
                </span>
              ) : (
                <div className="cb-detail-price-group">
                  <span
                    className="cb-detail-price-pill"
                    title={productHasVariableSchedulePricing(product) ? tc("peakPricingHint") : undefined}
                  >
                    <span className="cb-detail-price-pill-amount">{priceRangeLabel(product)}</span>
                    <span className="cb-detail-price-pill-sep">/</span>
                    <span className="cb-detail-price-pill-dur">{formatDurationLabel(durationMinutes)}</span>
                    {productHasVariableSchedulePricing(product) ? (
                      <IconPeakTrend className="cb-detail-price-pill-peak" aria-hidden />
                    ) : null}
                  </span>
                  {down != null && Number.isFinite(down) && down > 0 ? (
                    <span className="cb-detail-deposit-note">
                      {formatPrice(down, currency)}{" "}
                      {tb("productDetailDepositSuffix", { dur: formatDurationLabel(durationMinutes) })}
                    </span>
                  ) : null}
                  {productHasVariableSchedulePricing(product) ? (
                    <span className="sr-only">{tc("peakPricingHint")}</span>
                  ) : null}
                </div>
              )}
            </DetailRow>
            {(hasScheduleResources || scheduleResourcesLoading) ? (
              <ProductResourcesSection
                key={product.id}
                resources={scheduleResources}
                loading={scheduleResourcesLoading}
              />
            ) : null}
            {showMembersOnly ? (
              <DetailRow icon={<IconLockDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailAccess")}>
                {tb("productDetailMembersOnly")}
                {addons.length === 1 ? ` — ${addons[0]!.name}` : null}
              </DetailRow>
            ) : null}
            {product.isPunchPass ? (
              <DetailRow icon={<IconCalendarDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailPasses")}>
                {tb("productDetailPassEligible")}
              </DetailRow>
            ) : null}
            {hasMemberBenefit ? (
              <DetailRow icon={<span className="text-[var(--cb-primary)] font-bold text-sm">%</span>} label={tb("productDetailMemberBenefits")}>
                {entitlementLabel ?? tb("productDetailMemberBenefitsBlurb")}
              </DetailRow>
            ) : null}
          </ul>
        </section>

        {addons.length > 0 ? (
          <section className="cb-detail-block">
            <h3 className="cb-detail-block-title">{tb("productDetailAvailableAddons")}</h3>
            <AddonsGrouped addons={addons} />
          </section>
        ) : null}

        <div className="cb-product-detail-footer">
          <button type="button" className="cb-btn-outline" onClick={onClose}>
            {tcommon("close")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
