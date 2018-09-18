import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { ensureElement } from "../utils";
import { Solution } from "./solution";

export interface IProblemModel extends Document {
    title: string;
    content: string;
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
            default: [config.defaultAdminRoleID, config.defaultJudgerRoleID],
        },
        allowedModify: {
            type: [String],
            required: true,
            default: [config.defaultAdminRoleID],
        },
        allowedSubmit: {
            type: [String],
            required: true,
            default: [config.defaultAdminRoleID],
        },
        content: {
            type: String,
            required: true,
            default: "No content",
        },
        created: Date,
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
    if (!(this as IProblemModel).created) {
        (this as IProblemModel).created = new Date();
    }
    ensureElement((this as IProblemModel).allowedRead, config.defaultAdminRoleID);
    ensureElement((this as IProblemModel).allowedRead, config.defaultJudgerRoleID);
    ensureElement((this as IProblemModel).allowedModify, config.defaultAdminRoleID);
    ensureElement((this as IProblemModel).allowedSubmit, config.defaultAdminRoleID);
    next();
});

ProblemSchema.pre("remove", async function(next) {
    await Solution.remove({ problemID: this.id });
    next();
});

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
