export type VisitPassWalletEntry = {
  productId: number;
  name: string;
  remaining: number;
  total: number;
};

export type VisitPassWallet = {
  entries: VisitPassWalletEntry[];
};

export type VisitPassWalletStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

const WALLET_KEY_PREFIX = "cb-visit-wallet";

function walletStorageKey(orgId: number): string {
  return `${WALLET_KEY_PREFIX}:${orgId}`;
}

export function emptyVisitPassWallet(): VisitPassWallet {
  return { entries: [] };
}

function browserWalletStorage(): VisitPassWalletStorage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function isWalletEntry(value: unknown): value is VisitPassWalletEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.productId === "number" &&
    Number.isFinite(row.productId) &&
    row.productId > 0 &&
    typeof row.name === "string" &&
    typeof row.remaining === "number" &&
    Number.isFinite(row.remaining) &&
    typeof row.total === "number" &&
    Number.isFinite(row.total)
  );
}

/**
 * Prototype holder wallet for an org on this browser. Bond has no public
 * rental punch inventory, so remaining visits are local only.
 */
export function loadVisitPassWallet(
  orgId: number,
  storage: VisitPassWalletStorage | null = browserWalletStorage()
): VisitPassWallet {
  if (!storage) return emptyVisitPassWallet();
  const raw = storage.getItem(walletStorageKey(orgId));
  if (raw == null || raw === "") return emptyVisitPassWallet();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyVisitPassWallet();
    const entriesRaw = (parsed as { entries?: unknown }).entries;
    if (!Array.isArray(entriesRaw)) return emptyVisitPassWallet();
    return { entries: entriesRaw.filter(isWalletEntry) };
  } catch {
    return emptyVisitPassWallet();
  }
}

/** Writes the prototype wallet for this org into local storage. */
export function saveVisitPassWallet(
  orgId: number,
  wallet: VisitPassWallet,
  storage: VisitPassWalletStorage | null = browserWalletStorage()
): void {
  if (!storage) return;
  storage.setItem(walletStorageKey(orgId), JSON.stringify(wallet));
}

export function walletEntryForProduct(wallet: VisitPassWallet, productId: number): VisitPassWalletEntry | null {
  return wallet.entries.find((entry) => entry.productId === productId) ?? null;
}

export function remainingVisitsForProduct(wallet: VisitPassWallet, productId: number): number {
  const entry = walletEntryForProduct(wallet, productId);
  if (!entry) return 0;
  return Math.max(0, Math.floor(entry.remaining));
}

export function creditVisitPass(
  wallet: VisitPassWallet,
  credit: { productId: number; name: string; visits: number }
): VisitPassWallet {
  const visits = Math.floor(credit.visits);
  if (!Number.isFinite(visits) || visits <= 0) return wallet;
  const existing = walletEntryForProduct(wallet, credit.productId);
  if (!existing) {
    return {
      entries: [
        ...wallet.entries,
        {
          productId: credit.productId,
          name: credit.name,
          remaining: visits,
          total: visits,
        },
      ],
    };
  }
  return {
    entries: wallet.entries.map((entry) =>
      entry.productId === credit.productId
        ? {
            ...entry,
            name: credit.name,
            remaining: entry.remaining + visits,
            total: entry.total + visits,
          }
        : entry
    ),
  };
}

/**
 * Credits a new pack when checkout buys one, then spends visits for the picked slots.
 */
export function applyVisitPassCheckoutToWallet(
  wallet: VisitPassWallet,
  pass: { productId: number; name: string; visitCount: number },
  checkout: { kind: "redeem" | "buyAndRedeem"; visitsNeeded: number }
): VisitPassWallet {
  const credited =
    checkout.kind === "buyAndRedeem"
      ? creditVisitPass(wallet, {
          productId: pass.productId,
          name: pass.name,
          visits: pass.visitCount,
        })
      : wallet;
  return debitVisitPass(credited, pass.productId, checkout.visitsNeeded);
}

export function debitVisitPass(wallet: VisitPassWallet, productId: number, visits: number): VisitPassWallet {
  const spend = Math.floor(visits);
  if (!Number.isFinite(spend) || spend <= 0) return wallet;
  return {
    entries: wallet.entries.map((entry) => {
      if (entry.productId !== productId) return entry;
      return { ...entry, remaining: Math.max(0, entry.remaining - spend) };
    }),
  };
}

export function parseSeedVisitsParam(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
