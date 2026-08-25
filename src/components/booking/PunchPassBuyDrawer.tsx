"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { CbButton } from "@/components/booking/primitives/CbButton";
import { formatDurationLabel } from "@/lib/category-booking-settings";
import type { PunchPassProduct } from "@/lib/punch-pass";
import { PunchPassStampRow } from "./PunchPassStampRow";

type Props = {
  open: boolean;
  onClose: () => void;
  appearanceClass?: string;
  pass: PunchPassProduct;
  bookingForLabel: string;
  formatPrice: (amount: number, currency: string) => string;
  onPurchase: () => void;
};

export function PunchPassBuyDrawer({
  open,
  onClose,
  appearanceClass = "",
  pass,
  bookingForLabel,
  formatPrice,
  onPurchase,
}: Props) {
  const tb = useTranslations("booking");
  const [purchased, setPurchased] = useState(false);

  const priceLabel =
    pass.packPrice != null ? formatPrice(pass.packPrice.amount, pass.packPrice.currency) : "—";
  const durationLabel = formatDurationLabel(pass.durationMinutes);

  const handleClose = () => {
    setPurchased(false);
    onClose();
  };

  return (
    <RightDrawer
      open={open}
      onClose={handleClose}
      ariaLabel={tb("punchPassBuyTitle")}
      title={purchased ? tb("punchPassPurchasedTitle") : tb("punchPassBuyTitle")}
      rootClassName={appearanceClass}
    >
      {purchased ? (
        <div className="cb-punch-buy">
          <div className="cb-punch-ticket">
            <p className="cb-punch-ticket-kicker">{tb("passTag")}</p>
            <p className="cb-punch-ticket-name">{pass.name}</p>
            <p className="cb-punch-buy-lead">
              {tb("punchPassPurchasedBody", { name: bookingForLabel, count: pass.punchCount })}
            </p>
            <PunchPassStampRow remaining={pass.punchCount} total={pass.punchCount} />
          </div>
          <CbButton variant="primary" className="cb-punch-buy-cta" onClick={handleClose}>
            {tb("punchPassPurchasedNext")}
          </CbButton>
        </div>
      ) : (
        <div className="cb-punch-buy">
          <div className="cb-punch-ticket">
            <p className="cb-punch-ticket-kicker">{tb("passTag")}</p>
            <p className="cb-punch-ticket-name">{pass.name}</p>
            <p className="cb-punch-buy-summary">
              {tb("punchPassBuySummary", { count: pass.punchCount, duration: durationLabel })}
            </p>
            <p className="cb-punch-buy-price">{priceLabel}</p>
            <PunchPassStampRow remaining={0} total={pass.punchCount} />
            <p className="cb-muted text-sm">
              {tb("punchPassBuyFor")}: <strong>{bookingForLabel}</strong>
            </p>
          </div>
          <p className="cb-punch-buy-lead">{tb("punchPassBuyLead")}</p>
          <CbButton
            variant="primary"
            className="cb-punch-buy-cta"
            onClick={() => {
              onPurchase();
              setPurchased(true);
            }}
          >
            {tb("punchPassCompletePurchase")}
          </CbButton>
        </div>
      )}
    </RightDrawer>
  );
}
