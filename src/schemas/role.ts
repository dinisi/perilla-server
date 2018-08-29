import { Document, Schema, Model, model } from 'mongoose';

export interface RoleModel extends Document {
    rolename: string,
    description: string,
    commonAccess: any
};

export let RoleSchema: Schema = new Schema(
    {
        rolename: String,
        description: String,
        commonAccess: Object
    }
);

export const Role: Model<RoleModel> = model<RoleModel>('Role', RoleSchema);