import { Document, Schema, Model, model } from 'mongoose';

export interface ProblemAccessModel extends Document {
    roleID: string,
    config: any
};

export let ProblemAccessSchema = new Schema(
    {
        roleID: String,
        config: Object
    }
);

export const ProblemAccess: Model<ProblemAccessModel> = model<ProblemAccessModel>('ProblemAccess', ProblemAccessSchema);