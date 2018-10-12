import { createHash } from "crypto";
import { createReadStream, readFileSync, stat } from "fs-extra";
import { Model } from "mongoose";
import { File } from "./schemas/file";
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
