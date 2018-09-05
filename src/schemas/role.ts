import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config";
import { FileAccess } from "./fileAccess";
import { ProblemAccess } from "./problemAccess";
import { SolutionAccess } from "./solutionAccess";
import { User } from "./user";

export interface IRoleModel extends Document {
    rolename: string;
    description: string;
    MUser: boolean;
    MRole: boolean;
    CProblem: boolean;
    CFile: boolean;
    MAccess: boolean;
    _protected: boolean;
}

export let RoleSchema: Schema = new Schema(
    {
        CFile: { type: Boolean, required: true, default: false },
        CProblem: { type: Boolean, required: true, default: false },
        MAccess: { type: Boolean, required: true, default: false },
        MRole: { type: Boolean, required: true, default: false },
        MUser: { type: Boolean, required: true, default: false },
        _protected: { type: Boolean, required: true, default: false },
        description: { type: String, required: true, default: "" },
        rolename: { type: String, unique: true, required: true },
    },
);

RoleSchema.pre("remove", async function(next) {
    if ((this as IRoleModel)._protected) { return; }
    const id: string = this._id.toString();
    const badUsers = await User.find({ roles: [id] });
    for (const badUser of badUsers) {
        const index = badUser.roles.indexOf(id.toString());
        badUser.roles.splice(index, 1);
        await badUser.save();
    }
    await FileAccess.remove({ roleID: id });
    await ProblemAccess.remove({ roleID: id });
    await SolutionAccess.remove({ roleID: id });
    next();
});

export const Role: Model<IRoleModel> = model<IRoleModel>("Role", RoleSchema);
