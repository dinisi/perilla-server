import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { IFileAccessConfig } from "../definitions/access";

export interface IFileAccessModel extends Document {
    roleID: string;
    fileID: string;
    config: IFileAccessConfig;
    _protected: boolean;
}

export let FileAccessSchema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        config: { type: Object, required: true, default: config.defaultFileAccess },
        fileID: { type: String, required: true },
        roleID: { type: String, required: true },
    },
);

export const FileAccess: Model<IFileAccessModel> = model<IFileAccessModel>("FileAccess", FileAccessSchema);
