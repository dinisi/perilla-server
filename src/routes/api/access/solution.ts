import { Router } from "express";
import { ServerError } from "../../../definitions/errors";
import { ISolutionAccessRequest } from "../../../definitions/requests";
import { Role } from "../../../schemas/role";
import { Solution } from "../../../schemas/solution";
import { SolutionAccess } from "../../../schemas/solutionAccess";
import { validPaginate } from "../../common";

export let SolutionAccessRouter = Router();

SolutionAccessRouter.post("/new", async (req, res) => {
    try {
        if (await SolutionAccess.findOne({ roleID: req.body.roleID, solutionID: req.body.solutionID })) { throw new ServerError("Already exists", 403); }
        if (!await Role.findById(req.body.roleID)) { throw new ServerError("Not found", 404); }
        if (!await Solution.findById(req.body.solutionID)) { throw new ServerError("Not found", 404); }

        const solutionAccess = new SolutionAccess();
        solutionAccess.roleID = req.body.roleID;
        solutionAccess.solutionID = req.body.solutionID;
        solutionAccess.RResult = req.body.RResult;
        solutionAccess.MContent = req.body.MContent;
        solutionAccess.DRejudge = req.body.DRejudge;
        solutionAccess.DRemove = req.body.DRemove;

        await solutionAccess.save();
        res.send(solutionAccess._id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.get("/list", validPaginate, async (req, res) => {
    try {
        let query = SolutionAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.solutionID) { query = query.where("solutionID").equals(req.body.solutionID); }

        const solutionAccesses = await query.skip(req.query.skip).limit(req.query.limit).exec();
        res.send(solutionAccesses);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.use("/:id", async (req: ISolutionAccessRequest, res, next) => {
    try {
        req.solutionAccess = await SolutionAccess.findById(req.params.id);
        if (!req.solutionAccess) { throw new ServerError("Not found", 404); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.get("/:id", async (req: ISolutionAccessRequest, res) => {
    try {
        res.send(req.solutionAccess);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.post("/:id", async (req: ISolutionAccessRequest, res) => {
    try {
        if (req.solutionAccess._protected) { throw new ServerError("Object is protected", 403); }
        req.solutionAccess.RResult = req.body.RResult;
        req.solutionAccess.MContent = req.body.MContent;
        req.solutionAccess.DRejudge = req.body.DRejudge;
        req.solutionAccess.DRemove = req.body.DRemove;
        await req.solutionAccess.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.delete("/:id", async (req: ISolutionAccessRequest, res) => {
    try {
        if (req.solutionAccess._protected) { throw new ServerError("Object is protected", 403); }
        await req.solutionAccess.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
