import { createHash } from "crypto";
import { createReadStream, stat } from "fs-extra";
import { Model } from "mongoose";
import { config } from "./config";
import { IClient } from "./interfaces/cache";
import { IContestModel } from "./schemas/contest";
import { IFileModel } from "./schemas/file";
import { IProblemModel } from "./schemas/problem";
import { ISolutionModel } from "./schemas/solution";
import { IUserModel } from "./schemas/user";
import { IRoleModel } from "./schemas/role";

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

type IExModel = IContestModel | IFileModel | IProblemModel | ISolutionModel;
type IModel  = IExModel | IUserModel | IRoleModel;

export const validateOne = async(model: Model<IModel>, ID: string) => {
    return !!(await model.findById(ID).countDocuments());
}

export const validateMany = async(model: Model<IModel>, IDs: string[]) => {
    return (await model.find().where("_id").in(IDs).countDocuments()) === IDs.length;
}

// Linux-style Access config
// rwrwrw user group
// | | |--Others (lowest 2 bits)
// | |----Same Group
// |------Same User
// Group `wheel` and user `root` have super power!!!
// See code below

export const getAccess = (resource: IExModel, client: IClient) => {
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
