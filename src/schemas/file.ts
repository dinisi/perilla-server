import { Document, Schema, Model, model } from 'mongoose';
import { verifyResult } from '../definitions/verifyResult';
import { FileAccessModel, FileAccess } from './fileAccess';

export interface FileModel extends Document {
    filename: string,
    path: string,
    hash: string,
    owner: string
}

export let FileSchema = new Schema(
    {
        filename: String,
        path: String,
        hash: String,
        owner: String
    }
);

export const File: Model<FileModel> = model<FileModel>('File', FileSchema);