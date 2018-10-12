import { Document, Model, model, Schema } from "mongoose";

// This model is fully system-generated
// So, no validator will be used

export interface IPlayerModel extends Document {
    contestID: string;
    userID: string;
    score: number;
    details: object;
}

export let PlayerSchema = new Schema({
    userID: {
        type: String,
        required: true,
        index: true,
    },
    contestID: {
        type: String,
        required: true,
        index: true,
    },
    score: {
        type: Number,
        required: true,
        default: 0,
        index: true,
    },
    details: {
        type: Object,
        required: true,
        default: {},
    },
});

export const Player = model<IPlayerModel>("Player", PlayerSchema);
