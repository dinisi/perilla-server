import { Router } from "express";
import { IFileAccessRequest } from "../../../definitions/requests";
import { BFile } from "../../../schemas/file";
import { FileAccess } from "../../../schemas/fileAccess";
import { Role } from "../../../schemas/role";
import { validPaginate } from "../../common";

export let FileAccessRouter = Router();

FileAccessRouter.post("/new", async (req, res) => {
    try {
        if (await FileAccess.findOne({ roleID: req.body.roleID, fileID: req.body.fileID })) { throw new Error("Already exists"); }
        if (!await Role.findById(req.body.roleID)) { throw new Error("Not found"); }
        if (!await BFile.findById(req.body.fileID)) { throw new Error("Not found"); }

        const fileAccess = new FileAccess();
        fileAccess.roleID = req.body.roleID;
        fileAccess.fileID = req.body.fileID;
        fileAccess.MContent = req.body.MContent;
        fileAccess.DRemove = req.body.DRemove;
        await fileAccess.save();
        res.send({ status: "success", payload: fileAccess._id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

FileAccessRouter.get("/count", async (req, res) => {
    try {
        let query = FileAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.fileID) { query = query.where("fileID").equals(req.body.fileID); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

FileAccessRouter.get("/list", validPaginate, async (req, res) => {
    try {
        let query = FileAccess.find();

        if (req.body.roleID) { query = query.where("roleID").equals(req.body.roleID); }
        if (req.body.fileID) { query = query.where("fileID").equals(req.body.fileID); }

        const fileAccesses = await query.skip(req.query.skip).limit(req.query.limit).exec();
        res.send({ status: "success", payload: fileAccesses });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

FileAccessRouter.use("/:id", async (req: IFileAccessRequest, res, next) => {
    try {
        req.fileAccess = await FileAccess.findById(req.params.id);
        if (!req.fileAccess) { throw new Error("Not found"); }
        next();
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

FileAccessRouter.get("/:id", async (req: IFileAccessRequest, res) => {
    try {
        res.send({ status: "success", payload: req.fileAccess });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

FileAccessRouter.post("/:id", async (req: IFileAccessRequest, res) => {
    try {
        if (req.fileAccess._protected) { throw new Error("Object is protected"); }
        req.fileAccess.MContent = req.body.MContent;
        req.fileAccess.DRemove = req.body.DRemove;
        await req.fileAccess.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

FileAccessRouter.delete("/:id", async (req: IFileAccessRequest, res) => {
    try {
        if (req.fileAccess._protected) { throw new Error("Object is protected"); }
        await req.fileAccess.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
