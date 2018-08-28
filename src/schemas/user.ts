import { Document, Schema, Model, model } from "mongoose";

export interface UserModel extends Document {
    username: string,
    realname: string,
    email: string,
    bio: string,
    password: string,
    salt: string
};

export let UserSchema: Schema = new Schema(
    {
        username: String,
        realname: String,
        email: String,
        bio: String,
        password: String,
        salt: String
    }
);

export const User: Model<UserModel> = model<UserModel>('User', UserSchema);