import { ensureDirSync, move, unlink } from "fs-extra";
import { Document, Model, model, Schema } from "mongoose";
import { join, resolve } from "path";
import { config } from "../config";
import { getFileSize, MD5, validateACES, validateRoles, validateUser } from "../utils";
ensureDirSync("files/managed");

export interface IFileModel extends Document {
    ownerID: string;
    filename: string;
    description: string;
    hash: string;
    size: number;
    allowedRead: string[];
    allowedModify: string[];
    created: Date;
    getPath(): string;
    setFile(path: string): Promise<void>;
}

export let FileSchema = new Schema(
    {
        ownerID: {
            type: String,
            required: true,
            validate: validateUser,
            index: true,
        },
        filename: {
            type: String,
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            default: "No description",
        },
        hash: String,
        size: String,
        created: Date,
        allowedRead: {
            type: [String],
            required: true,
            default: config.defaults.file.allowedRead,
            validate: validateACES,
            index: true,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.file.allowedModify,
            validate: validateACES,
            index: true,
        },
    },
);

FileSchema.methods.getPath = function() {
    const self = this as IFileModel;
    return resolve(join("files/managed", self.hash));
};

FileSchema.methods.setFile = async function(path: string) {
    const self = this as IFileModel;
    if (self.hash) {
        const count = await File.find().where("hash").equals(self.hash).countDocuments();
        if (count === 1) {
            await unlink(self.getPath());
        }
        self.hash = null;
        self.size = null;
    }
    if (path) {
        self.hash = await MD5(path);
        self.size = await getFileSize(path);
        const count = await File.find().where("hash").equals(self.hash).countDocuments();
        if (count === 0) {
            await move(path, self.getPath());
        }
    }
};

FileSchema.pre("save", async function(next) {
    const self = this as IFileModel;
    if (!self.created) {
        self.created = new Date();
    }
    next();
});

FileSchema.pre("remove", async function(next) {
    const self = this as IFileModel;
    await self.setFile(null);
    next();
});

export const File: Model<IFileModel> = model<IFileModel>("File", FileSchema);
