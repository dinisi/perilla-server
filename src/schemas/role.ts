import { Document, Model, model, Schema } from "mongoose";
import { ICommonAccess } from "../definitions/access/common";

export let defaultCommonAccess: ICommonAccess = {
    createRole: false,
    createUser: false,
    deleteRole: false,
    deleteUser: false,
    modifyRole: false,
    modifyUser: false,
};

export interface IRoleModel extends Document {
    rolename: string;
    description: string;
    config: ICommonAccess;
    _protected: boolean;
}

export let RoleSchema: Schema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        config: { type: Object, required: true, default: defaultCommonAccess },
        description: { type: String, required: true, default: "" },
        rolename: { type: String, unique: true, required: true },
    },
);

RoleSchema.pre("remove", function(next) {
    if ((this as any)._protected) { return; }
    next();
});

export const Role: Model<IRoleModel> = model<IRoleModel>("Role", RoleSchema);
