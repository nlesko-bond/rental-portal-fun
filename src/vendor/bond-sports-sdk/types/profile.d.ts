export declare enum UserGenderEnum {
    OTHER = 1,
    MALE = 2,
    FEMALE = 3
}
export type UpdateProfileDetailsPayload = {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    gender?: UserGenderEnum;
};
export { UserGenderEnum as UserGender };
