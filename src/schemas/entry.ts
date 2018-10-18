import * as crypto from "crypto";
import { Document, model, Schema } from "mongoose";
import { FileCounter, ProblemCounter, SolutionCounter } from "./counter";
import { EntryMap } from "./entryMap";
import { File } from "./file";
import { Problem } from "./problem";
import { Solution } from "./solution";

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
            unique: true,
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

EntrySchema.pre("save", async function(next) {
    const self = this as IEntryModel;
    if (!self.created) {
        self.created = new Date();
        if (self.type === EntryType.user) {
            // Add self entry-map
            const map = new EntryMap();
            map.from = map.to = self._id;
            map.admin = true;
            await map.save();
        }
    }
    next();
});

EntrySchema.pre("remove", async function(next) {
    const self = this as IEntryModel;
    await FileCounter.remove({ _id: self._id });
    await SolutionCounter.remove({ _id: self._id });
    await ProblemCounter.remove({ _id: self._id });
    await File.remove({ owner: self._id });
    await Problem.remove({ owner: self._id });
    await Solution.remove({ owner: self._id });
});

export const Entry = model<IEntryModel>("Entry", EntrySchema);