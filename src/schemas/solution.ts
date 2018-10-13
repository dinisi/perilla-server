import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { addJudgeTask } from "../redis";
import { validateOne, validateMany } from "../utils";
import { Problem } from "./problem";
import { User } from "./user";
import { Role } from "./role";
import { File } from "./file";

export enum SolutionResult {
    WaitingJudge,            // Wating Judge
    Judging,                 // Judging
    Skipped,                 // Skipped
    Accepted,                // Accepted
    WrongAnswer,             // Wrong Answer
    TimeLimitExceeded,       // Time Limit Exceeded
    MemoryLimitExceeded,     // Memory Limit Exceeded
    RuntimeError,            // Runtime Error
    CompileError,            // Compile Error
    PresentationError,       // Presentation Error
    JudgementFailed,         // Judgement Failed (Judge program error)
    SystemError,             // System Error     (Judge framwork & Judge plugin error)
    OtherError,              // Other Error
}

export interface ISolutionModel extends Document {
    problemID: string;
    fileIDs: string[];
    status: SolutionResult;
    score: number;
    log?: string;
    contestID: string;
    created: Date;
    ownerID: string;
    groupID: string;
    permission: number;
    judge(): Promise<void>;
}

export let SolutionSchema: Schema = new Schema(
    {
        problemID: {
            type: String,
            required: true,
            validate: (v: string) => validateOne(Problem, v),
        },
        fileIDs: {
            type: [String],
            required: true,
            validate: (v: string[]) => validateMany(File, v),
        },
        status: {
            type: Number,
            required: true,
            default: SolutionResult.WaitingJudge,
            min: 0,
            max: 12,
        },
        score: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 100,
        },
        // Readonly - auto generated by system
        contestID: {
            type: String,
            required: true,
        },
        log: String,
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

SolutionSchema.methods.judge = async function () {
    const self = this as ISolutionModel;
    const channel = (await Problem.findById(self.problemID).select("channel")).channel;
    if (!channel) { return; }
    self.status = SolutionResult.WaitingJudge;
    await self.save();
    await addJudgeTask(self.id, channel);
};

SolutionSchema.pre("save", function (next) {
    const This = this as ISolutionModel;
    if (!This.created) {
        This.created = new Date();
    }
    next();
});

export const Solution: Model<ISolutionModel> = model<ISolutionModel>("Solution", SolutionSchema);
