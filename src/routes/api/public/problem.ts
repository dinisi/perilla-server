import { Router } from "express";
import { Problem } from "../../../schemas/problem";
import { extendQuery, normalizeValidatorError, PaginationGuard, RESTWarp } from "../util";

export const publicProblemRouter = Router();

publicProblemRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Problem.find().where("public").equals(true);
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

publicProblemRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Problem.find().where("public").equals(true);
    query = query.select("id title tags created owner creator public");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

publicProblemRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    req.checkQuery("entry", "Invalid query: entry").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    if (!problem || !problem.public) { throw new Error("Not found"); }
    return res.RESTSend(problem);
}));
