import { Router } from "express";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { extendQuery, PaginationGuard, RESTWarp, verifyAccess, verifyValidation } from "./util";

export const ProblemRouter = Router();

ProblemRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(problem, req.user);
    return res.RESTSend(problem);
}));

ProblemRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(problem, req.user, true);
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

ProblemRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(problem, req.user, true);
    await problem.remove();
    return res.RESTEnd();
}));

ProblemRouter.post("/new", RESTWarp(async (req, res) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    verifyValidation(req.validationErrors());

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

ProblemRouter.post("/submit", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(problem, req.user, true);
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

ProblemRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Problem.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

ProblemRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Problem.find().where("owner").equals(req.query.entry);
    query = query.select("id title tags created owner creator public");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
