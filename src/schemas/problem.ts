import { Document, Schema, Model, model } from 'mongoose';
import * as access from './problemAccess';
import * as vr from '../interfaces/verifyResult';

export interface ProblemModel extends Document {
    title: string,
    content: string,
    data: any,
    tags: string[],
    owner: string,
    verifyAccess(roleID: string, request: string): Promise<vr.verifyResult>
};

export let ProblemSchema: Schema = new Schema(
    {
        title: String,
        content: String,
        data: Object,
        tags: [String],
        owner: String
    }
);

ProblemSchema.methods.verifyAccess = async function (roleID: string, request: string) {
    try {
        let data: access.ProblemAccessModel = await access.ProblemAccess.findOne().where('roleID').equals(roleID).exec();
        if (!data) return vr.verifyResult.Deny;
        if (data.config[request]) return vr.verifyResult.Approve;
        return vr.verifyResult.Deny;
    } catch (e) {
        return vr.verifyResult.Deny;
    }
}

export const Problem: Model<ProblemModel> = model<ProblemModel>('Problem', ProblemSchema);