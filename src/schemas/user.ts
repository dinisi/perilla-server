import * as crypto from "crypto";
import { Document, model, Schema } from "mongoose";

export interface IUserModel extends Document {
    _id: string;
    realname: string;
    hash: string;
    salt: string;
    created: Date;
    admin: boolean;
    setPassword(password: string): string;
    validPassword(password: string): boolean;
}

export let UserSchema: Schema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            minlength: 1,
            validate: (v: string) => /^[A-Za-z0-9]*$/.test(v),
        },
        realname: {
            type: String,
            required: true,
            unique: true,
            minlength: 1,
        },
        admin: {
            type: Boolean,
            required: true,
            default: false,
        },
        created: Date,
        hash: String,
        salt: String,
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

UserSchema.pre("save", function(next) {
    const self = this as IUserModel;
    if (!self.created) {
        self.created = new Date();
    }
    next();
});

UserSchema.pre("remove", async function(next) {
    // const badFiles = await File.find({ ownerID: this.id });
    // for (const badFile of badFiles) {
    //     badFile.owner = config.reservedUserID;
    //     await badFile.save();
    // }
    // const badProblems = await Problem.find({ ownerID: this.id });
    // for (const badProblem of badProblems) {
    //     badProblem.owner = config.reservedUserID;
    //     await badProblem.save();
    // }
    // const badSolutions = await Solution.find({ ownerID: this.id });
    // for (const badSolution of badSolutions) {
    //     badSolution.owner = config.reservedUserID;
    //     await badSolution.save();
    // }
    next();
});

export const User = model<IUserModel>("User", UserSchema);
