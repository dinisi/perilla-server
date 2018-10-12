import { Document, model, Model, Schema } from "mongoose";
import { config } from "../config";
import { ContestResultCalcType, IContestPhrase } from "../interfaces/contest";
import { validateACES, validateProblems, validateUser } from "../utils";

export interface IContestModel extends Document {
    ownerID: string;
    title: string;
    description: string;
    start: Date;
    created: Date;
    problemIDs: string[];
    resultCalcType: ContestResultCalcType;
    phrases: IContestPhrase[];
    allowedRead: string[];
    allowedModify: string[];
    getPhrase(): IContestPhrase;
}

export let ContestSchema = new Schema(
    {
        ownerID: {
            type: String,
            required: true,
            validate: validateUser,
        },
        title: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 50,
        },
        description: {
            type: String,
            required: true,
            default: "No description",
            minlength: 1,
            maxlength: 200,
        },
        start: {
            type: Date,
            required: true,
        },
        problemIDs: {
            type: [String],
            required: true,
            validate: validateProblems,
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
            validate: (v: object[]) => {
                for (const p of v) {
                    if (!IContestPhrase.validate(p).success) { return false; }
                }
                return true;
            },
        },
        created: Date,
        allowedRead: {
            type: [String],
            required: true,
            default: config.defaults.contest.allowedRead,
            validate: validateACES,
            index: true,
        },
        allowedModify: {
            type: [String],
            required: true,
            default: config.defaults.contest.allowedModify,
            validate: validateACES,
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
