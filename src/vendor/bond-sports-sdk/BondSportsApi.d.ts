import { OAuthConfig } from "./types/oauth";
import { Configuration } from './source-sdk';
import type { BondJwtClaims } from "./types/jwt";
import { UserGenderEnum } from "./types/profile";
export declare class BondSportsApi {
    private oauthConfig;
    private apiKey;
    private apiEndpoint;
    private userManager;
    private oidcClient;
    private accessToken?;
    private idToken?;
    private refreshToken?;
    private expirationTime;
    private refreshTokenTimeout?;
    private refreshTokensInFlight?;
    private tokensLoadPromise;
    constructor(oauthConfig: OAuthConfig, apiKey: string, apiEndpoint?: string);
    /**
     * Initiates the OIDC authorization code flow by redirecting the browser
     * to the identity provider's login page.
     */
    login(): Promise<void>;
    /**
     * Handles the OIDC redirect callback after a successful login.
     *
     * Should be called on the redirect URI page. Reads the `code` and `state`
     * parameters from the current URL, exchanges them for tokens, persists the
     * tokens, and cleans the query string from the browser history.
     *
     * Does nothing when no `code` parameter is present in the URL.
     *
     * @throws {Error} If the identity provider returns no user object.
     */
    parseCallback(): Promise<void>;
    /**
     * Returns an SDK {@link Configuration} pre-wired with authentication
     * middleware for use with generated API clients.
     *
     * The middleware injected into every request:
     * - Refreshes the access token automatically when it has expired.
     * - Injects `Content-Type`, `X-Api-Key`, `X-BondUserAccessToken`, and
     *   `X-BondUserIdToken` headers.
     *
     * @throws {Error} If no ID token is available.
     * @throws {Error} If the user's consumer data has not been added yet
     *                 (i.e. `custom:consumerDataAdded` claim is not `"true"`).
     */
    getApiConfig(): Configuration;
    /**
     * Decodes the payload of a JWT without verifying its signature.
     *
     * @param token - A compact JWT string in the format `header.payload.signature`.
     * @returns The parsed JSON payload as a plain object.
     * @throws {Error} If the token cannot be decoded.
     */
    decodeJwt(token: string): BondJwtClaims;
    /**
     * Returns `true` when the current access token is absent or its expiry
     * timestamp has already passed.
     */
    isAccessTokenExpired(): boolean;
    /**
     * Updates the authenticated user's profile with the provided birth date and
     * gender, then refreshes the session tokens so that updated JWT claims are
     * reflected immediately.
     *
     * @param birthDate - The user's date of birth in `YYYY-MM-DD` format.
     * @param gender - The user's gender ({@link UserGenderEnum}).
     * @returns The parsed JSON body of the API response.
     * @throws {Error} If `birthDate` is not in `YYYY-MM-DD` format.
     * @throws {Error} If either the access token or the ID token is unavailable.
     */
    updateProfileDetails(birthDate: string, gender: UserGenderEnum): Promise<any>;
    private tokensStore;
    private tokensStoreAfterRefresh;
    private tokensStoreInternal;
    private isValidBirthDate;
    private getProfileApiEndpoint;
    private tokensLoad;
    private setTokenExpirationTime;
    private setTokenTimer;
    private refreshTokens;
    private doRefreshTokens;
    private cleanupTokenStore;
}
