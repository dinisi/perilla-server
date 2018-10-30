import { Router } from "express";
import { Solution } from "../../schemas/solution";
import { extendQuery, PaginationGuard, RESTWarp, verifyAccess, verifyValidation } from "./util";

export const SolutionRouter = Router();

SolutionRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Solution.find();
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

SolutionRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Solution.find();
    query = query.select("id problem status score created owner creator public");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

SolutionRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user);
    return res.RESTSend(solution);
}));

SolutionRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user, true);
    solution.files = req.body.files;
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    solution.public = req.body.public;
    return res.RESTEnd();
}));

SolutionRouter.post("/update", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user, true);
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    return res.RESTEnd();
}));

SolutionRouter.post("/rejudge", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user, true);
    await solution.judge();
    return res.RESTEnd();
}));

SolutionRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user, true);
    await solution.remove();
    return res.RESTEnd();
}));
