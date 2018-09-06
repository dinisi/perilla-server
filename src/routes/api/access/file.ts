import { Router } from "express";
import { ServerError } from "../../../definitions/errors";
import { IFileAccessRequest } from "../../../definitions/requests";
import { BFile } from "../../../schemas/file";
import { FileAccess } from "../../../schemas/fileAccess";
import { Role } from "../../../schemas/role";
import { validPaginate } from "../../common";

export let FileAccessRouter = Router();

FileAccessRouter.post("/new", async (req, res) => {
    try {
        if (await FileAccess.findOne({ roleID: req.body.roleID, fileID: req.body.fileID })) { throw new ServerError("Already exists", 403); }
        if (!await Role.findById(req.body.roleID)) { throw new ServerError("Not found", 404); }
        if (!await BFile.findById(req.body.fileID)) { throw new ServerError("Not found", 404); }

        const fileAccess = new FileAccess();
        fileAccess.roleID = req.body.roleID;
        fileAccess.fileID = req.body.fileID;
        fileAccess.MContent = req.body.MContent;
        fileAccess.DRemove = req.body.DRemove;
        await fileAccess.save();
        res.send(fileAccess._id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileAccessRouter.get("/list", validPaginate, async (req, res) => {
    try {
        let query = FileAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.fileID) { query = query.where("fileID").equals(req.body.fileID); }

        const fileAccesses = await query.skip(req.query.skip).limit(req.query.limit).exec();
        res.send(fileAccesses);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileAccessRouter.use("/:id", async (req: IFileAccessRequest, res, next) => {
    try {
        req.fileAccess = await FileAccess.findById(req.params.id);
        if (!req.fileAccess) { throw new ServerError("Not found", 404); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileAccessRouter.get("/:id", async (req: IFileAccessRequest, res) => {
    try {
        res.send(req.fileAccess);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileAccessRouter.post("/:id", async (req: IFileAccessRequest, res) => {
    try {
        if (req.fileAccess._protected) { throw new ServerError("Object is protected", 403); }
        req.fileAccess.MContent = req.body.MContent;
        req.fileAccess.DRemove = req.body.DRemove;
        await req.fileAccess.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileAccessRouter.delete("/:id", async (req: IFileAccessRequest, res) => {
    try {
        if (req.fileAccess._protected) { throw new ServerError("Object is protected", 403); }
        await req.fileAccess.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
