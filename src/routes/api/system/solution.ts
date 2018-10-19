import { Router } from "express";
import { Solution } from "../../../schemas/solution";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const SystemSolutionRouter = Router();

SystemSolutionRouter.get("/count", RESTWarp(async (req, res) => {
    const query = Solution.find();
    return res.RESTSend(await query.countDocuments());
}));

SystemSolutionRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Solution.find();
    query = query.select("id problem status score created owner creator public");
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

SystemSolutionRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.entry, id: req.query.id });
    if (!solution) { throw new Error("Not found"); }
    return res.RESTSend(solution);
}));

SystemSolutionRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.entry, id: req.query.id });
    if (!solution) { throw new Error("Not found"); }
    if (!req.admin && req.user !== solution.creator) { throw new Error("Access denied"); }
    await solution.remove();
    return res.RESTEnd();
}));
