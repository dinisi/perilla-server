import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { ISolutionAccessConfig } from "../definitions/access";

export interface ISolutionAccessModel extends Document {
    roleID: string;
    solutionID: string;
    config: ISolutionAccessConfig;
    _protected: boolean;
}

export let SolutionAccessSchema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        config: { type: Object, required: true, default: config.defaultSolutionAccess },
        roleID: { type: String, required: true },
        solutionID: { type: String, required: true },
    },
);

export const SolutionAccess: Model<ISolutionAccessModel> = model<ISolutionAccessModel>("SolutionAccess", SolutionAccessSchema);
