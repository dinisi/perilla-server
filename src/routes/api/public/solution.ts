import { Router } from "express";
import { extendQuery } from "../../../interfaces/query";
import { Solution } from "../../../schemas/solution";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const publicSolutionRouter = Router();

publicSolutionRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Solution.find().where("public").equals(true);
    query = extendQuery(query, req.query.condition);
    return res.RESTSend(await query.countDocuments());
}));

publicSolutionRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Solution.find().where("public").equals(true);
    query = query.select("id problem status score created owner creator public");
    query = extendQuery(query, req.query.condition);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

publicSolutionRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    req.checkQuery("entry", "Invalid query: entry").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.query.entry, id: req.query.id });
    if (!solution || !solution.public) { throw new Error("Not found"); }
    return res.RESTSend(solution);
}));
