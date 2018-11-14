import { Document, model, Schema } from "mongoose";
import { MessageCounter } from "./counter";

export interface IMessageModel extends Document {
    id: number;
    content: string;
    created: Date;
    owner: string;
    creator: string;
}

export const MessageSchema = new Schema(
    {
        id: Number,
        content: {
            type: String,
            required: true,
        },
        created: Date,
        owner: {
            type: String,
            required: true,
        },
        creator: {
            type: String,
            required: true,
        },
    },
);
MessageSchema.index({ id: 1, owner: 1 }, { unique: true });
MessageSchema.pre("save", async function(next) {
    const self = this as IMessageModel;
    if (!self.created) {
        self.created = new Date();
        const counter = await MessageCounter.findByIdAndUpdate(self.owner, { $inc: { count: 1 } }, { upsert: true, new: true });
        self.id = counter.count;
    }
    next();
});

export const Message = model<IMessageModel>("Message", MessageSchema);
