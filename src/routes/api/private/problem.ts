import { Router } from "express";
import { Problem } from "../../../schemas/problem";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateProblemRouter = Router();

privateProblemRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.entry, id: req.query.id });
    if (!problem) { throw new Error("Not found"); }
    return res.RESTSend(problem);
}));

privateProblemRouter.post("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.entry, id: req.query.id });
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

privateProblemRouter.delete("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.entry, id: req.query.id });
    if (!problem) { throw new Error("Not found"); }
    await problem.remove();
    return res.RESTEnd();
}));

privateProblemRouter.post("/new", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    const problem = new Problem();
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.files = req.body.files;
    problem.data = req.body.data;
    problem.channel = req.body.channel;
    problem.tags = req.body.tags;
    problem.public = req.body.public;
    problem.owner = req.entry;
    await problem.save();
    res.RESTSend(problem.id);
}));

privateProblemRouter.post("/submit", RESTWarp(async (req, res) => {
    // TODO
    // Submit on this problem
    // return res.RESTSend()
}));

privateProblemRouter.get("/count", RESTWarp(async (req, res) => {
    const query = Problem.find().where("owner").equals(req.entry);
    return res.RESTSend(await query.countDocuments());
}));

privateProblemRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = Problem.find().where("owner").equals(req.entry);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
