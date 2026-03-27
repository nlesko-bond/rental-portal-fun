"use client";

import { useState } from "react";
import { ModalShell } from "@/components/booking/ModalShell";
import { IconLogIn } from "@/components/booking/booking-icons";
import { useBondAuth } from "./BondAuthContext";

export function LoginModal() {
  const { loginOpen, setLoginOpen, login } = useBondAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await login(email.trim(), password);
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setPassword("");
      setLoginOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      open={loginOpen}
      panelClassName="consumer-booking"
      title="Sign in"
      titleIcon={<IconLogIn className="h-6 w-6 text-[var(--cb-primary)]" />}
      onClose={() => setLoginOpen(false)}
    >
      <form onSubmit={onSubmit} className="consumer-booking mt-4 flex flex-col gap-3">
        <p className="text-sm text-[var(--cb-text-muted)]">
          Use your Bond consumer account to access member pricing and checkout.
        </p>
        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--cb-text)]">
          Email
          <input
            type="email"
            autoComplete="username"
            className="cb-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--cb-text)]">
          Password
          <input
            type="password"
            autoComplete="current-password"
            className="cb-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="mt-2 rounded-lg bg-[var(--cb-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--cb-text-on-primary)] disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </ModalShell>
  );
}
