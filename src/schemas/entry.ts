import * as crypto from "crypto";
import { Document, model, Schema } from "mongoose";

export enum EntryType {
    user,
    group,
}

export interface IEntryModel extends Document {
    _id: string;
    description?: string;
    email: string;
    hash?: string;
    salt?: string;
    created: Date;
    enable: boolean;
    type: EntryType;
    setPassword(password: string): string;
    validPassword(password: string): boolean;
}

export const EntrySchema: Schema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            minlength: 1,
            validate: (v: string) => /^[A-Za-z0-9]*$/.test(v),
        },
        description: String,
        email: {
            type: String,
            required: true,
            minlength: 1,
        },
        hash: String,
        salt: String,
        created: Date,
        enable: {
            type: Boolean,
            required: true,
            default: true,
        },
        type: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
        },
    },
);

EntrySchema.methods.setPassword = function(password: string) {
    if (this.type === EntryType.user) {
        this.salt = crypto.randomBytes(16).toString("hex");
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
    } else {
        throw new Error("Entry not a user");
    }
};

EntrySchema.methods.validPassword = function(password: string) {
    if (this.type === EntryType.user) {
        const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
        return this.hash === hash;
    } else {
        throw new Error("Entry not a user");
    }
};

EntrySchema.pre("save", function(next) {
    const self = this as IEntryModel;
    if (!self.created) {
        self.created = new Date();
    }
    next();
});

export const Entry = model<IEntryModel>("Entry", EntrySchema);
