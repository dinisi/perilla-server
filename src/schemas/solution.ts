import { Document, Model, model, Schema } from "mongoose";
import { addJudgeTask } from "../redis";
import { validateUser } from "../utils";
import { SolutionCounter } from "./counter";
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
    public: boolean;
    judge(): Promise<void>;
}

export let SolutionSchema: Schema = new Schema(
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
        public: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
);

SolutionSchema.methods.judge = async function() {
    const self = this as ISolutionModel;
    const channel = (await Problem.findById(self.problem).select("channel")).channel;
    if (!channel) { return; }
    self.status = SolutionResult.WaitingJudge;
    await self.save();
    await addJudgeTask("" + self._id, channel);
};

SolutionSchema.pre("save", async function(next) {
    const self = this as ISolutionModel;
    if (!self.created) {
        self.created = new Date();
        const counter = await SolutionCounter.findByIdAndUpdate(self.owner, { $inc: { count: 1 } }, { upsert: true, new: true });
        self.id = counter.count;
    }
    next();
});

export const Solution: Model<ISolutionModel> = model<ISolutionModel>("Solution", SolutionSchema);
