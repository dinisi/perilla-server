import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../interfaces/requests";
import { Problem } from "../../schemas/problem";
import { ensureElement } from "../../utils";
import { validPaginate } from "../common";

export let problemRouter = Router();

problemRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.createProblem) { throw new Error("Access denied"); }
        const problem = new Problem();

        problem.title = req.body.title;
        problem.content = req.body.content;
        problem.files = req.body.files;
        problem.data = req.body.data;
        problem.meta = req.body.meta;
        problem.tags = req.body.tags;

        problem.owner = req.client.userID;
        ensureElement(problem.allowedRead, req.client.userID);
        ensureElement(problem.allowedSubmit, req.client.userID);
        ensureElement(problem.allowedModify, req.client.userID);
        await problem.save();
        res.send({ status: "success", payload: problem.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Problem.find().where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }
        if (req.query.tags) { query = query.where("tags").all(req.query.tags); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Problem.find().where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }
        if (req.query.tags) { query = query.where("tags").all(req.query.tags); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const problems = await query.select("_id title tags created owner").exec();
        res.send({ status: "success", payload: problems });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id).where("allowedRead").in(req.client.roles);
        if (!problem) { throw new Error("Not found"); }
        res.send({ status: "success", payload: problem });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id).where("allowedRead").in(req.client.roles).select("title").exec();
        if (!problem) { throw new Error("Not found"); }
        res.send({ status: "success", payload: problem });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!problem) { throw new Error("Not found"); }
        problem.title = req.body.title;
        problem.content = req.body.content;
        problem.files = req.body.files;
        problem.data = req.body.data;
        problem.meta = req.body.meta;
        problem.tags = req.body.tags;
        if (req.client.config.manageSystem) {
            problem.allowedModify = req.body.allowedModify;
            problem.allowedRead = req.body.allowedRead;
            problem.allowedSubmit = req.body.allowedSubmit;
        }
        await problem.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

problemRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problem = await Problem.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!problem) { throw new Error("Not found"); }
        await problem.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
