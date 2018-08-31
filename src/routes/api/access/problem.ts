import { Router } from "express";
import { ServerError } from "../../../definitions/errors";
import { Problem } from "../../../schemas/problem";
import { ProblemAccess } from "../../../schemas/problemAccess";
import { Role } from "../../../schemas/role";

export let ProblemAccessRouter = Router();

ProblemAccessRouter.use("/:id", async (req, res, next) => {
    try {
        if (!(await Problem.countDocuments({ _id: req.params.id }))) { throw new ServerError("Not found", 404); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemAccessRouter.get("/:id", async (req, res) => {
    try {
        const accesses = await ProblemAccess.find({ problemID: req.params.id }).select("-_id config roleID").exec();
        res.send(accesses);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

ProblemAccessRouter.use("/:id/:role", async (req, res, next) => {
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

ProblemAccessRouter.get("/:id/:role", async (req, res) => {
    try {
        const access = await ProblemAccess.findOne({ problemID: req.params.id, roleID: req.params.role });
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

ProblemAccessRouter.post("/:id/:role", async (req, res) => {
    try {
        let access = await ProblemAccess.findOne({ problemID: req.params.id, roleID: req.params.role });
        if (access && access._protected) { throw new ServerError("Object is protected", 403); }
        if (!access) {
            access = new ProblemAccess();
            access.roleID = req.params.role;
            access.problemID = req.params.id;
        }
        access.config = req.body.config;
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

ProblemAccessRouter.delete("/:id/:role", async (req, res) => {
    try {
        const access = await ProblemAccess.findOne({ problemID: req.params.id, roleID: req.params.role });
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
