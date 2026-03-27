"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type BondSession =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; email?: string; bondUserId?: number };

type Ctx = {
  session: BondSession;
  refetchSession: () => void;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
  /** Increments on successful login — consumers can show welcome UI / open family picker. */
  welcomeToastTick: number;
};

const BondAuthContext = createContext<Ctx | null>(null);

export function BondAuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [loginOpen, setLoginOpen] = useState(false);
  const [welcomeToastTick, setWelcomeToastTick] = useState(0);

  const q = useQuery({
    queryKey: ["bond-auth-session"],
    queryFn: async () => {
      const res = await fetch("/api/bond-auth/session", { credentials: "include" });
      if (!res.ok) {
        return { authenticated: false as const };
      }
      return (await res.json()) as {
        authenticated: boolean;
        email?: string;
        bondUserId?: number;
        reason?: string;
      };
    },
    staleTime: 30_000,
  });

  const session: BondSession = useMemo(() => {
    if (q.isPending) return { status: "loading" };
    const d = q.data;
    if (d?.authenticated) {
      return { status: "authenticated", email: d.email, bondUserId: d.bondUserId };
    }
    return { status: "anonymous" };
  }, [q.isPending, q.data]);

  const refetchSession = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["bond-auth-session"] });
  }, [qc]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/bond-auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        return { ok: false as const, message: "Unexpected response" };
      }
      if (!res.ok) {
        const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
        const msg =
          typeof o.error === "string" && o.error.length > 0
            ? o.error
            : `Login failed (${res.status})`;
        return { ok: false as const, message: msg };
      }
      await qc.invalidateQueries({ queryKey: ["bond-auth-session"] });
      setWelcomeToastTick((t) => t + 1);
      return { ok: true as const };
    },
    [qc]
  );

  const logout = useCallback(async () => {
    await fetch("/api/bond-auth/logout", { method: "POST", credentials: "include" });
    await qc.invalidateQueries({ queryKey: ["bond-auth-session"] });
    setLoginOpen(false);
  }, [qc]);

  const value = useMemo(
    () => ({
      session,
      refetchSession,
      login,
      logout,
      loginOpen,
      setLoginOpen,
      welcomeToastTick,
    }),
    [session, refetchSession, login, logout, loginOpen, welcomeToastTick]
  );

  return <BondAuthContext.Provider value={value}>{children}</BondAuthContext.Provider>;
}

export function useBondAuth() {
  const ctx = useContext(BondAuthContext);
  if (!ctx) throw new Error("useBondAuth requires BondAuthProvider");
  return ctx;
}
