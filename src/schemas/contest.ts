import { Document, model, Model, Schema } from "mongoose";
import { config } from "../config";
import { validateACE, validateProblem } from "../utils";

export enum ContestResultCalcType {
    CodeForces,
    IOI,
    NOI,
    ACM,
}

export interface IContestPhrase {
    name: string;
    duration: number;                  // Phrase duration, in seconds
    allowSeeRank: boolean;             // Wheather allow contest players see their rank
    allowSeeResult: boolean;           // Wheather allow contest players see their personal result
    allowSeeProblem: boolean;          // Wheather allow contest players see contest problem
    allowSubmit: boolean;              // Wheather allow contest players submit on problems
}

export interface IContestModel extends Document {
    owner: string;
    title: string;
    description: string;
    start: Date;
    created: Date;
    problems: string[];
    resultCalcType: ContestResultCalcType;
    phrases: IContestPhrase[];
    allowedRead: string[];
    allowedModify: string[];
    getPhrase(): IContestPhrase;
}

export let ContestSchema = new Schema(
    {
        owner: {
            type: String,
            required: true,
        },
        created: Date,
        contestname: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        start: {
            type: Date,
            required: true,
        },
        problem: {
            type: [String],
            required: true,
            validate: validateProblem,
        },
        resultCalcType: {
            type: Number,
            required: true,
            min: 0,
            max: 3,
        },
        phrases: {
            type: [Object],
            required: true,
            default: [],
        },
        allowedRead: {
            type: [String],
            required: true,
            default: config.defaults.contest.allowedRead,
            validate: validateACE,
            index: true,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.contest.allowedModify,
            validate: validateACE,
            index: true,
        },
    },
);

ContestSchema.methods.getPhrase = function(): IContestPhrase {
    const self = this as IContestModel;
    const now = +new Date();
    for (let i = 0, time = +self.start; i < self.phrases.length; i++) {
        time += self.phrases[i].duration;
        if (time >= now) { return self.phrases[i]; }
    }
    return {
        name: "Finished",
        duration: -1,
        allowSeeRank: true,
        allowSeeResult: true,
        allowSeeProblem: true,
        allowSubmit: false,
    };
};

ContestSchema.pre("save", async function(next) {
    const self = this as IContestModel;
    if (!self.created) {
        self.created = new Date();
    }
    next();
});

export const Contest: Model<IContestModel> = model<IContestModel>("Contest", ContestSchema);
