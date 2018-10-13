import { Document, Model, model, Schema } from "mongoose";
import { validateMany, validateOne } from "../utils";
import { File } from "./file";
import { Role } from "./role";
import { Solution } from "./solution";
import { User } from "./user";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    fileIDs: string[];
    data?: object;
    channel?: string;
    tags: string[];
    created: Date;
    ownerID: string;
    groupID: string;
    permission: number;
}

export let ProblemSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            minlength: 1,
            maxlength: 50,
        },
        content: {
            type: String,
            required: true,
            default: "No content",
            minlength: 1,
            maxlength: 40960,
        },
        fileIDs: {
            type: [String],
            required: true,
            validate: (v: string[]) => validateMany(File, v),
        },
        data: Object,
        channel: String,
        tags: {
            type: [String],
            required: true,
            default: ["No tags"],
            index: true,
        },
        created: Date,
        ownerID: {
            type: String,
            required: true,
            validate: (v: string) => validateOne(User, v),
        },
        groupID: {
            type: String,
            required: true,
            validate: (v: string) => validateOne(Role, v),
        },
        permission: {
            type: Number,
            min: 0,
            max: 127,
        },
    },
);

ProblemSchema.pre("save", async function(next) {
    const This = this as IProblemModel;
    if (!This.created) {
        This.created = new Date();
    }
    next();
});

ProblemSchema.pre("remove", async function(next) {
    await Solution.remove({ problemID: this.id });
    next();
});

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
