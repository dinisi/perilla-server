import { Router } from "express";
import { Solution } from "../../schemas/solution";
import { extendQuery, PaginationWrap, RESTWrap, verifyAccess, verifyValidation } from "./util";

export const SolutionRouter = Router();

SolutionRouter.get("/", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user);
    return res.RESTSend(solution);
}));

SolutionRouter.post("/", RESTWrap(async (req, res) => {
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

SolutionRouter.post("/update", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user, true);
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    return res.RESTEnd();
}));

SolutionRouter.post("/rejudge", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user, true);
    await solution.judge();
    return res.RESTEnd();
}));

SolutionRouter.delete("/", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    verifyAccess(solution, req.user, true);
    await solution.remove();
    return res.RESTEnd();
}));

SolutionRouter.get("/list", PaginationWrap(() => Solution.find()));
