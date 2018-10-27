import { Router } from "express";
import { Solution } from "../../../schemas/solution";
import { extendQuery, normalizeValidatorError, PaginationGuard, RESTWarp } from "../util";

export const privateSolutionRouter = Router();

privateSolutionRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    if (!solution) { throw new Error("Not found"); }
    return res.RESTSend(solution);
}));

privateSolutionRouter.post("/rejudge", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    if (!solution) { throw new Error("Not found"); }
    if (!req.admin && req.user !== solution.creator) { throw new Error("Access denied"); }
    await solution.judge();
    return res.RESTEnd();
}));

privateSolutionRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    if (!solution) { throw new Error("Not found"); }
    if (!req.admin && req.user !== solution.creator) { throw new Error("Access denied"); }
    await solution.remove();
    return res.RESTEnd();
}));

privateSolutionRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Solution.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req.query.control);
    return res.RESTSend(await query.countDocuments());
}));

privateSolutionRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Solution.find().where("owner").equals(req.query.entry);
    query = query.select("id problem status score created owner creator public");
    query = extendQuery(query, req.query.control);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
