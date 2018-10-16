import { createHash } from "crypto";
import { createReadStream, stat } from "fs-extra";
import { Document, Model } from "mongoose";
import { config } from "./config";

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

export const validateOne = async (model: Model<Document>, ID: string) => {
    return !!(await model.findById(ID).countDocuments());
};

export const validateMany = async (model: Model<Document>, IDs: string[]) => {
    return (await model.find().where("_id").in(IDs).countDocuments()) === IDs.length;
};
