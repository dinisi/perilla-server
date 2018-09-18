import { Document, Model, model, Schema } from "mongoose";
import { BFile } from "./file";
import { User } from "./user";

export interface IRoleModel extends Document {
    rolename: string;
    description: string;
    _protected: boolean;
}

export let RoleSchema: Schema = new Schema(
    {
        rolename: { type: String, unique: true, required: true },
        description: { type: String, required: true, default: "" },
        _protected: { type: Boolean, required: true, default: false },
    },
);

RoleSchema.pre("remove", function(next) {
    if ((this as IRoleModel)._protected) { return; }
    next();
});

export const Role: Model<IRoleModel> = model<IRoleModel>("Role", RoleSchema);
