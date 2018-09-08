import { Router } from "express";
import { IProblemAccessRequest } from "../../../definitions/requests";
import { Problem } from "../../../schemas/problem";
import { ProblemAccess } from "../../../schemas/problemAccess";
import { Role } from "../../../schemas/role";
import { validPaginate } from "../../common";

export let ProblemAccessRouter = Router();

ProblemAccessRouter.post("/new", async (req, res) => {
    try {
        if (await ProblemAccess.findOne({ roleID: req.body.roleID, problemID: req.body.problemID })) { throw new Error("Already exists"); }
        if (!await Role.findById(req.body.roleID)) { throw new Error("Not found"); }
        if (!await Problem.findById(req.body.problemID)) { throw new Error("Not found"); }

        const problemAccess = new ProblemAccess();
        problemAccess.roleID = req.body.roleID;
        problemAccess.problemID = req.body.problemID;
        problemAccess.MContent = req.body.MContent;
        problemAccess.MData = req.body.MData;
        problemAccess.MTag = req.body.MTag;
        problemAccess.DRemove = req.body.DRemove;
        problemAccess.DSubmit = req.body.DSubmit;
        await problemAccess.save();
        res.send({ status: "success", payload: problemAccess._id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

ProblemAccessRouter.get("/count", async (req, res) => {
    try {
        let query = ProblemAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.problemID) { query = query.where("problemID").equals(req.body.problemID); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

ProblemAccessRouter.get("/list", validPaginate, async (req, res) => {
    try {
        let query = ProblemAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.problemID) { query = query.where("problemID").equals(req.body.problemID); }

        const problemAccesses = await query.skip(req.query.skip).limit(req.query.limit).exec();
        res.send({ status: "success", payload: problemAccesses });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

ProblemAccessRouter.use("/:id", async (req: IProblemAccessRequest, res, next) => {
    try {
        req.problemAccess = await ProblemAccess.findById(req.params.id);
        if (!req.problemAccess) { throw new Error("Not found"); }
        next();
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

ProblemAccessRouter.get("/:id", async (req: IProblemAccessRequest, res) => {
    try {
        res.send({ status: "success", payload: req.problemAccess });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

ProblemAccessRouter.post("/:id", async (req: IProblemAccessRequest, res) => {
    try {
        if (req.problemAccess._protected) { throw new Error("Object is protected"); }
        req.problemAccess.MContent = req.body.MContent;
        req.problemAccess.MData = req.body.MData;
        req.problemAccess.MTag = req.body.MTag;
        req.problemAccess.DRemove = req.body.DRemove;
        req.problemAccess.DSubmit = req.body.DSubmit;
        await req.problemAccess.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

ProblemAccessRouter.delete("/:id", async (req: IProblemAccessRequest, res) => {
    try {
        if (req.problemAccess._protected) { throw new Error("Object is protected"); }
        await req.problemAccess.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
