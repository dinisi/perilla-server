import { Document, Model, model, Schema } from "mongoose";
import { validateMany, validateOne, validateUser } from "../utils";
import { ProblemCounter } from "./counter";
import { Entry } from "./entry";
import { File } from "./file";
import { Solution } from "./solution";

export interface IProblemModel extends Document {
    id: number;
    title: string;
    content: string;
    files: string[];
    data?: object;
    channel?: string;
    tags: string[];
    created: Date;
    owner: string;
    creator: string;
    public: boolean;
}

export let ProblemSchema: Schema = new Schema(
    {
        id: {
            type: Number,
            index: true,
        },
        title: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 50,
        },
        content: {
            type: String,
            required: true,
            default: "No content",
            minlength: 1,
            maxlength: 40960,
        },
        files: {
            type: [String],
            required: true,
        },
        data: Object,
        channel: String,
        tags: {
            type: [String],
            required: true,
            default: ["No tags"],
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
        public: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
);

ProblemSchema.pre("save", async function(next) {
    const self = this as IProblemModel;
    if (!self.created) {
        self.created = new Date();
        const counter = await ProblemCounter.findByIdAndUpdate(self.owner, { $inc: { count: 1 } }, { upsert: true, new: true });
        self.id = counter.count;
    }
    next();
});

ProblemSchema.pre("remove", async function(next) {
    await Solution.remove({ problemID: this.id });
    next();
});

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
