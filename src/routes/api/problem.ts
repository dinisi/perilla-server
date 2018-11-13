import { Router } from "express";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { isEntryAdmin, isEntryMember, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const ProblemRouter = Router();

ProblemRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    return res.RESTSend(problem);
}));

ProblemRouter.put("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.files = req.body.files;
    problem.data = req.body.data;
    problem.channel = req.body.channel;
    problem.tags = req.body.tags;
    await problem.save();
    return res.RESTEnd();
}));

ProblemRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    await problem.remove();
    return res.RESTEnd();
}));

ProblemRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const problem = new Problem();
    problem.title = req.body.title;
    problem.content = req.body.content;
    problem.files = req.body.files;
    problem.data = req.body.data;
    problem.channel = req.body.channel;
    problem.tags = req.body.tags;
    problem.owner = req.query.entry;
    problem.creator = req.user;
    await problem.save();
    return res.RESTSend(problem.id);
}));

ProblemRouter.post("/submit", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const problem = await Problem.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(problem);
    const solution = new Solution();
    solution.problem = problem.id;
    solution.files = req.body.files;
    solution.creator = req.user;
    solution.owner = req.query.entry;
    await solution.save();
    await solution.judge();
    return res.RESTSend(solution.id);
}));

ProblemRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => Problem.find({ owner: req.query.entry })));
