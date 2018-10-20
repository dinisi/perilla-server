import { Router } from "express";
import { Problem } from "../../../schemas/problem";
import { privateProblemRouter } from "../private/problem";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const systemProblemRouter = Router();

systemProblemRouter.get("/count", RESTWarp(async (req, res) => {
    const query = Problem.find();
    return res.RESTSend(await query.countDocuments());
}));

systemProblemRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Problem.find();
    query = query.select("id title content tags created owner creator public");
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

privateProblemRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findById(req.query.id);
    if (!problem) { throw new Error("Not found"); }
    return res.RESTSend(problem);
}));

privateProblemRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findById(req.query.id);
    if (!problem) { throw new Error("Not found"); }
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.files = req.body.files;
    problem.data = req.body.data;
    problem.channel = req.body.channel;
    problem.tags = req.body.tags;
    problem.public = req.body.public;
    await problem.save();
    return res.RESTEnd();
}));

systemProblemRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findById(req.query.id);
    if (!problem) { throw new Error("Not found"); }
    await problem.remove();
    return res.RESTEnd();
}));
