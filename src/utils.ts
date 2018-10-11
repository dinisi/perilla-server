import { createHash } from "crypto";
import { createReadStream, readFileSync, stat } from "fs-extra";
import { Problem } from "./schemas/problem";
import { Role } from "./schemas/role";
import { User } from "./schemas/user";

export const getBaseURL = (hostname: string, port: number) => {
    return "http://" + hostname + (port === 80 ? "" : ":" + port);
};

export const MD5 = (path: string): Promise<string> => {
    return new Promise((reslove) => {
        const result = createHash("md5");
        const stream = createReadStream(path);
        stream.on("data", (chunk) => {
            result.update(chunk);
        });
        stream.on("end", () => {
            const md5 = result.digest("hex");
            reslove(md5);
        });
    });
};

export const getFileSize = (path: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        stat(path, (err, stats) => {
            if (err) { reject(err); }
            resolve(stats.size);
        });
    });
};

export const validateRoles = async (roles: string[]) => {
    const count = await Role.find().where("_id").in(roles).countDocuments();
    return count === roles.length;
};

export const validateACE = async (aces: string[]) => {
    const users = await User.find().where("_id").in(aces).countDocuments();
    const roles = await Role.find().where("_id").in(aces).countDocuments();
    return (users + roles) === aces.length;
};

export const validateProblem = async (problems: string[]) => {
    const count = await Problem.find().where("_id").in(problems).countDocuments();
    return count === problems.length;
};
