import * as crypto from "crypto";
import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { IConfiguration } from "../interfaces/user";
import { File } from "./file";
import { Problem } from "./problem";
import { Solution } from "./solution";
import { validateMany } from "../utils";
import { Role } from "./role";

export interface IUserModel extends Document {
    username: string;
    realname: string;
    email: string;
    bio: string;
    hash: string;
    salt: string;
    created: Date;
    roleIDs: string[];
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
            minlength: 1,
        },
        realname: {
            type: String,
            required: true,
            unique: true,
            minlength: 1,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            minlength: 1,
            maxlength: 50,
            validate: (v: string) => /^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/.test(v),
        },
        bio: {
            type: String,
            required: true,
            default: "No bio",
            minlength: 1,
            maxlength: 200,
        },
        created: Date,
        roleIDs: {
            type: [String],
            required: true,
            default: config.defaults.user.roleIDs,
            validate: (v: string[]) => validateMany(Role, v),
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

UserSchema.methods.setPassword = function (password: string) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
};

UserSchema.methods.validPassword = function (password: string) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    return this.hash === hash;
};

UserSchema.pre("save", function (next) {
    const self = this as IUserModel;
    if (!self.created) {
        self.created = new Date();
    }
    next();
});

UserSchema.pre("remove", async function (next) {
    const This = this as IUserModel;
    if (This._protected) { return; }
    const badFiles = await File.find({ ownerID: this.id });
    for (const badFile of badFiles) {
        badFile.ownerID = config.reservedUserID;
        await badFile.save();
    }
    const badProblems = await Problem.find({ ownerID: this.id });
    for (const badProblem of badProblems) {
        badProblem.ownerID = config.reservedUserID;
        await badProblem.save();
    }
    const badSolutions = await Solution.find({ ownerID: this.id });
    for (const badSolution of badSolutions) {
        badSolution.ownerID = config.reservedUserID;
        await badSolution.save();
    }
    next();
});

export const User = model<IUserModel>("User", UserSchema);
