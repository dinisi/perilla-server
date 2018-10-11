import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../interfaces/requests";
import { Contest } from "../../schemas/contest";
import { Problem } from "../../schemas/problem";
import { validPaginate } from "../common";

export let contestRouter = Router();

contestRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.createContest) { throw new Error("Access denied"); }
        const contest = new Contest();

        contest.owner = req.client.userID;
        contest.title = req.body.title;
        contest.description = req.body.description;
        contest.start = new Date(req.body.start);
        contest.problems = [];
        for (const problemID of req.body.problems) {
            const problem = await Problem
                .findById(problemID)
                .where("allowedRead")
                .in(req.client.roles)
                .where("allowedSubmit")
                .in(req.client.roles);
            if (problem) {
                contest.problems.push(problem.id);
            }
        }
        contest.resultCalcType = req.body.resultCalcType;
        contest.phrases = req.body.phrases;
        await contest.save();
        res.send({ status: "failed", payload: contest._id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/count", async (req: IAuthorizedRequest, res) => {
    try {
        let query = Contest.find().where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Contest.find().where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const contests = await query.select("_id title created owner start").exec();
        res.send({ status: "success", payload: contests });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id).where("allowedRead").in(req.client.roles);
        if (!contest) { throw new Error("Not found"); }
        res.send({ status: "success", payload: contest });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id/summary", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id).where("allowedRead").in(req.client.roles).select("title").exec();
        if (!contest) { throw new Error("Not found"); }
        res.send({ status: "success", payload: contest });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.post("/:id", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!contest) { throw new Error("Not found"); }
        contest.title = req.body.title;
        contest.description = req.body.description;
        contest.start = new Date(req.body.start);
        contest.problems = [];
        for (const problemID of req.body.problems) {
            const problem = await Problem
                .findById(problemID)
                .where("allowedRead")
                .in(req.client.roles)
                .where("allowedSubmit")
                .in(req.client.roles);
            if (problem) {
                contest.problems.push(problem.id);
            }
        }
        contest.resultCalcType = req.body.resultCalcType;
        contest.phrases = req.body.phrases;
        if (req.client.config.manageSystem) {
            contest.allowedModify = req.body.allowedModify;
            contest.allowedRead = req.body.allowedRead;
        }
        await contest.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.delete("/:id", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!contest) { throw new Error("Not found"); }
        await contest.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id/problem/:pid", async (req: IAuthorizedRequest, res) => {
    //
});

contestRouter.post("/:id/problem/:pid/submit", async (req: IAuthorizedRequest, res) => {
    //
});

contestRouter.get("/:id/solution/:sid", async (req: IAuthorizedRequest, res) => {
    //
});

contestRouter.get("/:id/ranklist", async (req: IAuthorizedRequest, res) => {
    //
});
