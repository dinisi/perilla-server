import { Request, Response, Router } from "express";
import { config } from "../../config";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest, IProblemRequest } from "../../definitions/requests";
import { Problem } from "../../schemas/problem";
import { ProblemAccess } from "../../schemas/problemAccess";
import { validPaginate } from "../common";

export let ProblemRouter = Router();

ProblemRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.CProblem) { throw new ServerError("Access denied", 403); }
        const problem = new Problem();

        problem.title = req.body.title;
        problem.content = req.body.content;
        problem.data = req.body.data;
        problem.meta = req.body.meta;
        problem.tags = req.body.tags;

        problem.owner = req.userID;
        await problem.save();
        if (req.roleID !== config.defaultAdminRoleID && req.roleID !== config.defaultJudgerRoleID) {
            const defaultAccess = new ProblemAccess();
            defaultAccess.problemID = problem._id;
            defaultAccess.roleID = req.roleID;
            defaultAccess.MContent = true;
            defaultAccess.MData = true;
            defaultAccess.MTag = true;
            defaultAccess.DSubmit = true;
            await defaultAccess.save();
        }
        res.send(problem._id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Problem.find();

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }
        if (req.query.tags) { query = query.where("tags").all(req.query.tags); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const problems = await query.select("_id title tags created owner").exec();
        res.send(problems);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.use("/:id", async (req: IProblemRequest, res: Response, next) => {
    try {
        const problemID = req.params.id;
        const access = await ProblemAccess.findOne({ roleID: req.roleID, problemID });
        if (!access) { throw new ServerError("Not found", 404); }
        req.problemID = problemID;
        req.access = access;
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.get("/:id", async (req: IProblemRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.problemID);
        res.send(problem);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.get("/:id/access", async (req: IProblemRequest, res: Response) => {
    try {
        res.send(req.access);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.post("/:id", async (req: IProblemRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.problemID);
        if (req.access.MContent) {
            problem.title = req.body.title;
            problem.content = req.body.content;
        }
        if (req.access.MData) {
            problem.data = req.body.data;
            problem.meta = req.body.meta;
        }
        if (req.access.MTag) {
            problem.tags = req.body.tags;
        }
        await problem.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.delete("/:id", async (req: IProblemRequest, res: Response) => {
    try {
        if (!req.access.DRemove) { throw new ServerError("No access", 403); }
        const problem = await Problem.findById(req.problemID);
        await problem.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
