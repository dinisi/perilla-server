import { ensureDirSync, unlink } from "fs-extra";
import { Document, Model, model, Schema } from "mongoose";
import { join, resolve } from "path";
import { config } from "../config";
import { ensureElement } from "../utils";
ensureDirSync("files/managed");

export interface IBFileModel extends Document {
    hash: string;
    owner: string;
    description: string;
    type: string;
    created: Date;
    size: number;
    allowedRead: string[];
    allowedModify: string[];
    getPath(): string;
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
        description: {
            type: String,
            required: true,
            default: "No description",
        },
        hash: {
            type: String,
            required: true,
        },
        owner: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            required: true,
            default: "txt",
        },
    },
);

BFileSchema.methods.getPath = function() {
    return resolve(join("files/managed", this.id));
};

BFileSchema.pre("save", async function(next) {
    if (!(this as IBFileModel).created) {
        (this as IBFileModel).created = new Date();
    }
    ensureElement((this as IBFileModel).allowedRead, config.defaultAdminRoleID);
    ensureElement((this as IBFileModel).allowedRead, config.defaultJudgerRoleID);
    ensureElement((this as IBFileModel).allowedModify, config.defaultAdminRoleID);
    next();
});

BFileSchema.pre("remove", async function(next) {
    await unlink((this as IBFileModel).getPath());
    next();
});

export const BFile: Model<IBFileModel> = model<IBFileModel>("File", BFileSchema);
