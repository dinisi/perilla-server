import { Document, Schema, Model, model } from 'mongoose';
import { verifyResult } from '../interfaces/verifyResult';

export interface RoleModel extends Document {
    rolename: string,
    description: string,
    config: any,
    verifyAccess(request: string): verifyResult
};

export let RoleSchema: Schema = new Schema(
    {
        rolename: String,
        description: String,
        config: Object
    }
);

RoleSchema.methods.verifyAccess = function (request: string) {
    if (this.config[request]) return verifyResult.Approve;
    return verifyResult.Deny;
}

export const Role: Model<RoleModel> = model<RoleModel>('Role', RoleSchema);