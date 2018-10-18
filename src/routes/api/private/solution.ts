import { Router } from "express";
import { Solution } from "../../../schemas/solution";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateSolutionRouter = Router();

privateSolutionRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.entry, id: req.query.id });
    if (!solution) { throw new Error("Not found"); }
    return res.RESTSend(solution);
}));

privateSolutionRouter.delete("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const solution = await Solution.findOne({ owner: req.entry, id: req.query.id });
    if (!solution) { throw new Error("Not found"); }
    await solution.remove();
    return res.RESTEnd();
}));

privateSolutionRouter.get("/count", RESTWarp(async (req, res) => {
    const query = Solution.find().where("owner").equals(req.entry);
    return res.RESTSend(await query.countDocuments());
}));

privateSolutionRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = Solution.find().where("owner").equals(req.entry);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));