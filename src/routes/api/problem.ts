/**
 * solution.ts
 * GET    /
 * POST   /
 * PUT    /
 * DELETE /
 * POST   /submit
 * GET    /list
 */

import { Router } from "express";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { isEntryAdmin, isEntryMember, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const ProblemRouter = Router();

ProblemRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    return res.RESTSend(problem);
}));

ProblemRouter.put("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.data = req.body.data;
    problem.channel = req.body.channel;
    problem.tags = req.body.tags;
    await problem.save();
    return res.RESTEnd();
}));

ProblemRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    await problem.remove();
    return res.RESTEnd();
}));

ProblemRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = new Problem();
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.data = req.body.data;
    problem.channel = req.body.channel;
    problem.tags = req.body.tags;
    problem.owner = req.query.entry;
    problem.creator = req.user;
    await problem.save();
    return res.RESTSend(problem.id);
}));

ProblemRouter.post("/submit", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    const solution = new Solution();
    solution.problem = problem.id;
    solution.creator = req.user;
    solution.data = req.body.data;
    solution.owner = req.query.entry;
    await solution.save();
    await solution.judge();
    return res.RESTSend(solution.id);
}));

ProblemRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => {
    let base = Problem.find({ owner: req.query.entry }).select("id title tags created creator");
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
