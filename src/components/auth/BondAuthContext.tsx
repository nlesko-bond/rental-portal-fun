"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getBondSdkEndSessionEndpoint,
  loadBondSportsSdk,
  readBondSdkOAuthConfig,
  type BondSdkOAuthConfig,
  type BondSportsSdkGlobal,
} from "@/lib/bond-sdk-loader";
import {
  bondNumericUserIdFromIdToken,
  jwtConsumerDataAdded,
  jwtDiagnosticClaimKeys,
  jwtEmailHint,
  jwtExpSeconds,
} from "@/lib/jwt-payload";

const SDK_RETURN_TARGET_KEY = "bondSdk:returnTarget";
/**
 * Polling interval for SDK token-store changes as a safety net. Real updates flow through the
 * `BOND_AUTH_SESSION_CHANGED_EVENT` custom event (dispatched from `/auth/callback` after
 * `parseCallback()`), so polling only catches edge cases like the SDK silently refreshing tokens
 * during a long idle session.
 */
const SESSION_POLL_INTERVAL_MS = 5_000;
const SDK_ACCESS_TOKEN_KEY = "BondSdkAccessToken";
const SDK_ID_TOKEN_KEY = "BondSdkIdToken";
/** Public so `/auth/callback` and other auth-state mutators can ping the provider after writes. */
export const BOND_AUTH_SESSION_CHANGED_EVENT = "bond-auth:session-changed";
const BOND_AUTH_LOGIN_COMPLETED_KEY = "bond-auth:login-completed";
const BOND_AUTH_MISSING_USER_ID_CLAIM_ERROR = "No user ID claim available";

export type BondSession =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; email?: string; bondUserId?: number; profileComplete: boolean };

export type BondProfileGender = Parameters<
  InstanceType<BondSportsSdkGlobal["BondSportsApi"]>["updateProfileDetails"]
>[1];

export type BondSdkApiClients = {
  config: ReturnType<InstanceType<BondSportsSdkGlobal["BondSportsApi"]>["getApiConfig"]>;
  /** Convenience accessors for the public API classes the SDK ships. */
  auth: InstanceType<BondSportsSdkGlobal["AuthPublicApiApi"]>;
  carts: InstanceType<BondSportsSdkGlobal["CartsPublicApiApi"]>;
  onlineBooking: InstanceType<BondSportsSdkGlobal["OnlineBookingPublicApiApi"]>;
  portals: InstanceType<BondSportsSdkGlobal["PortalsPublicApiApi"]>;
  products: InstanceType<BondSportsSdkGlobal["ProductsPublicApiApi"]>;
  programs: InstanceType<BondSportsSdkGlobal["ProgramsPublicApiApi"]>;
  questionnaires: InstanceType<BondSportsSdkGlobal["QuestionnairesPublicApiApi"]>;
  schedule: InstanceType<BondSportsSdkGlobal["SchedulePublicApiApi"]>;
  users: InstanceType<BondSportsSdkGlobal["UsersPublicApiApi"]>;
};

type Ctx = {
  session: BondSession;
  /**
   * Triggers the OIDC redirect via the Bond SDK. Returns once the SDK has navigated away.
   * Resolves with `{ ok: false }` only when configuration is missing or the SDK fails to load.
   */
  login: () => Promise<{ ok: true } | { ok: false; message: string }>;
  completeProfile: (
    birthDate: string,
    gender: BondProfileGender,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
  /** Increments on first transition to `authenticated` so consumers can show welcome UI. */
  welcomeToastTick: number;
  /**
   * Returns the typed SDK API clients sharing one auth/refresh middleware. Resolves once the SDK
   * bundle has loaded; rejects when env config is missing.
   */
  getApiClients: () => Promise<BondSdkApiClients>;
};

const BondAuthContext = createContext<Ctx | null>(null);

type RefreshableBondApi = {
  refreshTokens: () => Promise<void>;
};

function readStoredSession(): BondSession {
  if (typeof window === "undefined") return { status: "loading" };
  const accessToken = window.sessionStorage.getItem(SDK_ACCESS_TOKEN_KEY) ?? "";
  const idToken = window.sessionStorage.getItem(SDK_ID_TOKEN_KEY) ?? "";
  if (!accessToken || !idToken) return { status: "anonymous" };
  const exp = jwtExpSeconds(accessToken);
  if (exp == null) return { status: "anonymous" };
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (exp <= nowSeconds) return { status: "anonymous" };
  return {
    status: "authenticated",
    email: jwtEmailHint(idToken),
    bondUserId: bondNumericUserIdFromIdToken(idToken) ?? undefined,
    profileComplete: jwtConsumerDataAdded(idToken),
  };
}

function profileApiEndpoint(apiBaseUrl: string): string {
  if (!/^https?:\/\//.test(apiBaseUrl)) return apiBaseUrl.replace(/\/$/, "");
  const apiEndpointUrl = new URL(apiBaseUrl);
  apiEndpointUrl.hostname = apiEndpointUrl.hostname.replace(/^public\./, "");
  return apiEndpointUrl.toString().replace(/\/$/, "");
}

async function patchProfileDetails(
  config: BondSdkOAuthConfig,
  birthDate: string,
  gender: BondProfileGender,
  api: InstanceType<BondSportsSdkGlobal["BondSportsApi"]>,
): Promise<void> {
  if (typeof window === "undefined") throw new Error("Profile completion must run in the browser");
  const accessToken = window.sessionStorage.getItem(SDK_ACCESS_TOKEN_KEY) ?? "";
  const idToken = window.sessionStorage.getItem(SDK_ID_TOKEN_KEY) ?? "";
  if (!accessToken || !idToken) throw new Error("No access or id token available");
  const userId = bondNumericUserIdFromIdToken(idToken) ?? bondNumericUserIdFromIdToken(accessToken);
  if (userId == null) {
    const idClaimKeys = jwtDiagnosticClaimKeys(idToken);
    const accessClaimKeys = jwtDiagnosticClaimKeys(accessToken);
    throw new Error(
      [
        "We received auth tokens, but neither token includes a numeric Bond user id claim.",
        `ID token keys: ${idClaimKeys.length > 0 ? idClaimKeys.join(", ") : "none"}.`,
        `Access token keys: ${accessClaimKeys.length > 0 ? accessClaimKeys.join(", ") : "none"}.`,
      ].join(" "),
    );
  }
  const response = await fetch(`${profileApiEndpoint(config.apiBaseUrl)}/v4/user/${userId}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": config.apiKey,
      "X-BondUserAccessToken": accessToken,
      "X-BondUserIdToken": idToken,
    },
    body: JSON.stringify({
      profile: { birthDate, gender },
      skipUpdateNotification: true,
    }),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message
      : "Could not save profile details";
    throw new Error(message);
  }
  await (api as unknown as RefreshableBondApi).refreshTokens();
}

export function BondAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [welcomeToastTick, setWelcomeToastTick] = useState(0);
  const [session, setSession] = useState<BondSession>({ status: "loading" });
  const apiInstanceRef = useRef<InstanceType<BondSportsSdkGlobal["BondSportsApi"]> | null>(null);
  const sdkClientsRef = useRef<BondSdkApiClients | null>(null);

  const resetSdkRefs = useCallback(() => {
    apiInstanceRef.current = null;
    sdkClientsRef.current = null;
  }, []);

  const ensureSdkInstance = useCallback(async () => {
    const config = readBondSdkOAuthConfig();
    if (!config) {
      throw new Error("Bond SDK is not configured. Set NEXT_PUBLIC_BOND_OAUTH_* env vars.");
    }
    const sdk = await loadBondSportsSdk();
    if (!apiInstanceRef.current) {
      apiInstanceRef.current = new sdk.BondSportsApi(
        {
          authority: config.authority,
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          scopes: [...config.scopes],
        },
        config.apiKey,
        config.apiBaseUrl,
      );
    }
    return { sdk, api: apiInstanceRef.current };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await ensureSdkInstance();
      } catch {
        /* config missing — session remains anonymous */
      }
      if (cancelled) return;
      setSession(readStoredSession());
    })();
    return () => {
      cancelled = true;
    };
  }, [ensureSdkInstance]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = () => setSession(readStoredSession());
    const refreshAfterTokenStoreChange = () => {
      resetSdkRefs();
      refresh();
    };
    const interval = window.setInterval(refresh, SESSION_POLL_INTERVAL_MS);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "BondSdkRefreshToken") refreshAfterTokenStoreChange();
    };
    const onFocus = () => refresh();
    const onCustom = () => refreshAfterTokenStoreChange();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener(BOND_AUTH_SESSION_CHANGED_EVENT, onCustom);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(BOND_AUTH_SESSION_CHANGED_EVENT, onCustom);
    };
  }, [resetSdkRefs]);

  const wasAuthenticatedRef = useRef(false);
  useEffect(() => {
    const isAuth = session.status === "authenticated";
    if (isAuth && !session.profileComplete) {
      setLoginOpen(true);
    }
    if (isAuth && !wasAuthenticatedRef.current) {
      let justCompletedLogin = false;
      try {
        justCompletedLogin = window.sessionStorage.getItem(BOND_AUTH_LOGIN_COMPLETED_KEY) === "true";
        window.sessionStorage.removeItem(BOND_AUTH_LOGIN_COMPLETED_KEY);
      } catch {
        justCompletedLogin = false;
      }
      if (justCompletedLogin && session.profileComplete) {
        setWelcomeToastTick((t) => t + 1);
      } else if (justCompletedLogin) {
        setLoginOpen(true);
      }
    }
    wasAuthenticatedRef.current = isAuth;
  }, [session]);

  const login = useCallback(async (): Promise<{ ok: true } | { ok: false; message: string }> => {
    try {
      const { api } = await ensureSdkInstance();
      if (typeof window !== "undefined") {
        const target = window.location.pathname + window.location.search;
        window.sessionStorage.setItem(SDK_RETURN_TARGET_KEY, target);
      }
      await api.login();
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in unavailable";
      return { ok: false, message };
    }
  }, [ensureSdkInstance]);

  const logout = useCallback(async () => {
    const config = readBondSdkOAuthConfig();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SDK_ACCESS_TOKEN_KEY);
      window.sessionStorage.removeItem(SDK_ID_TOKEN_KEY);
      window.localStorage.removeItem("BondSdkRefreshToken");
      if (config) {
        const oidcKey = `oidc.user:${config.authority}:${config.clientId}`;
        window.localStorage.removeItem(oidcKey);
        window.sessionStorage.removeItem(oidcKey);
      }
    }
    sdkClientsRef.current = null;
    setSession({ status: "anonymous" });
    setLoginOpen(false);

    if (typeof window !== "undefined" && config) {
      const endpoint = await getBondSdkEndSessionEndpoint(config.authority);
      if (endpoint) {
        const params = new URLSearchParams({
          client_id: config.clientId,
          logout_uri: window.location.origin,
        });
        window.location.href = `${endpoint}?${params.toString()}`;
        return;
      }
    }
    router.refresh();
  }, [router]);

  const completeProfile = useCallback(
    async (
      birthDate: string,
      gender: BondProfileGender,
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      try {
        const config = readBondSdkOAuthConfig();
        if (!config) throw new Error("Bond SDK is not configured. Set NEXT_PUBLIC_BOND_OAUTH_* env vars.");
        resetSdkRefs();
        const { api } = await ensureSdkInstance();
        try {
          await api.updateProfileDetails(birthDate, gender);
        } catch (err) {
          if (!(err instanceof Error) || err.message !== BOND_AUTH_MISSING_USER_ID_CLAIM_ERROR) {
            throw err;
          }
          await patchProfileDetails(config, birthDate, gender, api);
        }
        sdkClientsRef.current = null;
        const nextSession = readStoredSession();
        setSession(nextSession);
        if (nextSession.status !== "authenticated" || !nextSession.profileComplete) {
          return { ok: false, message: "Could not save profile details" };
        }
        setLoginOpen(false);
        setWelcomeToastTick((t) => t + 1);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event(BOND_AUTH_SESSION_CHANGED_EVENT));
        }
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not save profile details";
        return { ok: false, message };
      }
    },
    [ensureSdkInstance, resetSdkRefs],
  );

  const getApiClients = useCallback(async (): Promise<BondSdkApiClients> => {
    if (sdkClientsRef.current) return sdkClientsRef.current;
    const { sdk, api } = await ensureSdkInstance();
    const config = api.getApiConfig();
    const clients: BondSdkApiClients = {
      config,
      auth: new sdk.AuthPublicApiApi(config),
      carts: new sdk.CartsPublicApiApi(config),
      onlineBooking: new sdk.OnlineBookingPublicApiApi(config),
      portals: new sdk.PortalsPublicApiApi(config),
      products: new sdk.ProductsPublicApiApi(config),
      programs: new sdk.ProgramsPublicApiApi(config),
      questionnaires: new sdk.QuestionnairesPublicApiApi(config),
      schedule: new sdk.SchedulePublicApiApi(config),
      users: new sdk.UsersPublicApiApi(config),
    };
    sdkClientsRef.current = clients;
    return clients;
  }, [ensureSdkInstance]);

  const value = useMemo<Ctx>(
    () => ({
      session,
      login,
      completeProfile,
      logout,
      loginOpen,
      setLoginOpen,
      welcomeToastTick,
      getApiClients,
    }),
    [session, login, completeProfile, logout, loginOpen, welcomeToastTick, getApiClients],
  );

  return <BondAuthContext.Provider value={value}>{children}</BondAuthContext.Provider>;
}

export function useBondAuth() {
  const ctx = useContext(BondAuthContext);
  if (!ctx) throw new Error("useBondAuth requires BondAuthProvider");
  return ctx;
}
