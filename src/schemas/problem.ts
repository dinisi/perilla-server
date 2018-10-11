import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { Solution } from "./solution";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    files: string[];
    data?: object;
    meta?: object;
    channel?: string;
    tags: string[];
    owner: string;
    created: Date;
    allowedRead: string[];
    allowedModify: string[];
    allowedSubmit: string[];
}

export let ProblemSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        content: {
            type: String,
            required: true,
            default: "No content",
        },
        owner: {
            type: String,
            required: true,
        },
        created: Date,
        files: {
            type: [String],
            required: true,
        },
        channel: String,
        data: Object,
        meta: Object,
        tags: {
            type: [String],
            required: true,
            default: ["No tags"],
            index: true,
        },
        allowedRead: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedRead,
            index: true,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedModify,
            index: true,
        },
        allowedSubmit: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedSubmit,
            index: true,
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
