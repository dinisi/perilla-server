import { Document, Model, model, Schema } from "mongoose";

export interface IProblemAccessConfig {
    read: boolean;
    modifyContent: boolean;
    modifyData: boolean;
    modifyTag: boolean;
    remove: boolean;
    submit: boolean;
}

export interface IProblemAccessModel extends Document {
    roleID: string;
    problemID: string;
    config: IProblemAccessConfig;
    _protected: boolean;
}

export let ProblemAccessSchema = new Schema(
    {
        _protected: { type: Boolean, required: true, default: false },
        config: { type: Object, required: true, default: { read: false, modifyContent: false, modifyData: false, modifyTag: false, remove: false, submit: false } },
        problemID: { type: String, required: true },
        roleID: { type: String, required: true },
    },
);

export const ProblemAccess: Model<IProblemAccessModel> = model<IProblemAccessModel>("ProblemAccess", ProblemAccessSchema);
