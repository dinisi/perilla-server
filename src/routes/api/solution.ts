/**
 * solution.ts
 * GET    / : get solution details
 * POST   / : **rejudge solution**
 * DELETE / : delete solution
 * GET    /list
 */

import { Router } from "express";
import { Solution } from "../../schemas/solution";
import { ensure, isLoggedin, PaginationWrap, RESTWrap, verifyEntryAccess } from "./util";

export const SolutionRouter = Router();

SolutionRouter.get("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(solution, "Not found");
    return res.RESTSend(solution);
}));

SolutionRouter.post("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(solution, "Not found");
    ensure(req.admin || solution.owner === req.user, "Access denied");
    await solution.judge();
    return res.RESTEnd();
}));

SolutionRouter.delete("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(solution, "Not found");
    ensure(req.admin || solution.owner === req.user, "Access denied");
    await solution.remove();
    return res.RESTEnd();
}));

SolutionRouter.get("/list", verifyEntryAccess, PaginationWrap((req) => {
    let base = Solution.find({ owner: req.query.entry }).select("id problem status score created creator");
    if (req.query.problem !== undefined) {
        base = base.where("problem").equals(req.query.problem);
    }
    if (req.query.status !== undefined) {
        base = base.where("status").equals(req.query.status);
    }
    if (req.query.max !== undefined) {
        base = base.where("score").lte(req.query.max);
    }
    if (req.query.min !== undefined) {
        base = base.where("score").gte(req.query.min);
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
