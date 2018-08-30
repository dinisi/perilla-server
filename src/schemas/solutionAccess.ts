import { Document, Model, model, Schema } from "mongoose";

export interface ISolutionAccessConfig {
    readStatus: boolean;
    readResult: boolean;
    rejudge: boolean;
    remove: boolean;
}

export interface ISolutionAccessModel extends Document {
    roleID: string;
    solutionID: string;
    config: ISolutionAccessConfig;
    _protected: boolean;
}

export let SolutionAccessSchema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        config: { type: Object, required: true, default: { readStatus: false, readResult: false, rejudge: false, remove: false } },
        roleID: { type: String, required: true },
        solutionID: { type: String, required: true },
    },
);

export const SolutionAccess: Model<ISolutionAccessModel> = model<ISolutionAccessModel>("SolutionAccess", SolutionAccessSchema);
