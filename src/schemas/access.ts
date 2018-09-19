import { Document, model, Model, Schema } from "mongoose";
import { config } from "../config";

export interface IAccessModel extends Document {
    accessName: string;
    roles: string[];
}

export const AccessSchema = new Schema(
    {
        accessName: { type: String, required: true, unique: true },
        roles: { type: [String], required: true, default: [config.defaultAdminRoleID] },
    },
);

export const Access: Model<IAccessModel> = model<IAccessModel>("Access", AccessSchema);
