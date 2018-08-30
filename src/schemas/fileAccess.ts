import { Document, Model, model, Schema } from "mongoose";
import { runInNewContext } from "vm";

export interface IFileAccessConfig {
    read: boolean;
    modify: boolean;
}

export interface IFileAccessModel extends Document {
    roleID: string;
    fileID: string;
    config: IFileAccessConfig;
    _protected: boolean;
}

export let FileAccessSchema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        config: { type: Object, required: true, default: { read: false, modify: false } },
        fileID: { type: String, required: true },
        roleID: { type: String, required: true },
    },
);

export const FileAccess: Model<IFileAccessModel> = model<IFileAccessModel>("FileAccess", FileAccessSchema);
