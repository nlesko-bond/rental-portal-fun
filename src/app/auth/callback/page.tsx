"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoadingFallback } from "@/components/PageLoadingFallback";
import { loadBondSportsSdk, readBondSdkOAuthConfig } from "@/lib/bond-sdk-loader";

const SDK_RETURN_TARGET_KEY = "bondSdk:returnTarget";
const RETURN_PARAM_ALLOWLIST = [
  "portalId",
  "portal",
  "orgId",
  "org",
  "primary",
  "accent",
  "secondary",
  "success",
] as const;

function readReturnTarget(): string {
  if (typeof window === "undefined") return "/";
  try {
    const stored = window.sessionStorage.getItem(SDK_RETURN_TARGET_KEY);
    if (stored && stored.startsWith("/")) {
      window.sessionStorage.removeItem(SDK_RETURN_TARGET_KEY);
      return stored;
    }
  } catch {
    /* sessionStorage may be unavailable */
  }
  return "/";
}

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ranRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const config = readBondSdkOAuthConfig();
    if (!config) {
      setError("Bond SDK is not configured. Set NEXT_PUBLIC_BOND_OAUTH_* env vars.");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const sdk = await loadBondSportsSdk();
        const api = new sdk.BondSportsApi(
          {
            authority: config.authority,
            clientId: config.clientId,
            redirectUri: config.redirectUri,
            scopes: [...config.scopes],
          },
          config.apiKey,
          config.apiBaseUrl,
        );
        await api.parseCallback();
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(`Sign-in failed: ${message}`);
        }
        return;
      }
      if (cancelled) return;
      const target = readReturnTarget();
      const preserved = new URLSearchParams();
      for (const key of RETURN_PARAM_ALLOWLIST) {
        const v = searchParams.get(key);
        if (v != null && v !== "") preserved.set(key, v);
      }
      const query = preserved.toString();
      const dest = query.length > 0
        ? `${target}${target.includes("?") ? "&" : "?"}${query}`
        : target;
      router.replace(dest);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="cb-auth-callback-state cb-auth-callback-state--error" role="alert">
        <h1>Sign-in error</h1>
        <p>{error}</p>
        <button type="button" onClick={() => router.replace("/")}>Return to booking</button>
      </div>
    );
  }
  return <PageLoadingFallback />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <CallbackInner />
    </Suspense>
  );
}
