import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { ProblemAccess } from "./problemAccess";
import { Solution } from "./solution";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    data: object;
    tags: string[];
    owner: string;
    created: Date;
    meta: object;
}

export let ProblemSchema: Schema = new Schema(
    {
        content: { type: String, required: true, default: "No content" },
        created: Date,
        data: { type: Object, required: true, default: {} },
        meta: { type: Object, required: true, default: {} },
        owner: { type: String, required: true },
        tags: { type: [String], required: true, default: ["No tags"], index: true },
        title: { type: String, required: true, unique: true },
    },
);

ProblemSchema.pre("save", async function(next) {
    if (!(this as IProblemModel).created) {
        (this as IProblemModel).created = new Date();
        const adminAccess = new ProblemAccess();
        adminAccess.roleID = config.defaultAdminRoleID;
        adminAccess.problemID = this._id;
        adminAccess.MContent = true;
        adminAccess.MData = true;
        adminAccess.MTag = true;
        adminAccess.DRemove = true;
        adminAccess.DSubmit = true;
        adminAccess._protected = true;
        await adminAccess.save();

        const judgerAccess = new ProblemAccess();
        judgerAccess.roleID = config.defaultJudgerRoleID;
        judgerAccess.problemID = this._id;
        judgerAccess._protected = true;
        await judgerAccess.save();
    }
    next();
});

ProblemSchema.pre("remove", async function(next) {
    await ProblemAccess.remove({ problemID: this._id });
    await Solution.remove({ problemID: this._id });
    next();
});

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
