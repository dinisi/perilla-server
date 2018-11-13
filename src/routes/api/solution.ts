/**
 * solution.ts
 * GET    / : get solution details
 * POST   / : **rejudge solution**
 * PUT    / : update solution
 * DELETE / : delete solution
 */

import { Router } from "express";
import { Solution } from "../../schemas/solution";
import { isEntryAdmin, isEntryMember, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const SolutionRouter = Router();

SolutionRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    return res.RESTSend(solution);
}));

SolutionRouter.put("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    solution.files = req.body.files;
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    return res.RESTEnd();
}));

SolutionRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    await solution.judge();
    return res.RESTEnd();
}));

SolutionRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    await solution.remove();
    return res.RESTEnd();
}));

SolutionRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => Solution.find({ owner: req.query.entry })));
