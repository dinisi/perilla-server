/**
 * solution.ts
 * GET    / : get solution details
 * POST   / : **rejudge solution**
 * DELETE / : delete solution
 * GET    /list
 */

import { Router } from "express";
import { Solution } from "../../schemas/solution";
import { isEntryAdmin, isEntryMember, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const SolutionRouter = Router();

SolutionRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(solution);
    return res.RESTSend(solution);
}));

SolutionRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(solution);
    await solution.judge();
    return res.RESTEnd();
}));

SolutionRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(solution);
    await solution.remove();
    return res.RESTEnd();
}));

SolutionRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => {
    let base = Solution.find({ owner: req.query.entry }).select("id problem status score created creator");
    if (req.query.problem) {
        base = base.where("problem").equals(req.query.problem);
    }
    if (req.query.status) {
        base = base.where("status").equals(req.query.status);
    }
    if (req.query.max) {
        base = base.where("score").lte(req.query.max);
    }
    if (req.query.min) {
        base = base.where("score").gte(req.query.min);
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
