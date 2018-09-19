import * as crypto from "crypto";
import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { ensureElement } from "../utils";
import { BFile } from "./file";
import { Problem } from "./problem";
import { Role } from "./role";
import { Solution } from "./solution";

export interface IUserModel extends Document {
    username: string;
    realname: string;
    email: string;
    bio: string;
    hash: string;
    salt: string;
    roles: string[];
    self: string;
    _protected: boolean;
    setPassword(password: string): string;
    validPassword(password: string): boolean;
}

export let UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        bio: { type: String, required: true, default: "No bio" },
        email: { type: String, required: true, unique: true },
        realname: { type: String, required: true, unique: true },
        roles: { type: [String], required: true, default: [config.defaultUserRoleID] },
        self: String,
        hash: String,
        salt: String,
        _protected: { type: Boolean, required: true, default: false },
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

UserSchema.pre("save", async function(next) {
    const self = (this as IUserModel).self;
    if (!self) {
        const role = new Role();
        role.rolename = `User ${this.id}`;
        role.description = `Self role for user ${this.id}`;
        role._protected = true;
        await role.save();
        (this as IUserModel).self = role.id;
        ensureElement((this as IUserModel).roles, role.id);
    }
    next();
});

UserSchema.pre("remove", async function(next) {
    if ((this as IUserModel)._protected) { return; }
    const badFiles = await BFile.find({ owner: this.id });
    for (const badFile of badFiles) {
        badFile.owner = config.defaultAdminUserID;
        await badFile.save();
    }
    const badProblems = await Problem.find({ owner: this.id });
    for (const badProblem of badProblems) {
        badProblem.owner = config.defaultAdminUserID;
        await badProblem.save();
    }
    const badSolutions = await Solution.find({ owner: this.id });
    for (const badSolution of badSolutions) {
        badSolution.owner = config.defaultAdminUserID;
        await badSolution.save();
    }
    const self = await Role.findById((this as IUserModel).self);
    self._protected = false;
    await self.save();
    await self.remove();
    next();
});

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
