import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../interfaces/route";
import { setClient } from "../../redis";
import { Contest } from "../../schemas/contest";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { canRead, canWrite, getAccess } from "../../utils";
import { verifyPaginate } from "../common";

export let solutionRouter = Router();

// solution cannot be created independently
// count/list only for none-contest solutions
export const MAGIC_STRING = "none";

solutionRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find().where("contestID").equals(MAGIC_STRING);

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/list", verifyPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find().where("contestID").equals(MAGIC_STRING);

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        query = query.sort("-_id");
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
        const solution = await Solution.findById(req.params.id);
        if (!solution || !canRead(getAccess(solution, req.client))) { throw new Error("Not found"); }

        res.send({ status: "success", payload: solution });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id);
        if (!solution || !canWrite(getAccess(solution, req.client))) { throw new Error("Not found"); }

        solution.status = req.body.status;
        solution.score = req.body.score;
        solution.log = req.body.log;
        if (req.client.config.manageSystem) {
            solution.ownerID = req.body.ownerID;
            solution.groupID = req.body.groupID;
            solution.permission = req.body.permission;
        }
        await solution.save();
        if (solution.contestID !== MAGIC_STRING) {
            const contest = await Contest.findById(solution.contestID);
            await contest.updatePlayer(solution);
        }
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id);
        if (!solution || !canWrite(getAccess(solution, req.client))) { throw new Error("Not found"); }

        await solution.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.post("/:id/rejudge", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id);
        if (!solution || !canWrite(getAccess(solution, req.client))) { throw new Error("Not found"); }

        await solution.judge();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
