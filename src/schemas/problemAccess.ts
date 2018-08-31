import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { IProblemAccessConfig } from "../definitions/access";

export interface IProblemAccessModel extends Document {
    roleID: string;
    problemID: string;
    config: IProblemAccessConfig;
    _protected: boolean;
}

export let ProblemAccessSchema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        config: { type: Object, required: true, default: config.defaultProblemAccess },
        problemID: { type: String, required: true },
        roleID: { type: String, required: true },
    },
);

export const ProblemAccess: Model<IProblemAccessModel> = model<IProblemAccessModel>("ProblemAccess", ProblemAccessSchema);
