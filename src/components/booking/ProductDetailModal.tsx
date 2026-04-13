"use client";

import type { ExtendedProductDto, PublicResourceDto } from "@/types/online-booking";
import { formatDurationLabel } from "@/lib/category-booking-settings";
import { ModalShell } from "./ModalShell";
import { resolveProductCardImageAtStep, type ProductCardImageFallbackStep } from "@/lib/product-card-image";
import {
  addonLevelLabel,
  addonPriceSuffixForLevel,
  bookingOptionalAddons,
  plainAddonDescription,
  resolveAddonDisplayPrice,
} from "@/lib/product-package-addons";
import { sanitizeBookingDescriptionHtml } from "@/lib/sanitize-html";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";
import {
  productCatalogAllPricesNearZero,
  productHasVariableSchedulePricing,
  productMembershipGated,
} from "@/lib/booking-pricing";
import {
  IconCalendarDetail,
  IconClockDetail,
  IconDollarDetail,
  IconLockDetail,
  IconPeakTrend,
  IconPinDetail,
} from "./booking-icons";

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

function isInstructorResourceType(type: string | undefined): boolean {
  return (type ?? "").toLowerCase().includes("instructor");
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
        <button type="button" className="cb-detail-resource-more" onClick={() => setExpanded((x) => !x)}>
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
      if (isInstructorResourceType(r.type)) ins.push(r);
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
  const hasMemberBenefit = Array.isArray(entitlements) && entitlements.length > 0;
  const showMembersOnly = Boolean(membershipGated || product.memberOnly);

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
            {facilityName ? (
              <DetailRow icon={<IconPinDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailLocation")}>
                {facilityName}
              </DetailRow>
            ) : null}
            <DetailRow icon={<IconClockDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailDuration")}>
              {formatDurationLabel(durationMinutes)}
            </DetailRow>
            <DetailRow icon={<IconDollarDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailPrice")}>
              {productMembershipGated(product) && productCatalogAllPricesNearZero(product) ? (
                <span className="cb-detail-price-pill">
                  <span className="cb-detail-price-pill-amount">{tb("productDetailFreeForMembers")}</span>
                </span>
              ) : (
                <>
                  <span
                    className="cb-detail-price-pill"
                    title={
                      productHasVariableSchedulePricing(product) ? tc("peakPricingHint") : undefined
                    }
                  >
                    <span className="cb-detail-price-pill-amount">{priceRangeLabel(product)}</span>
                    <span className="cb-detail-price-pill-sep">/</span>
                    <span className="cb-detail-price-pill-dur">{formatDurationLabel(durationMinutes)}</span>
                    {productHasVariableSchedulePricing(product) ? (
                      <IconPeakTrend className="cb-detail-price-pill-peak" aria-hidden />
                    ) : null}
                  </span>
                  {productHasVariableSchedulePricing(product) ? (
                    <span className="sr-only">{tc("peakPricingHint")}</span>
                  ) : null}
                </>
              )}
            </DetailRow>
            <DetailRow icon={<IconCalendarDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailSchedule")}>
              {tb("productDetailScheduleBlurb")}
            </DetailRow>
            <ProductResourcesSection
              key={product.id}
              resources={scheduleResources}
              loading={scheduleResourcesLoading}
            />
            {down != null && Number.isFinite(down) && down > 0 ? (
              <DetailRow icon={<IconDollarDetail className="text-[var(--cb-primary)]" />} label={tb("productDetailDownPayment")}>
                {product.prices[0] ? formatPrice(down, product.prices[0].currency) : String(down)}
              </DetailRow>
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
              <DetailRow icon={<span className="text-[var(--cb-primary)] font-bold">%</span>} label={tb("productDetailMemberBenefits")}>
                {tb("productDetailMemberBenefitsBlurb")}
              </DetailRow>
            ) : null}
            {addons.length > 0 ? (
              <DetailRow icon={<span className="text-[var(--cb-primary)] font-bold">+</span>} label={tb("productDetailAddonsHeading")}>
                {addons.map((a) => a.name).join(", ")}
              </DetailRow>
            ) : null}
          </ul>
        </section>

        {addons.length > 0 ? (
          <section className="cb-detail-block">
            <h3 className="cb-detail-block-title">{tb("productDetailAvailableAddons")}</h3>
            <ul className="cb-detail-addon-chips">
              {addons.map((a) => {
                const resolved = resolveAddonDisplayPrice(a);
                const extra = resolved ? formatPrice(resolved.price, resolved.currency) : "";
                const desc = plainAddonDescription(a.description);
                return (
                  <li key={a.id} className="cb-detail-addon-chip">
                    <span className="cb-detail-addon-chip-level">{addonLevelLabel(a.level)}</span>
                    <span className="cb-detail-addon-chip-name">{a.name}</span>
                    {desc ? <span className="cb-detail-addon-chip-desc">{desc}</span> : null}
                    {extra ? (
                      <span className="cb-detail-addon-chip-price">
                        {extra}
                        {addonPriceSuffixForLevel(a.level)}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
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
