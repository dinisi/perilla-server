import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { validateACES, validateFiles } from "../utils";
import { Solution } from "./solution";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    fileIDs: string[];
    data?: object;
    channel?: string;
    tags: string[];
    ownerID: string;
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
        ownerID: {
            type: String,
            required: true,
        },
        created: Date,
        fileIDs: {
            type: [String],
            required: true,
            validate: validateFiles,
        },
        data: Object,
        channel: String,
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
            validate: validateACES,
            index: true,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedModify,
            validate: validateACES,
            index: true,
        },
        allowedSubmit: {
            type: [String],
            required: true,
            default: config.defaults.problem.allowedSubmit,
            validate: validateACES,
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
