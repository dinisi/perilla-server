import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";

export interface IFileAccessModel extends Document {
    roleID: string;
    fileID: string;
    MContent: boolean;
    DRemove: boolean;
    _protected: boolean;
}

export let FileAccessSchema = new Schema(
    {
        DRemove: { type: Boolean, required: true, default: false },
        MContent: { type: Boolean, required: true, default: false },
        _protected: { type: Boolean, required: true, default: false },
        fileID: { type: String, required: true },
        roleID: { type: String, required: true },
    },
);

export const FileAccess: Model<IFileAccessModel> = model<IFileAccessModel>("FileAccess", FileAccessSchema);
