import { pbkdf2Sync } from "crypto";

export const getFuzzyTime = () => {
    const date = new Date();
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;
};

export const getVerificationCode = (accessToken: string, clientID: string) => {
    return pbkdf2Sync(`${accessToken}.${getFuzzyTime()}`, clientID, 1000, 64, "sha512").toString("hex");
};
