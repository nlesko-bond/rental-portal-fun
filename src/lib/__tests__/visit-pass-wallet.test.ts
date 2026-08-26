import { describe, expect, it } from "vitest";
import {
  applyVisitPassCheckoutToWallet,
  creditVisitPass,
  debitVisitPass,
  emptyVisitPassWallet,
  loadVisitPassWallet,
  parseSeedVisitsParam,
  remainingVisitsForProduct,
  saveVisitPassWallet,
  type VisitPassWalletStorage,
} from "@/lib/visit-pass-wallet";

function memoryStorage(): VisitPassWalletStorage {
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
    const credited = creditVisitPass(emptyVisitPassWallet(), {
      productId: 701,
      name: "Court 10-pack",
      visits: 10,
    });
    expect(remainingVisitsForProduct(credited, 701)).toBe(10);
    saveVisitPassWallet(9, credited, storage);
    expect(loadVisitPassWallet(9, storage).entries).toEqual(credited.entries);
    expect(loadVisitPassWallet(8, storage).entries).toEqual([]);
  });

  it("stacks additional pack purchases and decrements on redeem", () => {
    const once = creditVisitPass(emptyVisitPassWallet(), {
      productId: 701,
      name: "Court 10-pack",
      visits: 10,
    });
    const twice = creditVisitPass(once, { productId: 701, name: "Court 10-pack", visits: 10 });
    expect(twice.entries[0]).toMatchObject({ remaining: 20, total: 20 });
    const after = debitVisitPass(twice, 701, 3);
    expect(remainingVisitsForProduct(after, 701)).toBe(17);
  });

  it("credits a pack then debits redeemed slots on first checkout", () => {
    const after = applyVisitPassCheckoutToWallet(
      emptyVisitPassWallet(),
      { productId: 701, name: "Court 10-pack", visitCount: 10 },
      { kind: "buyAndRedeem", visitsNeeded: 2 }
    );
    expect(remainingVisitsForProduct(after, 701)).toBe(8);
    expect(after.entries[0]).toMatchObject({ total: 10, remaining: 8 });
  });

  it("debits only on redeem checkout", () => {
    const owned = creditVisitPass(emptyVisitPassWallet(), {
      productId: 701,
      name: "Court 10-pack",
      visits: 8,
    });
    const after = applyVisitPassCheckoutToWallet(
      owned,
      { productId: 701, name: "Court 10-pack", visitCount: 10 },
      { kind: "redeem", visitsNeeded: 2 }
    );
    expect(remainingVisitsForProduct(after, 701)).toBe(6);
    expect(after.entries[0]?.total).toBe(8);
  });

  it("does not debit below zero", () => {
    const wallet = creditVisitPass(emptyVisitPassWallet(), {
      productId: 1,
      name: "Pass",
      visits: 1,
    });
    expect(remainingVisitsForProduct(debitVisitPass(wallet, 1, 5), 1)).toBe(0);
  });

  it("ignores corrupt storage", () => {
    const storage: VisitPassWalletStorage = {
      getItem: () => "{not-json",
      setItem: () => {},
    };
    expect(loadVisitPassWallet(1, storage)).toEqual(emptyVisitPassWallet());
  });
});

describe("parseSeedVisitsParam", () => {
  it("reads a positive integer", () => {
    expect(parseSeedVisitsParam("10")).toBe(10);
    expect(parseSeedVisitsParam("0")).toBeNull();
    expect(parseSeedVisitsParam("nope")).toBeNull();
  });
});
