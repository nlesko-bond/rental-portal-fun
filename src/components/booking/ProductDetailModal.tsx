"use client";

import type { ExtendedProductDto, PublicResourceDto } from "@/types/online-booking";
import { formatDurationLabel } from "@/lib/category-booking-settings";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { useBookingAppearanceClass } from "@/hooks/useBookingAppearanceClass";
import { resolveProductCardImageAtStep, type ProductCardImageFallbackStep } from "@/lib/product-card-image";
import {
  addonLevelLabel,
  addonPriceSuffixForLevel,
  bookingOptionalAddons,
  plainAddonDescription,
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
import {
  isMembershipRequiredProduct,
  parseProductRequiredProducts,
  primaryListPrice,
  type ExtendedRequiredProductNode,
} from "@/lib/required-products-extended";
import { isInstructorScheduleResourceType } from "@/lib/schedule-resource-type";
import {
  IconDollarDetail,
  IconLockDetail,
  IconPeakTrend,
} from "./booking-icons";
import { describeEntitlementsForDisplay } from "@/lib/entitlement-discount";

function formatPrice(amount: number, currency: string): string {
  const isWhole = Number.isFinite(amount) && Math.abs(amount - Math.round(amount)) < 0.005;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
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

function membershipAccessItems(product: ExtendedProductDto): ExtendedRequiredProductNode[] {
  const seen = new Set<number>();
  const out: ExtendedRequiredProductNode[] = [];
  const walk = (nodes: ExtendedRequiredProductNode[]) => {
    for (const node of nodes) {
      if (isMembershipRequiredProduct(node) && !seen.has(node.id)) {
        seen.add(node.id);
        out.push(node);
      }
      if (node.requiredProducts?.length) walk(node.requiredProducts);
    }
  };
  walk(parseProductRequiredProducts(product));
  return out;
}

function priceFromRecord(record: Record<string, unknown>): { amount: number; currency: string; label?: string } | null {
  const rawAmount = record.price ?? record.amount ?? record.unitPrice;
  const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
  if (!Number.isFinite(amount)) return null;
  const currency = typeof record.currency === "string" ? record.currency : "USD";
  const label = typeof record.name === "string" ? record.name : typeof record.label === "string" ? record.label : undefined;
  return { amount, currency, ...(label ? { label } : {}) };
}

function membershipAccessPrice(node: ExtendedRequiredProductNode): { amount: number; currency: string; label?: string } | null {
  const direct = primaryListPrice(node);
  if (direct) return direct;
  const packages = Array.isArray(node.packages) ? (node.packages as Record<string, unknown>[]) : [];
  for (const pkg of packages) {
    const directPackagePrice = priceFromRecord(pkg);
    if (directPackagePrice) return directPackagePrice;
    const prices = Array.isArray(pkg.prices) ? (pkg.prices as Record<string, unknown>[]) : [];
    for (const price of prices) {
      const packagePrice = priceFromRecord(price);
      if (packagePrice) return packagePrice;
    }
  }
  return null;
}

function cadenceFromDurationMonths(raw: unknown): string | null {
  const months = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(months) || months <= 0) return null;
  if (months === 1) return "month";
  if (months === 3) return "quarter";
  if (months === 12) return "year";
  if (months % 12 === 0) return `${months / 12} years`;
  return `${months} months`;
}

function membershipAccessPriceLine(node: ExtendedRequiredProductNode): string | null {
  const price = membershipAccessPrice(node);
  if (!price) return null;
  const cadence = cadenceFromDurationMonths(node.durationMonths);
  return cadence ? `${formatPrice(price.amount, price.currency)} / ${cadence}` : formatPrice(price.amount, price.currency);
}

function memberBenefitItems(entitlements: unknown[]): Array<{ key: string; name: string; tag?: string }> {
  const out: Array<{ key: string; name: string; tag?: string }> = [];
  const seen = new Set<string>();
  entitlements.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const record = raw as Record<string, unknown>;
    const group = record.group && typeof record.group === "object" ? (record.group as Record<string, unknown>) : null;
    const name = typeof group?.name === "string" && group.name.trim().length > 0 ? group.name.trim() : "Member discount";
    const discountValue =
      typeof record.discountValue === "number" ? record.discountValue : Number(record.discountValue);
    const discountMethod = typeof record.discountMethod === "string" ? record.discountMethod : "";
    const tag =
      Number.isFinite(discountValue) && discountValue > 0
        ? discountMethod === "percent"
          ? `${discountValue}% off`
          : `${discountValue} off`
        : undefined;
    const key = `${name}:${tag ?? ""}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ key: `${key}:${index}`, name, ...(tag ? { tag } : {}) });
  });
  return out;
}

function MembershipAccessList({ product }: { product: ExtendedProductDto }) {
  const tb = useTranslations("booking");
  const items = membershipAccessItems(product);
  if (items.length === 0) return <>{tb("productDetailMembersOnly")}</>;
  return (
    <div className="cb-detail-membership-access">
      <ul className="cb-detail-membership-access-list">
        {items.map((item) => {
          const priceLine = membershipAccessPriceLine(item);
          return (
            <li key={item.id} className="cb-detail-membership-access-item">
              <span className="cb-detail-membership-access-name">{item.name ?? `Membership ${item.id}`}</span>
              {priceLine ? <span className="cb-detail-membership-access-price">{priceLine}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
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
    const price = resolved ? `${formatPrice(resolved.price, resolved.currency)}${addonPriceSuffixForLevel(a.level)}` : "";
    const description = plainAddonDescription(a.description);
    return (
      <li key={a.id} className="cb-detail-addon-row">
        <span className="cb-detail-addon-row-copy">
          <span className="cb-detail-addon-row-name">{a.name}</span>
          {description ? <span className="cb-detail-addon-row-desc">{description}</span> : null}
        </span>
        {price ? <span className="cb-detail-addon-row-price">{price}</span> : null}
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
            <ul className="cb-detail-addon-list">{shown.map(renderItem)}</ul>
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
  const appearanceClass = useBookingAppearanceClass();
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
  const memberBenefits = Array.isArray(entitlements) ? memberBenefitItems(entitlements) : [];
  const showMembersOnly = Boolean(membershipGated || product.memberOnly);
  const hasScheduleResources =
    Array.isArray(scheduleResources) && scheduleResources.length > 0;
  const currency = product.prices[0]?.currency ?? "USD";

  return (
    <RightDrawer
      open={open}
      title={product.name}
      ariaLabel={tb("moreAboutProduct", { name: product.name })}
      rootClassName={`${appearanceClass} cb-product-detail-drawer-root`.trim()}
      panelClassName="cb-product-detail-drawer"
      onClose={onClose}
    >
      <div className="cb-product-detail">
        <div className="cb-product-detail-hero">
          <ProductDetailHeroImage
            key={`${product.id}-${open}`}
            product={product}
            activity={activity}
            showMembersOnly={showMembersOnly}
          />
        </div>

        {/* Two-column body: description left, details + addons right */}
        <div className="cb-product-detail-body">
          <div className="cb-product-detail-body-desc">
            {product.description ? (
              <section className="cb-detail-block cb-detail-block--no-top-border">
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
          </div>

          <div className="cb-product-detail-body-info">
            <section className="cb-detail-block cb-detail-block--no-top-border">
              <h3 className="cb-detail-block-title">{tb("productDetailDetails")}</h3>
              <ul className="cb-detail-row-list">
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
                  <DetailRow icon={<IconLockDetail className="text-[var(--cb-primary)]" />} label="Member access">
                    <MembershipAccessList product={product} />
                  </DetailRow>
                ) : null}
                {hasMemberBenefit ? (
                  <DetailRow icon={<span className="text-[var(--cb-primary)] font-bold text-sm">%</span>} label={tb("productDetailMemberBenefits")}>
                    {memberBenefits.length > 0 ? (
                      <ul className="cb-detail-membership-access-list">
                        {memberBenefits.map((item) => (
                          <li key={item.key} className="cb-detail-membership-access-item">
                            <span className="cb-detail-membership-access-name">{item.name}</span>
                            {item.tag ? <span className="cb-detail-membership-access-price">{item.tag}</span> : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      entitlementLabel ?? tb("productDetailMemberBenefitsBlurb")
                    )}
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
          </div>
        </div>

        <div className="cb-product-detail-footer">
          <button type="button" className="cb-btn-outline" onClick={onClose}>
            {tcommon("close")}
          </button>
        </div>
      </div>
    </RightDrawer>
  );
}
