import { Document, Model, model, Schema } from "mongoose";
import { validateMany } from "../utils";
import { File } from "./file";
import { Solution } from "./solution";

export interface IProblemModel extends Document {
    title: string;
    content: string;
    files: string[];
    data?: object;
    channel?: string;
    tags: string[];
    created: Date;
    group: string;
    public: boolean;
}

export let ProblemSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
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
            validate: (v: string[]) => validateMany(File, v),
        },
        data: Object,
        channel: String,
        tags: {
            type: [String],
            required: true,
            default: ["No tags"],
            index: true,
        },
        created: Date,
        group: {
            type: String,
            required: true,
        },
        public: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
);

ProblemSchema.pre("save", async function(next) {
    const This = this as IProblemModel;
    if (!This.created) {
        This.created = new Date();
    }
    next();
});

ProblemSchema.pre("remove", async function(next) {
    await Solution.remove({ problemID: this.id });
    next();
});

export const Problem: Model<IProblemModel> = model<IProblemModel>("Problem", ProblemSchema);
