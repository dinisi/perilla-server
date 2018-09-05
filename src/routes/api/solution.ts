import { Response, Router } from "express";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest, ISolutionRequest } from "../../definitions/requests";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { SolutionAccess } from "../../schemas/solutionAccess";

export let SolutionRouter = Router();

SolutionRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!(Problem.countDocuments({ _id: req.body.problemID }))) { throw new ServerError("Not found", 404); }
        const solution = new Solution();
        solution.owner = req.userID;
        solution.problemID = req.body.problemID;
        solution.files = req.body.files;
        await solution.save();
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

SolutionRouter.get("/list", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const solutions = await Solution.find().select("_id owner problemID created").exec();
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
        if (!req.access.RStatus) { select += " -status"; }
        if (!req.access.RResult) { select += " -result"; }
        const solution = await Solution.findOne({ _id: req.solutionID }).select(select).exec();
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
        const solution = await Solution.findOne({ _id: req.solutionID });
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
        const solution = await Solution.findOne({ _id: req.solutionID });
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
        const solution = await Solution.findOne({ _id: req.solutionID });
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
