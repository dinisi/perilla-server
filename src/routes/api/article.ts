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

ArticleRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => Article.find({ owner: req.query.entry })));
