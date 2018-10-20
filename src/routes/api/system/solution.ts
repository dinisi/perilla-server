import { Router } from "express";
import { extendQuery } from "../../../interfaces/query";
import { Solution } from "../../../schemas/solution";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const SystemSolutionRouter = Router();

SystemSolutionRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Solution.find();
    query = extendQuery(query, req.query.condition);
    return res.RESTSend(await query.countDocuments());
}));

SystemSolutionRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Solution.find();
    query = query.select("id problem status score created owner creator public");
    query = extendQuery(query, req.query.condition);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

SystemSolutionRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findById(req.query.id);
    if (!solution) { throw new Error("Not found"); }
    return res.RESTSend(solution);
}));

SystemSolutionRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findById(req.query.id);
    if (!solution) { throw new Error("Not found"); }
    solution.files = req.body.files;
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    solution.public = req.body.public;
    return res.RESTEnd();
}));

SystemSolutionRouter.post("/update", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findById(req.query.id);
    if (!solution) { throw new Error("Not found"); }
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    return res.RESTEnd();
}));

SystemSolutionRouter.post("/rejudge", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findById(req.query.id);
    if (!solution) { throw new Error("Not found"); }
    await solution.judge();
    return res.RESTEnd();
}));

SystemSolutionRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findById(req.query.id);
    if (!solution) { throw new Error("Not found"); }
    if (!req.admin && req.user !== solution.creator) { throw new Error("Access denied"); }
    await solution.remove();
    return res.RESTEnd();
}));
