"use client";

import { useState } from "react";
import { RightDrawer } from "@/components/ui/RightDrawer";
import { useBondAuth } from "./BondAuthContext";

function IconEnvelope({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm2 0 6 5 6-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUserBadge() {
  return (
    <div className="cb-login-drawer-badge" aria-hidden>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.25" fill="white" />
        <path
          d="M5.5 19.25c.85-2.35 3.05-4 6.5-4s5.65 1.65 6.5 4"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

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
    <RightDrawer
      open={loginOpen}
      onClose={() => setLoginOpen(false)}
      hideTitle
      ariaLabel="Sign in or create account"
      panelClassName="consumer-booking cb-login-drawer"
    >
      <div className="cb-login-drawer-inner">
        <div className="flex flex-col items-center gap-1">
          <IconUserBadge />
          <h2 id="cb-login-heading" className="mt-4 text-center text-xl font-semibold text-[var(--cb-text)]">
            Sign In or Create Account
          </h2>
          <p className="text-center text-sm text-[var(--cb-text-muted)]">
            Sign in or create an account to complete your booking
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--cb-text)]" htmlFor="cb-login-email">
              Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cb-text-muted)]">
                <IconEnvelope />
              </span>
              <input
                id="cb-login-email"
                type="email"
                autoComplete="username"
                className="cb-input w-full pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={busy}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--cb-text)]" htmlFor="cb-login-password">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cb-text-muted)]">
                <IconLock />
              </span>
              <input
                id="cb-login-password"
                type="password"
                autoComplete="current-password"
                className="cb-input w-full pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={busy}
              />
            </div>
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--cb-primary)] px-4 py-3 text-sm font-semibold text-[var(--cb-text-on-primary)] disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-center text-xs text-[var(--cb-text-muted)]">
            Demo: demo@bondsports.co / 123456
          </p>
        </form>
      </div>
    </RightDrawer>
  );
}
