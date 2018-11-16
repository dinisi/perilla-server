/**
 * article.ts
 * GET    /
 * PUT    /
 * DELETE /
 * POST   /
 * GET    /list
 */

import { Router } from "express";
import { Article } from "../../schemas/article";
import { isEntryAdmin, isEntryMember, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const ArticleRouter = Router();

ArticleRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const problem = await Article.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    return res.RESTSend(problem);
}));

ArticleRouter.put("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = await Article.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.tags = req.body.tags;
    await problem.save();
    return res.RESTEnd();
}));

ArticleRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = await Article.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    await problem.remove();
    return res.RESTEnd();
}));

ArticleRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = new Article();
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.tags = req.body.tags;
    problem.owner = req.query.entry;
    problem.creator = req.user;
    await problem.save();
    return res.RESTSend(problem.id);
}));

ArticleRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => {
    let base = Article.find({ owner: req.query.entry }).select("id title tags created creator");
    if (req.query.tags) {
        base = base.where("tags").all(req.query.tags);
    }
    if (req.query.search) {
        base = base.where("title").regex(new RegExp(req.query.search.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, "\\$&"), "g"));
    }
    if (req.query.before) {
        base = base.where("created").lte(req.query.before);
    }
    if (req.query.after) {
        base = base.where("created").gte(req.query.after);
    }
    if (req.query.creator) {
        base = base.where("creator").equals(req.query.creator);
    }
    return base;
}));
