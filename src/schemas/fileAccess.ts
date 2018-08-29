import { Document, Schema, Model, model } from 'mongoose';

export interface FileAccessConfig {
    read: boolean,
    modify: boolean
};

export interface FileAccessModel extends Document {
    roleID: string,
    fileID: string,
    config: FileAccessConfig
};

export let FileAccessSchema = new Schema(
    {
        roleID: String,
        fileID: String,
        config: Object
    }
);

export const FileAccess: Model<FileAccessModel> = model<FileAccessModel>('FileAccess', FileAccessSchema);