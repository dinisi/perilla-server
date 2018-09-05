import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";

export interface ISolutionAccessModel extends Document {
    roleID: string;
    solutionID: string;
    RStatus: boolean;
    RResult: boolean;
    MContent: boolean;
    DRejudge: boolean;
    DRemove: boolean;
    _protected: boolean;
}

export let SolutionAccessSchema = new Schema(
    {
        DRejudge: { type: Boolean, required: true, default: false },
        DRemove: { type: Boolean, required: true, default: false },
        MContent: { type: Boolean, required: true, default: false },
        RResult: { type: Boolean, required: true, default: false },
        RStatus: { type: Boolean, required: true, default: false },
        _protected: { type: Boolean, required: true, default: false },
        roleID: { type: String, required: true },
        solutionID: { type: String, required: true },
    },
);

export const SolutionAccess: Model<ISolutionAccessModel> = model<ISolutionAccessModel>("SolutionAccess", SolutionAccessSchema);
