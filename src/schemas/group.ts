import { Document, model, Schema } from "mongoose";

export interface IGroupModel extends Document {
    _id: string;
    email?: string;
    description?: string;
}

export const GroupSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            minlength: 1,
        },
        email: String,
        description: String,
    },
);

export const Group = model<IGroupModel>("Group", GroupSchema);

export interface IUserGroupMapModel extends Document {
    user: string;
    group: string;
    admin: boolean;
}

export const UserGroupMapSchema = new Schema(
    {
        user: {
            type: String,
            required: true,
        },
        group: {
            type: String,
            required: true,
        },
        admin: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
);

export const UserGroupMap = model<IUserGroupMapModel>("UserGroupMap", UserGroupMapSchema);
