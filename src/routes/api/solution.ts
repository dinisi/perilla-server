import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { setClient } from "../../redis";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { ensureElement } from "../../utils";
import { validPaginate } from "../common";

export let solutionRouter = Router();

solutionRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.createSolution) { throw new Error("Access denied"); }
        if (req.client.lastVisit - req.client.lastSolutionCreation < req.client.config.minSolutionCreationInterval) {
            throw new Error("Too many solutions");
        }
        const problem = await Problem.findById(req.body.problemID).where("allowedSubmit").in(req.client.roles);
        if (!problem) { throw new Error("Not found"); }
        const solution = new Solution();
        solution.owner = req.client.userID;
        solution.problemID = req.body.problemID;
        solution.files = req.body.files;
        ensureElement(solution.allowedRead, req.client.userID);
        await solution.save();
        await solution.judge();
        req.client.lastSolutionCreation = +new Date();
        await setClient(req.client);
        res.send({ status: "success", payload: solution.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find().where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find().sort("-_id").where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const solutions = await query.select("_id problemID status created owner").exec();
        res.send({ status: "success", payload: solutions });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedRead").in(req.client.roles).select("-result");
        res.send({ status: "success", payload: solution });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/:id/result", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedReadResult").in(req.client.roles).select("result");
        res.send({ status: "success", payload: solution.result });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedModify").in(req.client.roles).select("result");
        if (!solution) { throw new Error("Not found"); }
        solution.result = req.body.result;
        solution.status = req.body.status;
        if (req.client.config.manageSystem) {
            solution.allowedModify = req.body.allowedModify;
            solution.allowedRead = req.body.allowedRead;
            solution.allowedReadResult = req.body.allowedReadResult;
            solution.allowedRejudge = req.body.allowedRejudge;
        }
        await solution.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedModify").in(req.client.roles).select("result");
        if (!solution) { throw new Error("Not found"); }
        await solution.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.post("/:id/rejudge", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedRejudge").in(req.client.roles).select("result");
        if (!solution) { throw new Error("Not found"); }
        await solution.judge();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
