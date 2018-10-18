import { createHash } from "crypto";
import { createReadStream, stat } from "fs-extra";
import { Document, Model } from "mongoose";
import { SHA3Hash } from "sha3";
import { Entry, EntryType, IEntryModel } from "./schemas/entry";
import { EntryMap, IEntryMapModel } from "./schemas/entryMap";
import { IFileModel } from "./schemas/file";
import { IProblemModel } from "./schemas/problem";
import { ISolutionModel } from "./schemas/solution";

export const getBaseURL = (hostname: string, port: number) => {
    return "http://" + hostname + (port === 80 ? "" : ":" + port);
};

export const getHash = (path: string): Promise<string> => {
    return new Promise((reslove) => {
        const md5 = createHash("md5");
        const sha3 = new SHA3Hash();
        const stream = createReadStream(path);
        stream.on("data", (chunk) => {
            md5.update(chunk);
            sha3.update(chunk);
        });
        stream.on("end", () => {
            const md5Value = md5.digest("hex");
            const sha3Value = sha3.digest("hex");
            reslove(md5Value + "_" + sha3Value);
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

export const validateOne = async (model: Model<Document>, ID: string) => {
    return !!(await model.findById(ID).countDocuments());
};

export const validateMany = async (model: Model<Document>, IDs: string[]) => {
    return (await model.find().where("_id").in(IDs).countDocuments()) === IDs.length;
};

export const validateUser = async (ID: string) => {
    const user = await Entry.findById(ID);
    if (!user) { return false; }
    return user.type === EntryType.user;
};

export const validateGroup = async (ID: string) => {
    const group = await Entry.findById(ID);
    if (!group) { return false; }
    return group.type === EntryType.group;
};

interface ICommonModel extends Document {
    public?: boolean;
    admin?: boolean;
}
export const validateAccess = async (resource: ICommonModel, entry: string, admin: boolean) => {
    if (!admin && resource.public) { return true; }
    const map = await EntryMap.findOne({ from: entry, to: resource.owner });
    if (admin) { return (!!map) && map.admin; }
    return resource.public || (!!map);
};
