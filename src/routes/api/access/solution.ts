import { Router } from "express";
import { ISolutionAccessRequest } from "../../../definitions/requests";
import { Role } from "../../../schemas/role";
import { Solution } from "../../../schemas/solution";
import { SolutionAccess } from "../../../schemas/solutionAccess";
import { validPaginate } from "../../common";

export let SolutionAccessRouter = Router();

SolutionAccessRouter.post("/new", async (req, res) => {
    try {
        if (await SolutionAccess.findOne({ roleID: req.body.roleID, solutionID: req.body.solutionID })) { throw new Error("Already exists"); }
        if (!await Role.findById(req.body.roleID)) { throw new Error("Not found"); }
        if (!await Solution.findById(req.body.solutionID)) { throw new Error("Not found"); }

        const solutionAccess = new SolutionAccess();
        solutionAccess.roleID = req.body.roleID;
        solutionAccess.solutionID = req.body.solutionID;
        solutionAccess.RResult = req.body.RResult;
        solutionAccess.MContent = req.body.MContent;
        solutionAccess.DRejudge = req.body.DRejudge;
        solutionAccess.DRemove = req.body.DRemove;

        await solutionAccess.save();
        res.send({ status: "success", payload: solutionAccess._id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

SolutionAccessRouter.get("/count", async (req, res) => {
    try {
        let query = SolutionAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.solutionID) { query = query.where("solutionID").equals(req.body.solutionID); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

SolutionAccessRouter.get("/list", validPaginate, async (req, res) => {
    try {
        let query = SolutionAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.solutionID) { query = query.where("solutionID").equals(req.body.solutionID); }

        const solutionAccesses = await query.skip(req.query.skip).limit(req.query.limit).exec();
        res.send({ status: "success", payload: solutionAccesses });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

SolutionAccessRouter.use("/:id", async (req: ISolutionAccessRequest, res, next) => {
    try {
        req.solutionAccess = await SolutionAccess.findById(req.params.id);
        if (!req.solutionAccess) { throw new Error("Not found"); }
        next();
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

SolutionAccessRouter.get("/:id", async (req: ISolutionAccessRequest, res) => {
    try {
        res.send({ status: "success", payload: req.solutionAccess });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

SolutionAccessRouter.post("/:id", async (req: ISolutionAccessRequest, res) => {
    try {
        if (req.solutionAccess._protected) { throw new Error("Object is protected"); }
        req.solutionAccess.RResult = req.body.RResult;
        req.solutionAccess.MContent = req.body.MContent;
        req.solutionAccess.DRejudge = req.body.DRejudge;
        req.solutionAccess.DRemove = req.body.DRemove;
        await req.solutionAccess.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

SolutionAccessRouter.delete("/:id", async (req: ISolutionAccessRequest, res) => {
    try {
        if (req.solutionAccess._protected) { throw new Error("Object is protected"); }
        await req.solutionAccess.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
