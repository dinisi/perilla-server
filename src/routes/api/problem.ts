import { Response, Router } from "express";
import { config } from "../../config";
import { IAuthorizedRequest } from "../../interfaces/requests";
import { setClient } from "../../redis";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { canRead, canWrite, getAccess } from "../../utils";
import { verifyPaginate } from "../common";
import { MAGIC_STRING } from "./solution";

export let problemRouter = Router();

problemRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.createProblem) { throw new Error("Access denied"); }
        const problem = new Problem();

        problem.title = req.body.title;
        problem.content = req.body.content;
        problem.fileIDs = req.body.fileIDs;
        problem.data = req.body.data;
        problem.tags = req.body.tags;
        problem.channel = req.body.channel;

        // Problem writers should be allowed to
        // read, modify and submit to the problem
        problem.ownerID = req.client.userID;
        problem.groupID = config.system.wheel;
        problem.permission = 56; // rwr---
        await problem.save();
        res.send({ status: "success", payload: problem.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Problem.find();

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }
        if (req.query.tags) { query = query.where("tags").all(req.query.tags); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/list", verifyPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Problem.find();

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }
        if (req.query.tags) { query = query.where("tags").all(req.query.tags); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const problems = await query.select("_id title tags created ownerID").exec();
        res.send({ status: "success", payload: problems });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem || !canRead(getAccess(problem, req.client))) { throw new Error("Not found"); }

        res.send({ status: "success", payload: problem });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem || !canRead(getAccess(problem, req.client))) { throw new Error("Not found"); }

        res.send({ status: "success", payload: { title: problem.title } });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/:id/data", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem || !canRead(getAccess(problem, req.client))) { throw new Error("Not found"); }

        res.send({ status: "success", payload: { fileIDs: problem.fileIDs, data: problem.data } });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem || !canWrite(getAccess(problem, req.client))) { throw new Error("Not found"); }

        problem.title = req.body.title;
        problem.content = req.body.content;
        problem.fileIDs = req.body.fileIDs;
        problem.data = req.body.data;
        problem.tags = req.body.tags;
        problem.channel = req.body.channel;
        if (req.client.config.manageSystem) {
            problem.ownerID = req.body.ownerID;
            problem.groupID = req.body.groupID;
            problem.permission = req.body.permission;
        }
        await problem.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem || !canWrite(getAccess(problem, req.client))) { throw new Error("Not found"); }

        await problem.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.post("/:id/submit", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem || !canRead(getAccess(problem, req.client))) { throw new Error("Not found"); }

        if (!req.client.config.createSolution) { throw new Error("Access denied"); }
        if (req.client.lastVisit - req.client.lastSolutionCreation < req.client.config.minSolutionCreationInterval) {
            throw new Error("Too many solutions");
        }
        const solution = new Solution();
        solution.problemID = req.body.problemID;
        solution.fileIDs = req.body.fileIDs;
        // Use magic string
        solution.contestID = MAGIC_STRING;
        // We allow user see their results by default
        solution.ownerID = req.client.userID;
        solution.groupID = config.system.wheel;
        solution.permission = 40; // r-r---
        await solution.save();
        await solution.judge();
        req.client.lastSolutionCreation = +new Date();
        await setClient(req.client);
        res.send({ status: "success", payload: solution.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
