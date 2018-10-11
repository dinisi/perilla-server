import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { addJudgeTask } from "../redis";
import { Problem } from "./problem";

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
            index: true,
        },
        allowedReadResult: {
            type: [String],
            required: true,
            default: config.defaults.solution.allowedReadResult,
            index: true,
        },
        allowedRejudge: {
            type: [String],
            required: true,
            default: config.defaults.solution.allowedRejudge,
            index: true,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.solution.allowedModify,
            index: true,
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

SolutionSchema.methods.judge = async function() {
    const self = this as ISolutionModel;
    const channel = (await Problem.findById(self.problemID).select("channel")).channel;
    if (!channel) { return; }
    return addJudgeTask(self.id, channel);
};

SolutionSchema.pre("save", function(next) {
    const This = this as ISolutionModel;
    if (!This.created) {
        This.created = new Date();
    }
    next();
});

export const Solution: Model<ISolutionModel> = model<ISolutionModel>("Solution", SolutionSchema);
