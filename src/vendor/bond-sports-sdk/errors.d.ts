export declare const BondSportsApiErrors: {
    readonly accessTokenMissingExpirationClaim: "Access token missing expiration claim";
    readonly authCodeExchangeFailed: "Failed to exchange authorization code for tokens";
    readonly consumerDataNotAdded: "Consumer data not added. Call updateProfileDetails to update data first";
    readonly invalidBirthDateFormat: "birthDate must be in YYYY-MM-DD format";
    readonly invalidJwtFormat: "Invalid JWT format";
    readonly missingAccessOrIdToken: "No access or id token available";
    readonly missingIdToken: "No ID token available";
    readonly missingRefreshToken: "No refresh token available";
    readonly missingUserIdClaim: "No user ID claim available";
    readonly refreshTokenExchangeFailed: "Failed to exchange refresh token for new tokens";
};
