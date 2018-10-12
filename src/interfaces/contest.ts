import { Boolean, Literal, Number, Record, Static, String, Union } from "runtypes";

export enum ContestResultCalcType {
    CodeForces,
    IOI,
    NOI,
    ACM,
}

export const ContestResultControlType = Union(
    Literal("none"),
    Literal("own"),
    Literal("all"),
);

export type ContestResultControlType = Static<typeof ContestResultControlType>;

export const IContestPhrase = Record({
    name: String,
    duration: Number,                            // Phrase duration, in seconds
    seeRank: Boolean,                            // Wheather allow contest players see their rank
    seeResult: ContestResultControlType,         // Wheather allow contest players see their personal result without judge log
    seeLog: Boolean,                             // Wheather allow contest players see judge log (may contain data)
    seeProblem: Boolean,                         // Wheather allow contest players see contest problem
    submit: Boolean,                             // Wheather allow contest players submit on problems
});

export type IContestPhrase = Static<typeof IContestPhrase>;
