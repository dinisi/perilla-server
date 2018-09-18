import { Document, model, Model, Schema } from "mongoose";
import { config } from "../config";
import { ensureElement } from "../utils";

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

AccessSchema.pre("save", async function(next) {
    ensureElement((this as IAccessModel).roles, config.defaultAdminRoleID);
    next();
});

export const Access: Model<IAccessModel> = model<IAccessModel>("Access", AccessSchema);
