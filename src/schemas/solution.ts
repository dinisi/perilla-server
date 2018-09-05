import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { addJudgeTask } from "../redis";
import { SolutionAccess } from "./solutionAccess";

export interface ISolutionModel extends Document {
    owner: string;
    problemID: string;
    files: string[];
    status: string;
    result: object;
    meta: object;
    created: Date;
    judge(): Promise<void>;
}

export let SolutionSchema: Schema = new Schema(
    {
        created: Date,
        files: { type: [String], required: true },
        meta: { type: Object, required: true, default: {} },
        owner: { type: String, required: true },
        problemID: { type: String, required: true },
        result: { type: Object, required: true, default: {} },
        status: { type: String, required: true, default: "Waiting" },
    },
);

SolutionSchema.methods.judge = function() {
    return addJudgeTask(this._id.toString());
};

SolutionSchema.pre("save", async function(next) {
    if (!(this as ISolutionModel).created) {
        (this as ISolutionModel).created = new Date();
        const adminAccess = new SolutionAccess();
        adminAccess.roleID = config.defaultAdminRoleID;
        adminAccess.solutionID = this._id;
        adminAccess.RResult = true;
        adminAccess.MContent = true;
        adminAccess.DRejudge = true;
        adminAccess.DRemove = true;
        adminAccess._protected = true;
        await adminAccess.save();

        const judgerAccess = new SolutionAccess();
        judgerAccess.roleID = config.defaultJudgerRoleID;
        judgerAccess.solutionID = this._id;
        judgerAccess.RResult = true;
        judgerAccess.MContent = true;
        judgerAccess._protected = true;
        await judgerAccess.save();
    }
    next();
});

SolutionSchema.pre("remove", async function(next) {
    await SolutionAccess.remove({ solutionID: this._id }).exec();
    next();
});

export const Solution: Model<ISolutionModel> = model<ISolutionModel>("Solution", SolutionSchema);
