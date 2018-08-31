import * as crypto from "crypto";
import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { BFile } from "./file";
import { Problem } from "./problem";
import { Solution } from "./solution";

export interface IUserModel extends Document {
    username: string;
    realname: string;
    email: string;
    bio: string;
    hash: string;
    salt: string;
    roles: [string];
    _protected: boolean;
    setPassword(password: string): string;
    validPassword(password: string): boolean;
}

export let UserSchema: Schema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        bio: { type: String, required: true, default: "No bio" },
        email: { type: String, required: true, unique: true, minlength: 1 },
        hash: String,
        realname: String,
        roles: { type: [String], required: true, default: [config.defaultUserRoleID] },
        salt: String,
        username: String,
    },
);

UserSchema.methods.setPassword = function(password: string) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
};

UserSchema.methods.validPassword = function(password: string) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    return this.hash === hash;
};

UserSchema.pre("remove", async function(next) {
    if ((this as IUserModel)._protected) { return; }
    const id: string = this._id.toString();
    const badFiles = await BFile.find({ owner: id });
    for (const badFile of badFiles) {
        badFile.owner = config.defaultAdminUserID;
        await badFile.save();
    }
    const badProblems = await Problem.find({ owner: id });
    for (const badProblem of badProblems) {
        badProblem.owner = config.defaultAdminUserID;
        await badProblem.save();
    }
    const badSolutions = await Solution.find({ owner: id });
    for (const badSolution of badSolutions) {
        badSolution.owner = config.defaultAdminUserID;
        await badSolution.save();
    }
    next();
});

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
