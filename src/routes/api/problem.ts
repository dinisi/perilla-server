import { Request, Response, Router } from "express";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest, IProblemRequest } from "../../definitions/requests";
import { Problem } from "../../schemas/problem";
import { ProblemAccess } from "../../schemas/problemAccess";

export let ProblemRouter = Router();

ProblemRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.commonAccess.createProblem) { throw new ServerError("Access denied", 403); }
        const problem = new Problem();
        problem.title = req.body.title;
        problem.content = req.body.content;
        problem.data = req.body.data;
        problem.owner = req.userID;
        await problem.save();
        res.send(problem._id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.get("/list", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const problems = await Problem.find().select("_id title tags owner created").exec();
        res.send(problems);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.use("/:id", async (req: IProblemRequest, res: Response, next) => {
    try {
        const problemID = req.params.id;
        const access = await ProblemAccess.findOne({ roleID: req.roleID, problemID });
        if (!access) { throw new ServerError("Not found", 404); }
        req.problemID = problemID;
        req.access = access.config;
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.get("/:id", async (req: IProblemRequest, res: Response) => {
    try {
        if (!req.access.read) { throw new ServerError("No access", 403); }
        const problem = await Problem.findOne({ _id: req.problemID });
        res.send(problem);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.get("/:id/access", async (req: IProblemRequest, res: Response) => {
    try {
        res.send(req.access);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.post("/:id", async (req: IProblemRequest, res: Response) => {
    try {
        const problem = await Problem.findOne({ _id: req.problemID });
        if (req.access.modifyContent) {
            problem.title = req.body.title;
            problem.content = req.body.content;
        }
        if (req.access.modifyData) {
            problem.data = req.body.data;
            problem.meta = req.body.meta;
        }
        if (req.access.modifyTag) {
            problem.tags = req.body.tags;
        }
        await problem.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemRouter.delete("/:id", async (req: IProblemRequest, res: Response) => {
    try {
        if (!req.access.remove) { throw new ServerError("No access", 403); }
        const problem = await Problem.findOne({ _id: req.problemID });
        await problem.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
