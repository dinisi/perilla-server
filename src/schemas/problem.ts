import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { Solution } from "./solution";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    files: string[];
    data: object;
    tags: string[];
    owner: string;
    created: Date;
    meta: object;
    allowedRead: string[];
    allowedModify: string[];
    allowedSubmit: string[];
}

export let ProblemSchema: Schema = new Schema(
    {
        allowedRead: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedRead,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedModify,
        },
        allowedSubmit: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedSubmit,
        },
        content: {
            type: String,
            required: true,
            default: "No content",
        },
        created: Date,
        files: {
            type: [String],
            required: true,
        },
        data: {
            type: Object,
            required: true,
            default: { version: "1.0" },
        },
        meta: {
            type: Object,
            required: true,
            default: { version: "1.0" },
        },
        owner: {
            type: String,
            required: true,
        },
        tags: {
            type: [String],
            required: true,
            default: ["No tags"],
            index: true,
        },
        title: {
            type: String,
            required: true,
            unique: true,
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
