import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { addJudgeTask } from "../redis";

export interface ISolutionModel extends Document {
    owner: string;
    problemID: string;
    files: string[];
    status: string;
    result: object;
    meta: object;
    created: Date;
    allowedRead: string[];
    allowedReadResult: string[];
    allowedRejudge: string[];
    allowedModify: string[];
    judge(): Promise<void>;
}

export let SolutionSchema: Schema = new Schema(
    {
        allowedRead: {
            type: [String],
            required: true,
            default: config.defaults.solution.allowedRead,
        },
        allowedReadResult: {
            type: [String],
            required: true,
            default: config.defaults.solution.allowedReadResult,
        },
        allowedRejudge: {
            type: [String],
            required: true,
            default: config.defaults.solution.allowedRejudge,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.solution.allowedModify,
        },
        created: Date,
        files: {
            type: [String],
            required: true,
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
        problemID: {
            type: String,
            required: true,
        },
        result: {
            type: Object,
            required: true,
            default: { version: "1.0" },
        },
        status: {
            type: String,
            required: true,
            default: "Waiting",
        },
    },
);

SolutionSchema.methods.judge = function() {
    return addJudgeTask(this.id);
};

SolutionSchema.pre("save", function(next) {
    const This = this as ISolutionModel;
    if (!This.created) {
        This.created = new Date();
    }
    next();
});

export const Solution: Model<ISolutionModel> = model<ISolutionModel>("Solution", SolutionSchema);
