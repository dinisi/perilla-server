import { createHash } from "crypto";
import { createReadStream, readFileSync, stat } from "fs-extra";
import { Model } from "mongoose";
import { config } from "./config";
import { IClient } from "./interfaces/cache";
import { IContestModel } from "./schemas/contest";
import { File, IFileModel } from "./schemas/file";
import { IProblemModel, Problem } from "./schemas/problem";
import { Role } from "./schemas/role";
import { ISolutionModel } from "./schemas/solution";
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

export const validateRole = async (role: string) => {
    return !!(await Role.findById(role).countDocuments());
};

export const validateUser = async (user: string[]) => {
    return !!(await User.findById(user).countDocuments());
};

export const validateACES = async (aces: string[]) => {
    const users = await User.find().where("_id").in(aces).countDocuments();
    const roles = await Role.find().where("_id").in(aces).countDocuments();
    return (users + roles) === aces.length;
};

export const validateProblems = async (problems: string[]) => {
    const count = await Problem.find().where("_id").in(problems).countDocuments();
    return count === problems.length;
};

export const validateProblem = async (problem: string) => {
    return !!(await Problem.findById(problem).countDocuments());
};

export const validateFiles = async (files: string[]) => {
    const count = await File.find().where("_id").in(files).countDocuments();
    return count === files.length;
};

// Linux-style Access config
// rwrwrw user group
// | | |--Others (lowest 2 bits)
// | |----Same Group
// |------Same User
// Group `wheel` and user `root` have super power!!!
// See code below

export const getAccess = (resource: IContestModel | IFileModel | IProblemModel | ISolutionModel, client: IClient) => {
    // Special User
    if (client.userID === config.system.root || client.roles.includes(config.system.wheel)) {
        return 3; // RW
    }
    // Common user
    if (client.userID === resource.ownerID) {
        // tslint:disable-next-line:no-bitwise
        return (resource.permission >> 4) & 3;
    } else if (client.roles.includes(resource.groupID)) {
        // tslint:disable-next-line:no-bitwise
        return (resource.permission >> 2) & 3;
    } else {
        // tslint:disable-next-line:no-bitwise
        return resource.permission & 3;
    }
};

export const canRead = (access: number) => {
    // tslint:disable-next-line:no-bitwise
    return !!((access >> 1) & 1);
};

export const canWrite = (access: number) => {
    // tslint:disable-next-line:no-bitwise
    return !!(access & 1);
};
