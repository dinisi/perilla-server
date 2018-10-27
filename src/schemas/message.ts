import { Document, DocumentQuery, model, Schema } from "mongoose";
import { validateOne, validateUser } from "../utils";
import { MessageCounter } from "./counter";
import { Entry } from "./entry";

export interface IMessageModel extends Document {
    id: number;
    content: string;
    created: Date;
    owner: string;
    creator: string;
}

export const MessageSchema = new Schema(
    {
        id: {
            type: Number,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        created: Date,
        owner: {
            type: String,
            required: true,
            validate: (id: string) => validateOne(Entry, id),
        },
        creator: {
            type: String,
            required: true,
            validate: validateUser,
        },
    },
);

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
