import { Document, Model, model, Schema } from "mongoose";
import * as access from "./problemAccess";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    data: any;
    tags: string[];
    owner: string;
}

export let ProblemSchema: Schema = new Schema(
    {
        content: String,
        data: Object,
        owner: String,
        tags: [String],
        title: String,
    },
);

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
