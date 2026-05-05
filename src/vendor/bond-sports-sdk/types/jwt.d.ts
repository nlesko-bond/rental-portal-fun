import type { JwtPayload } from "jwt-decode";
export type BondJwtClaims = JwtPayload & Record<string, unknown> & {
    "custom:consumerDataAdded"?: string;
    "custom:userId"?: string;
};
