import { ensureDirSync, unlink, move } from "fs-extra";
import { Document, Model, model, Schema } from "mongoose";
import { join, resolve } from "path";
import { config } from "../config";
import { MD5, getFileSize } from "../utils";
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
            default: [config.defaultAdminRoleID, config.defaultJudgerRoleID],
        },
        allowedModify: {
            type: [String],
            required: true,
            default: [config.defaultAdminRoleID],
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

BFileSchema.methods.getPath = function () {
    const This = this as IBFileModel;
    return resolve(join("files/managed", This.hash));
};

BFileSchema.methods.setFile = async function (path: string) {
    const This = this as IBFileModel;
    if (This.hash) {
        const count = await BFile.find().where("hash").equals(This.hash).countDocuments();
        if (count === 1) {
            await unlink(This.getPath());
        }
        This.hash = null;
        This.size = null;
    }
    if (path) {
        This.hash = await MD5(path);
        This.size = await getFileSize(path);
        const count = await BFile.find().where("hash").equals(This.hash).countDocuments();
        if (count === 0) {
            await move(path, This.getPath());
        }
    }
};

BFileSchema.pre("save", async function (next) {
    const This = this as IBFileModel;
    if (!This.created) {
        This.created = new Date();
    }
    next();
});

BFileSchema.pre("remove", async function (next) {
    const This = this as IBFileModel;
    await This.setFile(null);
    next();
});

export const BFile: Model<IBFileModel> = model<IBFileModel>("File", BFileSchema);
