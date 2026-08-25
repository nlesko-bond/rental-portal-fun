import { describe, expect, it } from "vitest";
import {
  applyPunchPassCheckoutToWallet,
  creditPunchPass,
  debitPunchPass,
  emptyPunchPassWallet,
  loadPunchPassWallet,
  parseSeedPunchesParam,
  remainingPunchesForProduct,
  savePunchPassWallet,
  type PunchPassWalletStorage,
} from "@/lib/punch-pass-wallet";

function memoryStorage(): PunchPassWalletStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("punch-pass wallet", () => {
  it("credits a new product and persists per org", () => {
    const storage = memoryStorage();
    const credited = creditPunchPass(emptyPunchPassWallet(), {
      productId: 701,
      name: "Court 10-pack",
      punches: 10,
    });
    expect(remainingPunchesForProduct(credited, 701)).toBe(10);
    savePunchPassWallet(9, credited, storage);
    expect(loadPunchPassWallet(9, storage).entries).toEqual(credited.entries);
    expect(loadPunchPassWallet(8, storage).entries).toEqual([]);
  });

  it("stacks additional pack purchases and decrements on redeem", () => {
    const once = creditPunchPass(emptyPunchPassWallet(), {
      productId: 701,
      name: "Court 10-pack",
      punches: 10,
    });
    const twice = creditPunchPass(once, { productId: 701, name: "Court 10-pack", punches: 10 });
    expect(twice.entries[0]).toMatchObject({ remaining: 20, total: 20 });
    const after = debitPunchPass(twice, 701, 3);
    expect(remainingPunchesForProduct(after, 701)).toBe(17);
  });

  it("credits a pack then debits redeemed slots on first checkout", () => {
    const after = applyPunchPassCheckoutToWallet(
      emptyPunchPassWallet(),
      { productId: 701, name: "Court 10-pack", punchCount: 10 },
      { kind: "buyAndRedeem", punchesNeeded: 2 }
    );
    expect(remainingPunchesForProduct(after, 701)).toBe(8);
    expect(after.entries[0]).toMatchObject({ total: 10, remaining: 8 });
  });

  it("debits only on redeem checkout", () => {
    const owned = creditPunchPass(emptyPunchPassWallet(), {
      productId: 701,
      name: "Court 10-pack",
      punches: 8,
    });
    const after = applyPunchPassCheckoutToWallet(
      owned,
      { productId: 701, name: "Court 10-pack", punchCount: 10 },
      { kind: "redeem", punchesNeeded: 2 }
    );
    expect(remainingPunchesForProduct(after, 701)).toBe(6);
    expect(after.entries[0]?.total).toBe(8);
  });

  it("does not debit below zero", () => {
    const wallet = creditPunchPass(emptyPunchPassWallet(), {
      productId: 1,
      name: "Pass",
      punches: 1,
    });
    expect(remainingPunchesForProduct(debitPunchPass(wallet, 1, 5), 1)).toBe(0);
  });

  it("ignores corrupt storage", () => {
    const storage: PunchPassWalletStorage = {
      getItem: () => "{not-json",
      setItem: () => {},
    };
    expect(loadPunchPassWallet(1, storage)).toEqual(emptyPunchPassWallet());
  });
});

describe("parseSeedPunchesParam", () => {
  it("reads a positive integer", () => {
    expect(parseSeedPunchesParam("10")).toBe(10);
    expect(parseSeedPunchesParam("0")).toBeNull();
    expect(parseSeedPunchesParam("nope")).toBeNull();
  });
});
