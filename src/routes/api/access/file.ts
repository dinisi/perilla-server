import { Router } from "express";
import { ServerError } from "../../../definitions/errors";
import { BFile } from "../../../schemas/file";
import { FileAccess } from "../../../schemas/fileAccess";
import { Role } from "../../../schemas/role";

export let FileAccessRouter = Router();

FileAccessRouter.use("/:id", async (req, res, next) => {
    try {
        if (!(await BFile.countDocuments({ _id: req.params.id }))) { throw new ServerError("Not found", 404); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileAccessRouter.get("/:id", async (req, res) => {
    try {
        const accesses = await FileAccess.find({ fileID: req.params.id }).select("-_id config roleID").exec();
        res.send(accesses);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileAccessRouter.use("/:id/:role", async (req, res, next) => {
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

FileAccessRouter.get("/:id/:role", async (req, res) => {
    try {
        const access = await FileAccess.findOne({ fileID: req.params.id, roleID: req.params.role });
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

FileAccessRouter.post("/:id/:role", async (req, res) => {
    try {
        let access = await FileAccess.findOne({ fileID: req.params.id, roleID: req.params.role });
        if (access && access._protected) { throw new ServerError("Object is protected", 403); }
        if (!access) {
            access = new FileAccess();
            access.roleID = req.params.role;
            access.fileID = req.params.id;
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

FileAccessRouter.delete("/:id/:role", async (req, res) => {
    try {
        const access = await FileAccess.findOne({ fileID: req.params.id, roleID: req.params.role });
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
