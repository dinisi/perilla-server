import { ensureDirSync, move, unlink } from "fs-extra";
import { Document, Model, model, Schema } from "mongoose";
import { join, resolve } from "path";
import { getFileSize, getHash, validateOne, validateUser } from "../utils";
import { FileCounter } from "./counter";
import { Entry } from "./entry";
ensureDirSync("files/managed");

export interface IFileModel extends Document {
    id: number;
    filename: string;
    type: string;
    description: string;
    hash: string;
    size: number;
    created: Date;
    tags: string[];
    owner: string;
    creator: string;
    getPath(): string;
    setFile(path: string): Promise<void>;
}

export const FileSchema = new Schema(
    {
        id: Number,
        filename: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            default: "No description",
        },
        hash: String,
        size: String,
        tags: {
            type: [String],
            required: true,
            default: ["No tags"],
        },
        created: Date,
        owner: {
            type: String,
            required: true,
            validate: (id: string) => validateOne(Entry, id),
        },
        creator: {
            type: String,
            required: true,
            validate: validateUser,
        },
    },
);

FileSchema.index({ id: 1, owner: 1 }, { unique: true });

FileSchema.methods.getPath = function() {
    const self = this as IFileModel;
    return resolve(join("files/managed", self.hash));
};

FileSchema.methods.setFile = async function(path: string) {
    const self = this as IFileModel;
    if (self.hash) {
        const count = await File.find().where("hash").equals(self.hash).countDocuments();
        if (count === 1) {
            await unlink(self.getPath());
        }
        self.hash = null;
        self.size = null;
    }
    if (path) {
        self.hash = await getHash(path);
        self.size = await getFileSize(path);
        const count = await File.find().where("hash").equals(self.hash).countDocuments();
        if (count === 0) {
            await move(path, self.getPath());
        }
    }
};

FileSchema.pre("save", async function(next) {
    const self = this as IFileModel;
    if (!self.created) {
        self.created = new Date();
        const counter = await FileCounter.findByIdAndUpdate(self.owner, { $inc: { count: 1 } }, { upsert: true, new: true });
        self.id = counter.count;
    }
    next();
});

FileSchema.pre("remove", async function(next) {
    const self = this as IFileModel;
    await self.setFile(null);
    next();
});

export const File: Model<IFileModel> = model<IFileModel>("File", FileSchema);
