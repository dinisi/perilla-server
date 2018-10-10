import { ensureDirSync, move, unlink } from "fs-extra";
import { Document, Model, model, Schema } from "mongoose";
import { join, resolve } from "path";
import { config } from "../config";
import { getFileSize, MD5 } from "../utils";
ensureDirSync("files/managed");

export interface IBFileModel extends Document {
    owner: string;
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

export let BFileSchema = new Schema(
    {
        allowedRead: {
            type: [String],
            required: true,
            default: config.defaults.file.allowedRead,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.file.allowedModify,
        },
        created: Date,
        filename: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            default: "No description",
        },
        hash: String,
        size: String,
        owner: {
            type: String,
            required: true,
        },
    },
);

BFileSchema.methods.getPath = function() {
    const self = this as IBFileModel;
    return resolve(join("files/managed", self.hash));
};

BFileSchema.methods.setFile = async function(path: string) {
    const self = this as IBFileModel;
    if (self.hash) {
        const count = await BFile.find().where("hash").equals(self.hash).countDocuments();
        if (count === 1) {
            await unlink(self.getPath());
        }
        self.hash = null;
        self.size = null;
    }
    if (path) {
        self.hash = await MD5(path);
        self.size = await getFileSize(path);
        const count = await BFile.find().where("hash").equals(self.hash).countDocuments();
        if (count === 0) {
            await move(path, self.getPath());
        }
    }
};

BFileSchema.pre("save", async function(next) {
    const self = this as IBFileModel;
    if (!self.created) {
        self.created = new Date();
    }
    next();
});

BFileSchema.pre("remove", async function(next) {
    const self = this as IBFileModel;
    await self.setFile(null);
    next();
});

export const BFile: Model<IBFileModel> = model<IBFileModel>("File", BFileSchema);
