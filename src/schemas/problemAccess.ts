import { Document, Model, model, Schema } from "mongoose";

export interface IProblemAccessModel extends Document {
    roleID: string;
    problemID: string;
    MContent: boolean;
    MData: boolean;
    MTag: boolean;
    DRemove: boolean;
    DSubmit: boolean;
    _protected: boolean;
}

export let ProblemAccessSchema = new Schema(
    {
        DRemove: { type: Boolean, required: true, default: false },
        DSubmit: { type: Boolean, required: true, default: false },
        MContent: { type: Boolean, required: true, default: false },
        MData: { type: Boolean, required: true, default: false },
        MTag: { type: Boolean, required: true, default: false },
        _protected: { type: Boolean, required: true, default: false },
        problemID: { type: String, required: true },
        roleID: { type: String, required: true },
    },
);

export const ProblemAccess: Model<IProblemAccessModel> = model<IProblemAccessModel>("ProblemAccess", ProblemAccessSchema);
