import { Response, Router } from "express";
import { config } from "../../config";
import { IAuthorizedRequest } from "../../interfaces/requests";
import { setClient } from "../../redis";
import { Contest } from "../../schemas/contest";
import { Problem } from "../../schemas/problem";
import { Solution } from "../../schemas/solution";
import { canRead, canWrite, getAccess } from "../../utils";
import { validPaginate } from "../common";

export let contestRouter = Router();

contestRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.createContest) { throw new Error("Access denied"); }
        const contest = new Contest();

        contest.ownerID = req.client.userID;
        contest.title = req.body.title;
        contest.description = req.body.description;
        contest.start = new Date(req.body.start);
        contest.problemIDs = [];
        for (const problemID of req.body.problemIDs) {
            const problem = await Problem.findById(problemID);
            if (canRead(getAccess(problem, req.client))) {
                contest.problemIDs.push(problem.id);
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
        let query = Contest.find();

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Contest.find();

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.search) { query = query.where("title").regex(new RegExp(req.query.search)); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        let contests = await query.select("_id title created ownerID start").exec();
        contests = contests.filter((_) => canRead(getAccess(_, req.client)));
        res.send({ status: "success", payload: contests });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }
        res.send({ status: "success", payload: contest });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id/summary", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }
        res.send({ status: "success", payload: { title: contest.title } });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.post("/:id", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canWrite(getAccess(contest, req.client))) { throw new Error("Not found"); }
        contest.title = req.body.title;
        contest.description = req.body.description;
        contest.start = new Date(req.body.start);
        contest.problemIDs = [];
        for (const problemID of req.body.problemIDs) {
            const problem = await Problem.findById(problemID);
            if (canRead(getAccess(problem, req.client))) {
                contest.problemIDs.push(problem.id);
            }
        }
        contest.resultCalcType = req.body.resultCalcType;
        contest.phrases = req.body.phrases;
        if (req.client.config.manageSystem) {
            contest.ownerID = req.body.ownerID;
            contest.groupID = req.body.groupID;
        }
        await contest.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.delete("/:id", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canWrite(getAccess(contest, req.client))) { throw new Error("Not found"); }
        await contest.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id/problem/:pid", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }

        const phrase = contest.getPhrase();
        if (!phrase.allowSeeProblem) { throw new Error("Operation not permitted"); }
        const problem = await Problem.findById(contest.problemIDs[req.params.pid]);
        if (!problem) { throw new Error("Not found"); }
        res.send({ status: "success", payload: problem });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.post("/:id/problem/:pid/submit", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }

        const phrase = contest.getPhrase();
        if (!phrase.allowSubmit) { throw new Error("Operation not permitted"); }
        const problem = await Problem.findById(contest.problemIDs[req.params.pid]);
        if (!problem) { throw new Error("Not found"); }

        if (!req.client.config.createSolution) { throw new Error("Access denied"); }
        if (req.client.lastVisit - req.client.lastSolutionCreation < req.client.config.minSolutionCreationInterval) {
            throw new Error("Too many solutions");
        }
        const solution = new Solution();
        solution.ownerID = req.client.userID;
        solution.groupID = config.system.wheel;
        solution.permission = 0;
        solution.problemID = problem.id;
        solution.contestID = contest.id;
        solution.fileIDs = req.body.fileIDs;
        await solution.save();
        await solution.judge();
        req.client.lastSolutionCreation = +new Date();
        await setClient(req.client);
        res.send({ status: "success", payload: solution.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id/solution/count", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }

        const phrase = contest.getPhrase();
        if (!phrase.allowSeeResult) { throw new Error("Operation not permitted"); }

        let query = Solution.find().where("contestID").equals(contest.id);

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.problemID) { query = query.where("problemID").equals(req.query.problemID); }
        if (req.query.status) { query = query.where("status").equals(req.query.status); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id/solution/list", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }

        const phrase = contest.getPhrase();
        if (!phrase.allowSeeResult) { throw new Error("Operation not permitted"); }

        let query = Solution.find().where("contestID").equals(contest.id);

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

contestRouter.get("/:id/solution/:sid", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }

        const phrase = contest.getPhrase();
        if (!phrase.allowSeeResult) { throw new Error("Operation not permitted"); }

        // Must specifiy a contestID to prevent toxic user stell his solution result XD
        const solution = await Solution.findById(req.params.sid).where("contestID").equals(contest.id);
        res.send({ status: "success", payload: solution });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

contestRouter.get("/:id/ranklist", async (req: IAuthorizedRequest, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest || !canRead(getAccess(contest, req.client))) { throw new Error("Not found"); }

        const phrase = contest.getPhrase();
        if (!phrase.allowSeeRank) { throw new Error("Operation not permitted"); }
        //
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
