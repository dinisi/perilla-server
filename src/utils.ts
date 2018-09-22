import { pbkdf2, pbkdf2Sync } from "crypto";
import { Access } from "./schemas/access";
import { IUserModel } from "./schemas/user";

export const ensureElement = <T>(arr: T[], element: T) => {
    if (!arr.includes(element)) {
        arr.push(element);
    }
};

export const getFuzzyTime = () => {
    const date = new Date();
    return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;
};

export const getVerificationCode = async (accessToken: string, clientID: string) => {
    return new Promise<string>((resolve, reject) => {
        pbkdf2(`${accessToken}.${getFuzzyTime()}`, clientID, 1000, 64, "sha512", (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.toString("hex"));
            }
        });
    });
};

export const verifyAccess = async (user: IUserModel, accessName: string) => {
    if (await Access.findOne().where("accessName").equals(accessName).where("roles").in(user.roles)) {
        return true;
    } else {
        return false;
    }
};
