import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../interfaces/requests";
import { setClient } from "../../redis";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { validPaginate } from "../common";

export let solutionRouter = Router();

// solution cannot be created independently
// count/list only for none-contest solutions
export const MAGIC_STRING = "none";

solutionRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find().where("allowedRead").in(req.client.roles).where("contestID").equals(MAGIC_STRING);

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find().sort("-_id").where("allowedRead").in(req.client.roles).where("contestID").equals(MAGIC_STRING);

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const solutions = await query.select("_id problemID status created ownerID").exec();
        res.send({ status: "success", payload: solutions });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

// Contest submissions do not have ACE in allowedRead except for defaults
// Do not need to specify ownerID
solutionRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedRead").in(req.client.roles).select("-result");
        res.send({ status: "success", payload: solution });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedModify").in(req.client.roles).select("result");
        if (!solution) { throw new Error("Not found"); }
        solution.status = req.body.status;
        solution.score = req.body.score;
        solution.log = req.body.log;
        if (req.client.config.manageSystem) {
            solution.allowedModify = req.body.allowedModify;
            solution.allowedRead = req.body.allowedRead;
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
