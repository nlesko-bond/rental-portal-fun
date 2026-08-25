export type PunchPassWalletEntry = {
  productId: number;
  name: string;
  remaining: number;
  total: number;
};

export type PunchPassWallet = {
  entries: PunchPassWalletEntry[];
};

export type PunchPassWalletStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

const WALLET_KEY_PREFIX = "cb-punch-wallet";

function walletStorageKey(orgId: number): string {
  return `${WALLET_KEY_PREFIX}:${orgId}`;
}

export function emptyPunchPassWallet(): PunchPassWallet {
  return { entries: [] };
}

function browserWalletStorage(): PunchPassWalletStorage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function isWalletEntry(value: unknown): value is PunchPassWalletEntry {
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
export function loadPunchPassWallet(
  orgId: number,
  storage: PunchPassWalletStorage | null = browserWalletStorage()
): PunchPassWallet {
  if (!storage) return emptyPunchPassWallet();
  const raw = storage.getItem(walletStorageKey(orgId));
  if (raw == null || raw === "") return emptyPunchPassWallet();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyPunchPassWallet();
    const entriesRaw = (parsed as { entries?: unknown }).entries;
    if (!Array.isArray(entriesRaw)) return emptyPunchPassWallet();
    return { entries: entriesRaw.filter(isWalletEntry) };
  } catch {
    return emptyPunchPassWallet();
  }
}

/** Writes the prototype wallet for this org into local storage. */
export function savePunchPassWallet(
  orgId: number,
  wallet: PunchPassWallet,
  storage: PunchPassWalletStorage | null = browserWalletStorage()
): void {
  if (!storage) return;
  storage.setItem(walletStorageKey(orgId), JSON.stringify(wallet));
}

export function walletEntryForProduct(wallet: PunchPassWallet, productId: number): PunchPassWalletEntry | null {
  return wallet.entries.find((entry) => entry.productId === productId) ?? null;
}

export function remainingPunchesForProduct(wallet: PunchPassWallet, productId: number): number {
  const entry = walletEntryForProduct(wallet, productId);
  if (!entry) return 0;
  return Math.max(0, Math.floor(entry.remaining));
}

export function creditPunchPass(
  wallet: PunchPassWallet,
  credit: { productId: number; name: string; punches: number }
): PunchPassWallet {
  const punches = Math.floor(credit.punches);
  if (!Number.isFinite(punches) || punches <= 0) return wallet;
  const existing = walletEntryForProduct(wallet, credit.productId);
  if (!existing) {
    return {
      entries: [
        ...wallet.entries,
        {
          productId: credit.productId,
          name: credit.name,
          remaining: punches,
          total: punches,
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
            remaining: entry.remaining + punches,
            total: entry.total + punches,
          }
        : entry
    ),
  };
}

export function debitPunchPass(wallet: PunchPassWallet, productId: number, punches: number): PunchPassWallet {
  const spend = Math.floor(punches);
  if (!Number.isFinite(spend) || spend <= 0) return wallet;
  return {
    entries: wallet.entries.map((entry) => {
      if (entry.productId !== productId) return entry;
      return { ...entry, remaining: Math.max(0, entry.remaining - spend) };
    }),
  };
}

export function parseSeedPunchesParam(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
