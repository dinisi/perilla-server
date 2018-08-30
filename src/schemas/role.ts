import { Document, Schema, Model, model } from 'mongoose';
import { verifyResult } from '../definitions/verifyResult';

export interface CommonAccess {
    createUser: boolean,
    modifyUser: boolean,
    deleteUser: boolean,
    createRole: boolean,
    modifyRole: boolean,
    deleteRole: boolean
}

export let defaultCommonAccess: CommonAccess = {
    createUser: false,
    modifyUser: false,
    deleteUser: false,
    createRole: false,
    modifyRole: false,
    deleteRole: false,
};

export interface RoleModel extends Document {
    rolename: string,
    description: string,
    config: CommonAccess,
    verifyAccess(request: string): verifyResult
};

export let RoleSchema: Schema = new Schema(
    {
        rolename: { type: String, unique: true, required: true },
        description: { type: String, required: true, default: "" },
        config: { type: Object, required: true, default: defaultCommonAccess }
    }
);

RoleSchema.methods.verifyAccess = function (request: string) {
    if (this.config[request]) return verifyResult.Approve;
    return verifyResult.Deny;
}

export const Role: Model<RoleModel> = model<RoleModel>('Role', RoleSchema);