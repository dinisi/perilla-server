import { Router } from "express";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { PaginationWrap, RESTWrap, verifyAccess, verifyValidation } from "./util";

export const ProblemRouter = Router();

ProblemRouter.get("/", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(problem, req.user);
    return res.RESTSend(problem);
}));

ProblemRouter.post("/", RESTWrap(async (req, res) => {
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

ProblemRouter.delete("/", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(problem, req.user, true);
    await problem.remove();
    return res.RESTEnd();
}));

ProblemRouter.post("/new", RESTWrap(async (req, res) => {
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

ProblemRouter.post("/submit", RESTWrap(async (req, res) => {
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

ProblemRouter.get("/list", PaginationWrap(() => Problem.find()));
