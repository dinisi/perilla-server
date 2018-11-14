import { Document, Model, model, Schema } from "mongoose";

export interface ITask extends Document {
    channel: string;
    owner: string;
    problem: object;
    solution: object;
    objectID: string;
}

export const TaskSchema = new Schema({
    channel: {
        type: String,
        required: true,
        index: true,
    },
    owner: {
        type: String,
        required: true,
    },
    problem: Object,
    solution: Object,
    objectID: String,
});

export const Task: Model<ITask> = model<ITask>("Task", TaskSchema);
