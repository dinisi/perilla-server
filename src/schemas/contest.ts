import { Document, model, Model, Schema } from "mongoose";
import { ContestResultCalcType, IContestPhrase } from "../interfaces/contest";
import { validateMany, validateOne } from "../utils";
import { Player } from "./player";
import { Problem } from "./problem";
import { Role } from "./role";
import { ISolutionModel, SolutionResult } from "./solution";
import { User } from "./user";

export interface IContestModel extends Document {
    title: string;
    description: string;
    start: Date;
    created: Date;
    problemIDs: string[];
    resultCalcType: ContestResultCalcType;
    phrases: IContestPhrase[];
    ownerID: string;
    groupID: string;
    permission: number;
    getPhrase(): IContestPhrase;
    updatePlayer(solution: ISolutionModel): Promise<void>;
}

export let ContestSchema = new Schema(
    {
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
            validate: (v: string[]) => validateMany(Problem, v),
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
        seeRank: true,
        seeResult: "all",
        seeProblem: true,
        seeLog: true,
        submit: false,
    };
};

ContestSchema.methods.updatePlayer = async function(solution: ISolutionModel) {
    if (solution.status === SolutionResult.WaitingJudge || solution.status === SolutionResult.Judging) { return; }
    const self = this as IContestModel;
    let player = await Player.findOne().where("userID").equals(solution.ownerID).where("contestID").equals(self.id);
    if (!player) {
        player = new Player();
        player.userID = solution.ownerID;
        player.contestID = self.id;
    }
    if (!player.details.hasOwnProperty(solution.id)) {
        player.details[solution.id] = {};
    }
    switch (self.resultCalcType) {
        case ContestResultCalcType.ACM:
            if (player.details[solution.id].accepted) {
                // Don't need to update a AKed player
                return;
            } else {
                if (solution.status === SolutionResult.Accepted) {
                    player.details[solution.id].accepted = true;
                    player.score++;
                    // 30 minutes per bad solution
                    player.penalty += (player.details[solution.id].tried || 0) * 1800000;
                    // And Accpeted time, in microseconds
                    const delta = (+(solution.created) - +(self.start));
                    player.penalty += delta;
                } else {
                    player.details[solution.id].tried = (player.details[solution.id].tried || 0) + 1;
                }
            }
            break;
        case ContestResultCalcType.CodeForces:
            // CodeForces ???
            break;
        case ContestResultCalcType.IOI:
            if (player.details[solution.id].accepted) {
                return;
            } else {
                player.score -= (player.details[solution.id].score || 0);
                player.score += (player.details[solution.id].score = solution.score);
            }
            break;
        case ContestResultCalcType.NOI:
            if (player.details[solution.id].submitted) {
                // Ignore resubmissions
                return;
            } else {
                player.score += solution.score;
                player.details[solution.id].score = solution.score;
                player.details[solution.id].submitted = true;
            }
            break;
    }
    await player.save();
};

ContestSchema.pre("save", async function(next) {
    const self = this as IContestModel;
    if (!self.created) {
        self.created = new Date();
    }
    next();
});

export const Contest: Model<IContestModel> = model<IContestModel>("Contest", ContestSchema);
