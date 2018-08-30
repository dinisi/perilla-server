import { Document, Model, model, Schema } from "mongoose";

export interface ISolutionModel extends Document {
    owner: string;
    problemID: string;
    files: string[];
    priority: number;
    status: string;
    result?: any;
    meta?: any;
}

export let SolutionSchema: Schema = new Schema(
    {
        files: { type: [String], required: true },
        meta: Object,
        owner: { type: String, required: true },
        priority: { type: Number, required: true, default: 0 },
        problemID: { type: String, required: true },
        result: Object,
        status: { type: String, required: true, default: "Waiting" },
    },
);
