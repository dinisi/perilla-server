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
import { ensure, isLoggedin, PaginationWrap, RESTWrap, verifyEntryAccess } from "./util";

export const ArticleRouter = Router();

ArticleRouter.get("/", isLoggedin, verifyEntryAccess, RESTWrap(async (req, res) => {
    const article = await Article.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(article, "Not found");
    return res.RESTSend(article);
}));

ArticleRouter.put("/", isLoggedin, verifyEntryAccess, RESTWrap(async (req, res) => {
    const article = await Article.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(article, "Not found");
    ensure(req.admin || article.owner === req.user, "Access denied");
    article.title = req.body.title || article.title;
    article.content = req.body.content || article.content;
    article.tags = req.body.tags || article.tags;
    await article.save();
    return res.RESTEnd();
}));

ArticleRouter.delete("/", isLoggedin, verifyEntryAccess, RESTWrap(async (req, res) => {
    const article = await Article.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(article, "Not found");
    ensure(req.admin || article.owner === req.user, "Access denied");
    await article.remove();
    return res.RESTEnd();
}));

ArticleRouter.post("/", isLoggedin, verifyEntryAccess, RESTWrap(async (req, res) => {
    const article = new Article();
    article.title = req.body.title || article.title;
    article.content = req.body.content || article.content;
    article.tags = req.body.tags || article.tags;
    article.owner = req.query.entry;
    article.creator = req.user;
    await article.save();
    return res.RESTSend(article.id);
}));

ArticleRouter.get("/list", isLoggedin, verifyEntryAccess, PaginationWrap((req) => {
    let base = Article.find({ owner: req.query.entry }).select("id title tags created creator");
    if (req.query.tags !== undefined) {
        base = base.where("tags").all(req.query.tags);
    }
    if (req.query.search !== undefined) {
        base = base.where("title").regex(new RegExp(req.query.search.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, "\\$&"), "g"));
    }
    if (req.query.before !== undefined) {
        base = base.where("created").lte(req.query.before);
    }
    if (req.query.after !== undefined) {
        base = base.where("created").gte(req.query.after);
    }
    if (req.query.creator !== undefined) {
        base = base.where("creator").equals(req.query.creator);
    }
    return base;
}));
