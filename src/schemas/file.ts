import { ensureDirSync, move, unlink } from "fs-extra";
import { Document, Model, model, Schema } from "mongoose";
import { join, resolve } from "path";
import { getFileSize, MD5 } from "../utils";
ensureDirSync("files/managed");

export interface IFileModel extends Document {
    filename: string;
    description: string;
    hash: string;
    size: number;
    created: Date;
    group: string;
    public: boolean;
    getPath(): string;
    setFile(path: string): Promise<void>;
}

export let FileSchema = new Schema(
    {
        filename: {
            type: String,
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            default: "No description",
        },
        hash: String,
        size: String,
        created: Date,
        group: {
            type: String,
            required: true,
        },
        public: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
);

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
        self.hash = await MD5(path);
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
    }
    next();
});

FileSchema.pre("remove", async function(next) {
    const self = this as IFileModel;
    await self.setFile(null);
    next();
});

export const File: Model<IFileModel> = model<IFileModel>("File", FileSchema);
