import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { ensureElement, verifyAccess } from "../../utils";
import { validPaginate } from "../common";

export let solutionRouter = Router();

solutionRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!await verifyAccess(req.user, "createSolution")) { throw new Error("Access denied"); }
        const problem = await Problem.findById(req.body.problemID).where("allowedSubmit").in(req.user.roles);
        if (!problem) { throw new Error("Not found"); }
        const solution = new Solution();
        solution.owner = req.user.id;
        solution.problemID = req.body.problemID;
        solution.files = req.body.files;
        ensureElement(solution.allowedRead, req.user.self);
        await solution.save();
        await solution.judge();
        res.send({ status: "success", payload: solution.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find().where("allowedRead").in(req.user.roles);

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
        let query = Solution.find().where("allowedRead").in(req.user.roles);

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
        const solution = await Solution.findById(req.params.id).where("allowedRead").in(req.user.roles).select("-result");
        res.send({ status: "success", payload: solution });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.get("/:id/result", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedReadResult").in(req.user.roles).select("result");
        res.send({ status: "success", payload: solution.result });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedModify").in(req.user.roles).select("result");
        if (!solution) { throw new Error("Not found"); }
        solution.result = req.body.result;
        solution.status = req.body.status;
        if (await verifyAccess(req.user, "manageSystem")) {
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
        const solution = await Solution.findById(req.params.id).where("allowedModify").in(req.user.roles).select("result");
        if (!solution) { throw new Error("Not found"); }
        await solution.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

solutionRouter.post("/:id/rejudge", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solution = await Solution.findById(req.params.id).where("allowedRejudge").in(req.user.roles).select("result");
        if (!solution) { throw new Error("Not found"); }
        await solution.judge();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
