import { Document, model, Schema } from "mongoose";

export interface IEntryMapModel extends Document {
    from: string;
    to: string;
    admin: boolean;
}

export const EntryMapSchema = new Schema(
    {
        from: {
            type: String,
            required: true,
        },
        to: {
            type: String,
            required: true,
        },
        admin: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
);

export const EntryMap = model<IEntryMapModel>("EntryMap", EntryMapSchema);
