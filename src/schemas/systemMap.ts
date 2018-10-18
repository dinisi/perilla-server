import { Document, model, Schema } from "mongoose";
import { validateUser } from "../utils";

export interface ISystemMapModel extends Document {
    user: string;
}

export const SystemMapSchema = new Schema(
    {
        user: {
            type: String,
            required: true,
            validate: validateUser,
            unique: true,
        },
    },
);

export const SystemMap = model<ISystemMapModel>("systemmap", SystemMapSchema);
