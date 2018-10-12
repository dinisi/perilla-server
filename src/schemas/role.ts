import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { IConfiguration } from "../interfaces/user";

export interface IRoleModel extends Document {
    rolename: string;
    description: string;
    config: IConfiguration;
    father?: string;
    _protected: boolean;
}

export let RoleSchema: Schema = new Schema(
    {
        rolename: {
            type: String,
            unique: true,
            required: true,
        },
        description: {
            type: String,
            required: true,
            default: "",
        },
        config: {
            type: Object,
            required: true,
            default: config.defaults.role.config,
            validate: (v: any) => IConfiguration.validate(v).success,
        },
        _protected: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
);

RoleSchema.pre("remove", function(next) {
    const This = this as IRoleModel;
    if (This._protected) { return; }
    next();
});

export const Role: Model<IRoleModel> = model<IRoleModel>("Role", RoleSchema);
