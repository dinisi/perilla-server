import { Response, Router } from "express";
import { config } from "../../config";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest, ISolutionRequest } from "../../definitions/requests";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { SolutionAccess } from "../../schemas/solutionAccess";
import { validPaginate } from "../common";

export let SolutionRouter = Router();

SolutionRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!(await Problem.findById(req.body.problemID))) { throw new ServerError("Not found", 404); }
        const solution = new Solution();
        solution.owner = req.userID;
        solution.problemID = req.body.problemID;
        solution.files = req.body.files;
        await solution.save();
        if (req.roleID !== config.defaultAdminRoleID && req.roleID !== config.defaultJudgerRoleID) {
            const defaultAccess = new SolutionAccess();
            defaultAccess.solutionID = solution._id;
            defaultAccess.roleID = req.roleID;
            await defaultAccess.save();
        }
        await solution.judge();
        res.send(solution._id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Solution.find();

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const solutions = await query.select("_id problemID status created owner").exec();
        res.send(solutions);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionRouter.use("/:id", async (req: ISolutionRequest, res: Response, next) => {
    try {
        const solutionID = req.params.id;
        const access = await SolutionAccess.findOne({ roleID: req.roleID, solutionID });
        if (!access) { throw new ServerError("Not found", 404); }
        req.solutionID = solutionID;
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

SolutionRouter.get("/:id", async (req: ISolutionRequest, res: Response) => {
    try {
        let select = "";
        if (!req.access.RResult) { select += " -result"; }
        const solution = await Solution.findById(req.solutionID).select(select).exec();
        res.send(solution);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionRouter.post("/:id", async (req: ISolutionRequest, res: Response) => {
    try {
        if (!req.access.MContent) { throw new ServerError("No access", 403); }
        const solution = await Solution.findById(req.solutionID);
        solution.result = req.body.result;
        solution.status = req.body.status;
        await solution.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionRouter.delete("/:id", async (req: ISolutionRequest, res: Response) => {
    try {
        if (!req.access.DRemove) { throw new ServerError("No access", 403); }
        const solution = await Solution.findById(req.solutionID);
        await solution.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionRouter.post("/:id/rejudge", async (req: ISolutionRequest, res: Response) => {
    try {
        if (!req.access.DRejudge) { throw new ServerError("No access", 403); }
        const solution = await Solution.findById(req.solutionID);
        await solution.judge();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
