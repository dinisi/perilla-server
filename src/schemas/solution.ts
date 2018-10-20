import { Document, Model, model, Schema } from "mongoose";
import { IJudgeTask } from "../interfaces/judgetask";
import { addJudgeTask } from "../redis";
import { validateUser } from "../utils";
import { SolutionCounter } from "./counter";
import { File } from "./file";
import { Problem } from "./problem";

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
    id: number;
    problem: number;
    files: number[];
    status: SolutionResult;
    score: number;
    log?: string;
    created: Date;
    owner: string;
    creator: string;
    public: boolean;
    judge(): Promise<void>;
}

export const SolutionSchema: Schema = new Schema(
    {
        id: {
            type: Number,
            index: true,
        },
        problem: {
            type: Number,
            required: true,
        },
        files: {
            type: [Number],
            required: true,
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
        log: String,
        created: Date,
        owner: {
            type: String,
            required: true,
            validate: validateUser,
        },
        creator: {
            type: String,
            required: true,
            validate: validateUser,
        },
        public: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
);

SolutionSchema.methods.judge = async function() {
    const self = this as ISolutionModel;
    const problem = await Problem.findById(self.problem);
    if (!problem) { throw new Error("Invalid solution"); }
    if (!problem.channel) { throw new Error("Problem do not have a valid data config"); }
    if (problem.owner !== self.owner) { throw new Error("Bad solution"); }
    self.status = SolutionResult.WaitingJudge;
    await self.save();
    const problemFiles = [];
    for (const id of problem.files) {
        problemFiles.push((await File.findOne({ owner: problem.owner, id }))._id);
    }
    const solutionFiles = [];
    for (const id of self.files) {
        solutionFiles.push((await File.findById({ owner: self.owner, id }))._id);
    }
    const task: IJudgeTask = {
        solutionID: "" + self._id,
        problemFiles,
        solutionFiles,
        data: problem.data,
    };
    await addJudgeTask(task, problem.channel);
};

SolutionSchema.pre("save", async function(next) {
    const self = this as ISolutionModel;
    if (!self.created) {
        self.created = new Date();
        const counter = await SolutionCounter.findByIdAndUpdate(self.owner, { $inc: { count: 1 } }, { upsert: true, new: true });
        self.id = counter.count;
        self.status = SolutionResult.WaitingJudge;
    }
    next();
});

export const Solution: Model<ISolutionModel> = model<ISolutionModel>("Solution", SolutionSchema);
