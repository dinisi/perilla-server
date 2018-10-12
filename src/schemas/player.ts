import { Document, Model, model, Schema } from "mongoose";

// This model is fully system-generated
// So, no validator will be used

export interface IPlayerModel extends Document {
    contestID: string;
    userID: string;
    score: number;
    penalty: number;
    details: { [key: string]: any };
}

export let PlayerSchema = new Schema({
    userID: {
        type: String,
        required: true,
    },
    contestID: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
        default: 0,
    },
    penalty: {
        type: Number,
        required: true,
        default: 0,
    },
    details: {
        type: Object,
        required: true,
        default: {},
    },
});
PlayerSchema.index({ score: -1, penalty: 1 });

export const Player = model<IPlayerModel>("Player", PlayerSchema);
