import { Document, Model, model, Schema } from "mongoose";
import { ArticleCounter } from "./counter";

export interface IArticleModel extends Document {
    id: number;
    title: string;
    content: string;
    tags: string[];
    created: Date;
    owner: string;
    creator: string;
}

export const ArticleSchema: Schema = new Schema(
    {
        id: Number,
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
        tags: {
            type: [String],
            required: true,
            default: ["No tags"],
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
ArticleSchema.index({ id: 1, owner: 1 }, { unique: true });
ArticleSchema.pre("save", async function(next) {
    const self = this as IArticleModel;
    if (!self.created) {
        self.created = new Date();
        const counter = await ArticleCounter.findByIdAndUpdate(self.owner, { $inc: { count: 1 } }, { upsert: true, new: true });
        self.id = counter.count;
    }
    next();
});

export const Article: Model<IArticleModel> = model<IArticleModel>("Article", ArticleSchema);
