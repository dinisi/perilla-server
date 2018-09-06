import { Router } from "express";
import { ServerError } from "../../../definitions/errors";
import { IProblemAccessRequest } from "../../../definitions/requests";
import { Problem } from "../../../schemas/problem";
import { ProblemAccess } from "../../../schemas/problemAccess";
import { Role } from "../../../schemas/role";
import { validPaginate } from "../../common";

export let ProblemAccessRouter = Router();

ProblemAccessRouter.post("/new", async (req, res) => {
    try {
        if (await ProblemAccess.findOne({ roleID: req.body.roleID, problemID: req.body.problemID })) { throw new ServerError("Already exists", 403); }
        if (!await Role.findById(req.body.roleID)) { throw new ServerError("Not found", 404); }
        if (!await Problem.findById(req.body.problemID)) { throw new ServerError("Not found", 404); }

        const problemAccess = new ProblemAccess();
        problemAccess.roleID = req.body.roleID;
        problemAccess.problemID = req.body.problemID;
        problemAccess.MContent = req.body.MContent;
        problemAccess.MData = req.body.MData;
        problemAccess.MTag = req.body.MTag;
        problemAccess.DRemove = req.body.DRemove;
        problemAccess.DSubmit = req.body.DSubmit;
        await problemAccess.save();
        res.send(problemAccess._id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemAccessRouter.get("/list", validPaginate, async (req, res) => {
    try {
        const problemAccesses = await ProblemAccess.find().skip(req.query.skip).limit(req.query.limit);
        res.send(problemAccesses);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemAccessRouter.use("/:id", async (req: IProblemAccessRequest, res, next) => {
    try {
        req.problemAccess = await ProblemAccess.findById(req.params.id);
        if (!req.problemAccess) { throw new ServerError("Not found", 404); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemAccessRouter.get("/:id", async (req: IProblemAccessRequest, res) => {
    try {
        res.send(req.problemAccess);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemAccessRouter.post("/:id", async (req: IProblemAccessRequest, res) => {
    try {
        if (req.problemAccess._protected) { throw new ServerError("Object is protected", 403); }
        req.problemAccess.MContent = req.body.MContent;
        req.problemAccess.MData = req.body.MData;
        req.problemAccess.MTag = req.body.MTag;
        req.problemAccess.DRemove = req.body.DRemove;
        req.problemAccess.DSubmit = req.body.DSubmit;
        await req.problemAccess.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemAccessRouter.delete("/:id", async (req: IProblemAccessRequest, res) => {
    try {
        if (req.problemAccess._protected) { throw new ServerError("Object is protected", 403); }
        await req.problemAccess.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
