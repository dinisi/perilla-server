import { Document, Schema, Model, model } from 'mongoose';
import * as crypto from 'crypto';

export interface UserModel extends Document {
    username: string,
    realname: string,
    email: string,
    bio: string,
    hash: string,
    salt: string,
    setPassword(password: string): string,
    validPassword(password: string): boolean
};

export let UserSchema: Schema = new Schema(
    {
        username: String,
        realname: String,
        email: String,
        bio: String,
        hash: String,
        salt: String
    }
);

UserSchema.methods.setPassword = function (password: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function (password: string) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

export const User: Model<UserModel> = model<UserModel>('User', UserSchema);