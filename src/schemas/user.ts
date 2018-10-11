import * as crypto from "crypto";
import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { IConfiguration } from "../interfaces/config/user";
import { validateRoles } from "../utils";
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
    created: Date;
    roles: string[];
    config: IConfiguration;
    _protected: boolean;
    setPassword(password: string): string;
    validPassword(password: string): boolean;
}

export let UserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        realname: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        bio: {
            type: String,
            required: true,
            default: "No bio",
        },
        created: Date,
        roles: {
            type: [String],
            required: true,
            default: config.defaults.user.roles,
            validate: validateRoles,
        },
        hash: String,
        salt: String,
        config: {
            type: Object,
            required: true,
            default: config.defaults.user.config,
            validate: (v: any) => IConfiguration.validate(v).success,
        },
        _protected: {
            type: Boolean,
            required: true,
            default: false,
        },
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
    const This = this as IUserModel;
    if (This._protected) { return; }
    const badFiles = await BFile.find({ owner: this.id });
    for (const badFile of badFiles) {
        badFile.owner = config.reservedUserID;
        await badFile.save();
    }
    const badProblems = await Problem.find({ owner: this.id });
    for (const badProblem of badProblems) {
        badProblem.owner = config.reservedUserID;
        await badProblem.save();
    }
    const badSolutions = await Solution.find({ owner: this.id });
    for (const badSolution of badSolutions) {
        badSolution.owner = config.reservedUserID;
        await badSolution.save();
    }
    next();
});

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
