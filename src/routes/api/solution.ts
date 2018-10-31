import { Router } from "express";
import { Solution } from "../../schemas/solution";
import { isEntryAdmin, isEntryMember, isLoggedin, isSystemAdmin, notNullOrUndefined, PaginationWrap, RESTWrap, verifyValidation } from "./util";

export const SolutionRouter = Router();

SolutionRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    return res.RESTSend(solution);
}));

SolutionRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    solution.files = req.body.files;
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    solution.public = req.body.public;
    return res.RESTEnd();
}));

SolutionRouter.post("/update", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    solution.status = req.body.status;
    solution.score = req.body.score;
    solution.log = req.body.log;
    return res.RESTEnd();
}));

SolutionRouter.post("/rejudge", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    await solution.judge();
    return res.RESTEnd();
}));

SolutionRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const solution = await Solution.findById(req.query.id);
    notNullOrUndefined(solution);
    await solution.remove();
    return res.RESTEnd();
}));

SolutionRouter.get("/list.private", isLoggedin, isEntryMember, PaginationWrap(() => Solution.find()));
SolutionRouter.get("/list.public", PaginationWrap(() => Solution.find()));
SolutionRouter.get("/list.all", isLoggedin, isSystemAdmin, PaginationWrap(() => Solution.find()));
