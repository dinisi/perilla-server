import { Document, Model, model, Schema } from "mongoose";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    data: any;
    tags: string[];
    owner: string;
    created?: Date;
    meta?: any;
}

export let ProblemSchema: Schema = new Schema(
    {
        content: { type: String, required: true, default: "No content" },
        created: Date,
        data: { type: Object, required: true, default: {} },
        meta: Object,
        owner: { type: String, required: true },
        tags: { type: [String], required: true, default: ["No tags"], index: true },
        title: { type: String, required: true, unique: true },
    },
);

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
