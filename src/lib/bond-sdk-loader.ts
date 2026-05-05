import type * as BondSportsSdkModule from "@/vendor/bond-sports-sdk";

export type BondSportsSdkGlobal = typeof BondSportsSdkModule;

const SDK_SCRIPT_SRC = "/vendor/bond-sports-sdk/BondSportsSdk.js";
const SDK_SCRIPT_DATA_ATTR = "data-bond-sports-sdk";

let loadPromise: Promise<BondSportsSdkGlobal> | null = null;

/**
 * Loads the vendored Bond Sports SDK bundle once, returning the typed `BondSportsSdk` global.
 * Safe to call from multiple components — the script tag is injected at most once.
 *
 * @throws when invoked on the server, or when the script fails to load.
 */
export function loadBondSportsSdk(): Promise<BondSportsSdkGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadBondSportsSdk must be called in the browser"));
  }
  if (window.BondSportsSdk) {
    return Promise.resolve(window.BondSportsSdk);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<BondSportsSdkGlobal>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[${SDK_SCRIPT_DATA_ATTR}]`);
    if (existing) {
      existing.addEventListener("load", () => resolveOrReject(resolve, reject));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Bond Sports SDK bundle")),
      );
      return;
    }
    const tag = document.createElement("script");
    tag.src = SDK_SCRIPT_SRC;
    tag.async = true;
    tag.setAttribute(SDK_SCRIPT_DATA_ATTR, "true");
    tag.addEventListener("load", () => resolveOrReject(resolve, reject));
    tag.addEventListener("error", () =>
      reject(new Error("Failed to load Bond Sports SDK bundle")),
    );
    document.head.appendChild(tag);
  }).catch((err) => {
    loadPromise = null;
    throw err;
  });

  return loadPromise;
}

function resolveOrReject(
  resolve: (value: BondSportsSdkGlobal) => void,
  reject: (reason: Error) => void,
) {
  const sdk = window.BondSportsSdk;
  if (sdk) {
    resolve(sdk);
  } else {
    reject(new Error("Bond Sports SDK loaded but global is missing"));
  }
}

export type BondSdkOAuthConfig = {
  authority: string;
  clientId: string;
  redirectUri: string;
  scopes: readonly string[];
  apiKey: string;
  apiBaseUrl: string;
};

const DEFAULT_SCOPES = ["openid", "email", "profile"] as const;

/**
 * Reads the SDK config from `NEXT_PUBLIC_BOND_OAUTH_*` and `NEXT_PUBLIC_BOND_PUBLIC_API_*`
 * environment variables. Returns `null` when any required value is missing.
 */
export function readBondSdkOAuthConfig(): BondSdkOAuthConfig | null {
  const authority = process.env.NEXT_PUBLIC_BOND_OAUTH_AUTHORITY;
  const clientId = process.env.NEXT_PUBLIC_BOND_OAUTH_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_BOND_OAUTH_REDIRECT_URI;
  const apiKey = process.env.NEXT_PUBLIC_BOND_PUBLIC_API_KEY;
  const apiBaseUrl = process.env.NEXT_PUBLIC_BOND_PUBLIC_API_BASE_URL;

  if (!authority || !clientId || !redirectUri || !apiKey || !apiBaseUrl) {
    return null;
  }

  return {
    authority,
    clientId,
    redirectUri,
    scopes: DEFAULT_SCOPES,
    apiKey,
    apiBaseUrl,
  };
}

let endSessionEndpointPromise: Promise<string | null> | null = null;

/**
 * Resolves Cognito's `end_session_endpoint` (the hosted-UI `/logout` URL) via OIDC discovery.
 * Cached per page load — discovery doc is immutable. Returns `null` if discovery fails.
 */
export function getBondSdkEndSessionEndpoint(authority: string): Promise<string | null> {
  if (endSessionEndpointPromise) return endSessionEndpointPromise;
  endSessionEndpointPromise = (async () => {
    try {
      const res = await fetch(`${authority}/.well-known/openid-configuration`, {
        cache: "force-cache",
      });
      if (!res.ok) return null;
      const data: unknown = await res.json();
      if (data && typeof data === "object" && "end_session_endpoint" in data) {
        const v = (data as { end_session_endpoint: unknown }).end_session_endpoint;
        return typeof v === "string" && v.length > 0 ? v : null;
      }
      return null;
    } catch {
      return null;
    }
  })();
  return endSessionEndpointPromise;
}
