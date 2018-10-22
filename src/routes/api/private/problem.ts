import { Router } from "express";
import { extendQuery } from "../../../interfaces/query";
import { Problem } from "../../../schemas/problem";
import { Solution } from "../../../schemas/solution";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateProblemRouter = Router();

privateProblemRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    if (!problem) { throw new Error("Not found"); }
    return res.RESTSend(problem);
}));

privateProblemRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    if (!problem) { throw new Error("Not found"); }
    if (!req.admin && req.user !== problem.creator) { throw new Error("Access denied"); }
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
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    if (!problem) { throw new Error("Not found"); }
    if (!req.admin && req.user !== problem.creator) { throw new Error("Access denied"); }
    await problem.remove();
    return res.RESTEnd();
}));

privateProblemRouter.post("/new", RESTWarp(async (req, res) => {
    const problem = new Problem();
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.files = req.body.files;
    problem.data = req.body.data;
    problem.channel = req.body.channel;
    problem.tags = req.body.tags;
    problem.public = req.body.public;
    problem.owner = req.query.entry;
    problem.creator = req.user;
    await problem.save();
    return res.RESTSend(problem.id);
}));

privateProblemRouter.post("/submit", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    if (!problem) { throw new Error("Not found"); }
    const solution = new Solution();
    solution.problem = problem.id;
    solution.files = req.body.files;
    solution.public = req.body.public;
    solution.creator = req.user;
    solution.owner = req.query.entry;
    await solution.save();
    await solution.judge();
    return res.RESTSend(solution.id);
}));

privateProblemRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Problem.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req.query.condition);
    return res.RESTSend(await query.countDocuments());
}));

privateProblemRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Problem.find().where("owner").equals(req.query.entry);
    query = query.select("id title content tags created owner creator public");
    query = extendQuery(query, req.query.condition);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
