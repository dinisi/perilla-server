import { Router } from "express";
import { ServerError } from "../../../definitions/errors";
import { Role } from "../../../schemas/role";
import { Solution } from "../../../schemas/solution";
import { SolutionAccess } from "../../../schemas/solutionAccess";

export let SolutionAccessRouter = Router();

SolutionAccessRouter.use("/:id", async (req, res, next) => {
    try {
        if (!(await Solution.countDocuments({ _id: req.params.id }))) { throw new ServerError("Not found", 404); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.get("/:id", async (req, res) => {
    try {
        const accesses = await SolutionAccess.find({ solutionID: req.params.id }).select("-_id config roleID").exec();
        res.send(accesses);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.use("/:id/:role", async (req, res, next) => {
    try {
        if (!(await Role.countDocuments({ _id: req.params.role }))) { throw new ServerError("Not found", 404); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.get("/:id/:role", async (req, res) => {
    try {
        const access = await SolutionAccess.findOne({ solutionID: req.params.id, roleID: req.params.role });
        if (!access) { throw new ServerError("Not found", 404); }
        res.send(access);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.post("/:id/:role", async (req, res) => {
    try {
        let access = await SolutionAccess.findOne({ solutionID: req.params.id, roleID: req.params.role });
        if (access && access._protected) { throw new ServerError("Object is protected", 403); }
        if (!access) {
            access = new SolutionAccess();
            access.roleID = req.params.role;
            access.solutionID = req.params.id;
        }
        access.RResult = req.body.RResult;
        access.MContent = req.body.MContent;
        access.DRejudge = req.body.DRejudge;
        access.DRemove = req.body.DRemove;
        await access.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

SolutionAccessRouter.delete("/:id/:role", async (req, res) => {
    try {
        const access = await SolutionAccess.findOne({ solutionID: req.params.id, roleID: req.params.role });
        if (!access) { throw new ServerError("Not found", 404); }
        if (access._protected) { throw new ServerError("Object is protected", 403); }
        await access.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
