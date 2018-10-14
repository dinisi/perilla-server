import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { IConfiguration } from "../interfaces/user";

export interface IRoleModel extends Document {
    _id: string;
    description: string;
    config: IConfiguration;
    _protected: boolean;
}

export let RoleSchema: Schema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            minlength: 1,
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
