import { Document, Schema, Model, model } from 'mongoose';
import * as access from './problemAccess';
import { verifyResult } from '../interfaces/verifyResult';

export interface ProblemModel extends Document {
    title: string,
    content: string,
    data: any,
    tags: string[],
    owner: string,
    verifyAccess(roleID: string, request: string): Promise<verifyResult>
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
        if (!data) return verifyResult.Deny;
        if (data.config[request]) return verifyResult.Approve;
        return verifyResult.Deny;
    } catch (e) {
        return verifyResult.Deny;
    }
}

export const Problem: Model<ProblemModel> = model<ProblemModel>('Problem', ProblemSchema);