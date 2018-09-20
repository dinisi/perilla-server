import { ensureDirSync, unlink } from "fs-extra";
import { Document, Model, model, Schema } from "mongoose";
import { join, resolve } from "path";
import { config } from "../config";
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
        filename: {
            type: String,
            required: true,
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
    next();
});

BFileSchema.pre("remove", async function(next) {
    await unlink((this as IBFileModel).getPath());
    next();
});

export const BFile: Model<IBFileModel> = model<IBFileModel>("File", BFileSchema);
