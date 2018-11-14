import { Document, Model, model, Schema } from "mongoose";
import { publishJudgerCommand } from "../redis";
import { validateOne, validateUser } from "../utils";
import { SolutionCounter } from "./counter";
import { Entry } from "./entry";
import { Problem } from "./problem";
import { Task } from "./task";

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
    status: SolutionResult;
    score: number;
    data?: object;
    details?: object;
    hide: boolean;
    created: Date;
    owner: string;
    creator: string;
    judge(): Promise<void>;
}

export const SolutionSchema: Schema = new Schema(
    {
        id: Number,
        problem: {
            type: Number,
            required: true,
        },
        status: {
            type: Number,
            required: true,
            default: SolutionResult.WaitingJudge,
            validate: (x: number) => !!SolutionResult[x],
        },
        score: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 100,
        },
        data: Object,
        details: Object,
        hide: {
            type: Boolean,
            required: true,
            default: false,
        },
        created: Date,
        owner: {
            type: String,
            required: true,
            validate: (id: string) => validateOne(Entry, id),
        },
        creator: {
            type: String,
            required: true,
            validate: validateUser,
        },
    },
);
SolutionSchema.index({ id: 1, owner: 1 }, { unique: true });
SolutionSchema.methods.judge = async function() {
    const self = this as ISolutionModel;
    const problem = await Problem.findById(self.problem);
    if (!problem) { throw new Error("Invalid solution"); }
    if (!problem.channel) { throw new Error("Problem do not have a valid data config"); }
    if (problem.owner !== self.owner) { throw new Error("Bad solution"); }
    self.status = SolutionResult.WaitingJudge;
    await self.save();
    const task = new Task();
    task.channel = problem.channel;
    task.problem = problem.data;
    task.solution = self.data;
    task.objectID = "" + self._id;
    await task.save();
    await publishJudgerCommand("newtask");
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
