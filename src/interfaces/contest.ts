import { Boolean, Number, Record, Static, String } from "runtypes";

export enum ContestResultCalcType {
    CodeForces,
    IOI,
    NOI,
    ACM,
}

export const IContestPhrase = Record({
    name: String,
    duration: Number,                  // Phrase duration, in seconds
    allowSeeRank: Boolean,             // Wheather allow contest players see their rank
    allowSeeResult: Boolean,           // Wheather allow contest players see their personal result
    allowSeeProblem: Boolean,          // Wheather allow contest players see contest problem
    allowSubmit: Boolean,              // Wheather allow contest players submit on problems
});

export interface IContestPhrase extends Static<typeof IContestPhrase> {
    [key: string]: boolean | number | string;
}
