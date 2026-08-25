"use client";

import { useTranslations } from "next-intl";
import { ModalShell } from "@/components/booking/ModalShell";
import { CbButton } from "@/components/booking/primitives/CbButton";
import type { PunchPassWalletEntry } from "@/lib/punch-pass-wallet";
import { PunchPassStampRow } from "./PunchPassStampRow";

type Props = {
  open: boolean;
  onClose: () => void;
  entries: PunchPassWalletEntry[];
  onRedeem: (productId: number) => void;
  onBuyAnother: (productId: number) => void;
};

export function PunchPassPassesModal({ open, onClose, entries, onRedeem, onBuyAnother }: Props) {
  const tb = useTranslations("booking");
  return (
    <ModalShell open={open} title={tb("punchPassMyPassesTitle")} onClose={onClose}>
      {entries.length === 0 ? (
        <p className="cb-muted text-sm">{tb("punchPassMyPassesEmpty")}</p>
      ) : (
        <ul className="cb-punch-passes-list">
          {entries.map((entry) => (
            <li key={entry.productId} className="cb-punch-passes-item">
              <div>
                <p className="cb-punch-passes-name">{entry.name}</p>
                <p className="cb-muted text-sm">
                  {tb("punchPassRemaining", { remaining: entry.remaining, total: entry.total })}
                </p>
                <PunchPassStampRow remaining={entry.remaining} total={entry.total} />
              </div>
              <div className="cb-punch-passes-actions">
                {entry.remaining > 0 ? (
                  <CbButton variant="primary" onClick={() => onRedeem(entry.productId)}>
                    {tb("punchPassGoRedeem")}
                  </CbButton>
                ) : null}
                <CbButton
                  variant={entry.remaining > 0 ? "ghost" : "primary"}
                  onClick={() => onBuyAnother(entry.productId)}
                >
                  {tb("punchPassBuyAnother")}
                </CbButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
}
