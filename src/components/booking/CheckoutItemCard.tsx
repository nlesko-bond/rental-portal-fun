"use client";

import { useTranslations } from "next-intl";
import type {
  CheckoutCardBadge,
  CheckoutCardMetaIcon,
  CheckoutCardModel,
} from "@/lib/checkout-card-model";

type Props = {
  card: CheckoutCardModel;
  formatPrice: (amount: number, currency: string) => string;
  currency: string;
  hideParticipantMeta?: boolean;
  /** Called when the user clicks the X. Parent decides whether to confirm / actually call the cart API. */
  onRemove?: (card: CheckoutCardModel) => void;
};

/**
 * Single item card for the redesigned cart drawer (Figma cart states 1.1–1.4).
 *
 * Renders one of: rental, reservation add-on, membership, commerce, other. The shape — title +
 * participant + meta lines + optional badges + optional extras roll-up + item total — is identical
 * across variants; only the meta-line content and the rolled-up "Extras" footer change.
 */
export function CheckoutItemCard({ card, formatPrice, currency, hideParticipantMeta, onRemove }: Props) {
  const tx = useTranslations("checkout");
  const showRemove = card.removable && onRemove != null;
  const metaLines = hideParticipantMeta ? card.metaLines.filter((line) => line.icon !== "person") : card.metaLines;

  return (
    <li className="cb-co-card" data-card-kind={card.kind} data-card-id={card.cartItemId ?? ""}>
      <div className="cb-co-card-head">
        <p className="cb-co-card-title" title={card.title}>{card.title}</p>
        {showRemove ? (
          <button
            type="button"
            className="cb-co-card-remove"
            onClick={() => onRemove?.(card)}
            aria-label={tx("remove")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {metaLines.length > 0 ? (
        <ul className="cb-co-card-meta">
          {metaLines.map((line, idx) => (
            <li key={`${line.icon}-${idx}`} className="cb-co-card-meta-row">
              <span className="cb-co-card-meta-icon" aria-hidden>
                <MetaIcon kind={line.icon} />
              </span>
              <span className="cb-co-card-meta-text" title={line.text}>{line.text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="cb-co-card-badge-price-row">
        <div className="cb-co-card-badges">
          {card.badges.map((b, idx) => (
            <BadgePill key={`${b.kind}-${idx}`} badge={b} />
          ))}
        </div>
        <span className="cb-co-card-base-price">
          {card.baseStrikeAmount != null ? (
            <span className="cb-co-card-base-price-strike" aria-label={tx("originalPrice")}>
              {formatPrice(card.baseStrikeAmount, currency)}
            </span>
          ) : null}
          <span className="cb-co-card-base-price-current">
            {formatPrice(card.basePrice, currency)}
          </span>
        </span>
      </div>

      {card.extras ? (
        <>
          <div className="cb-co-card-divider" aria-hidden />
          <div className="cb-co-card-extras-row">
            <span className="cb-co-card-extras-icon" aria-hidden>
              <MetaIcon kind="category" />
            </span>
            <span className="cb-co-card-extras-text">
              {tx("extrasCount", { count: card.extras.count })}
            </span>
            <span className="cb-co-card-extras-amount">
              {formatPrice(card.extras.amount, currency)}
            </span>
          </div>
        </>
      ) : null}

      <div className="cb-co-card-divider" aria-hidden />
      <div className="cb-co-card-total">
        <span className="cb-co-card-total-label">{tx("itemTotal")}</span>
        <span className="cb-co-card-total-value">{formatPrice(card.itemTotal, currency)}</span>
      </div>
    </li>
  );
}

function BadgePill({ badge }: { badge: CheckoutCardBadge }) {
  const cls =
    badge.kind === "approval"
      ? "cb-co-card-badge cb-co-card-badge--approval"
      : badge.kind === "deposit_optional"
        ? "cb-co-card-badge cb-co-card-badge--deposit"
        : "cb-co-card-badge cb-co-card-badge--promo";
  return (
    <span className={cls}>
      <span className="cb-co-card-badge-icon" aria-hidden>
        <BadgeIcon kind={badge.kind} />
      </span>
      <span>{badge.text}</span>
    </span>
  );
}

function MetaIcon({ kind }: { kind: CheckoutCardMetaIcon }) {
  switch (kind) {
    case "person":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5.5 19c1.25-2.75 3.75-4.25 6.5-4.25s5.25 1.5 6.5 4.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "location":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s6.25-4.15 6.25-9.5a6.25 6.25 0 1 0-12.5 0C5.75 16.85 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="11" r="1.75" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "date":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="4.5" y="5.5" width="15" height="14" rx="2.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 3.75v3.5M15.5 3.75v3.5M4.75 10h14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "membership":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 10h5M14 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "category":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M8.5 5.5h-3v3h3v-3zM18.5 5.5h-3v3h3v-3zM8.5 15.5h-3v3h3v-3zM18.5 15.5h-3v3h3v-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function BadgeIcon({ kind }: { kind: CheckoutCardBadge["kind"] }) {
  if (kind === "approval") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "deposit_optional") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M9 8.5h4.5a2.5 2.5 0 010 5H10a2.5 2.5 0 000 5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}
