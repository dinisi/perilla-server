/**
 * solution.ts
 * GET    / : get solution details
 * POST   / : **rejudge solution**
 * PUT    / : update solution
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

SolutionRouter.put("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(solution);
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.data = req.body.data;
    solution.details = req.body.details;
    return res.RESTEnd();
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

SolutionRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => Solution.find({ owner: req.query.entry })));
