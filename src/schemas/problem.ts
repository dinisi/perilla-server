import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { ProblemAccess } from "./problemAccess";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    data: any;
    tags: string[];
    owner: string;
    created?: Date;
    meta?: any;
}

export let ProblemSchema: Schema = new Schema(
    {
        content: { type: String, required: true, default: "No content" },
        created: Date,
        data: { type: Object, required: true, default: {} },
        meta: Object,
        owner: { type: String, required: true },
        tags: { type: [String], required: true, default: ["No tags"], index: true },
        title: { type: String, required: true, unique: true },
    },
);

ProblemSchema.pre("save", async function(next) {
    if ((this as IProblemModel).created) {
        (this as IProblemModel).created = new Date();
        const adminAccess = new ProblemAccess();
        adminAccess.roleID = config.defaultAdminRoleID;
        adminAccess.problemID = this._id;
        adminAccess.config = { read: true, modifyContent: true, modifyData: true, modifyTag: true, remove: true, submit: true };
        adminAccess._protected = true;
        await adminAccess.save();

        const judgerAccess = new ProblemAccess();
        judgerAccess.roleID = config.defaultJudgerRoleID;
        judgerAccess.problemID = this._id;
        judgerAccess.config = { read: false, modifyContent: false, modifyData: false, modifyTag: false, remove: false, submit: false };
        judgerAccess._protected = true;
        await judgerAccess.save();
    }
});

ProblemSchema.pre("remove", async function(next) {
    await ProblemAccess.remove({problemID: this._id}).exec();
    next();
});

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
