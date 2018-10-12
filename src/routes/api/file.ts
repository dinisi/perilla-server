import { Response, Router } from "express";
import { ensureDirSync, existsSync, writeFile } from "fs-extra";
import { lookup } from "mime-types";
import * as multer from "multer";
import * as tmp from "tmp";
import { IAuthorizedRequest } from "../../interfaces/requests";
import { File } from "../../schemas/file";
import { validPaginate } from "../common";

ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

export let fileRouter = Router();

fileRouter.post("/upload", upload.single("file"), async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.createFile) { throw new Error("Access denied"); }
        const file = new File();
        await file.setFile(req.file.path);
        file.ownerID = req.client.userID;
        file.filename = req.file.originalname;
        file.description = req.file.originalname;
        // File uploaders should be allowed to read their files
        file.allowedModify.push(req.client.userID);
        await file.save();
        res.send({ status: "success", payload: file.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/create", async (req: IAuthorizedRequest, res) => {
    try {
        if (!req.client.config.createFile) { throw new Error("Access denied"); }
        const path = await new Promise<string>((resolve, reject) => {
            tmp.file((err, filepath) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(filepath);
                }
            });
        });
        await writeFile(path, req.body.content);
        const file = new File();
        await file.setFile(path);
        file.ownerID = req.client.userID;
        file.filename = req.body.filename || "untitled";
        file.description = req.body.description;
        // File creators should be allowed to read their files
        file.allowedRead.push(req.client.userID);
        await file.save();
        res.send({ status: "success", payload: file.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = File.find().where("allowedRead").in(req.client.roles);

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.search) { query = query.where("filename").regex(new RegExp(req.query.search)); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });

    }
});

fileRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = File.find().sort("-_id").where("allowedRead").in(req.client.roles);

        if (req.query.ownerID) { query = query.where("ownerID").equals(req.query.ownerID); }
        if (req.query.search) { query = query.where("filename").regex(new RegExp(req.query.search)); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const files = await query.select("_id filename created ownerID").exec();
        res.send({ status: "success", payload: files });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id/raw", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await File.findById(req.params.id).where("allowedRead").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        res.sendFile(file.getPath(), { headers: { "Content-Type": lookup(file.filename) } });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/:id/upload", upload.single("file"), async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await File.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        await file.setFile(req.file.path);
        await file.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/:id/raw", async (req: IAuthorizedRequest, res) => {
    try {
        const file = await File.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        const path = await new Promise<string>((resolve, reject) => {
            tmp.file((err, filepath) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(filepath);
                }
            });
        });
        await writeFile(path, req.body.content);
        await file.setFile(path);
        await file.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await File.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        await file.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await File.findById(req.params.id).where("allowedRead").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        res.send({ status: "success", payload: file });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await File.findById(req.params.id).where("allowedRead").in(req.client.roles).select("filename").exec();
        if (!file) { throw new Error("Not found"); }
        res.send({ status: "success", payload: file });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await File.findById(req.params.id).where("allowedRead").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        file.description = req.body.description;
        file.filename = req.body.filename;
        if (req.client.config.manageSystem) {
            file.allowedModify = req.body.allowedModify;
            file.allowedRead = req.body.allowedRead;
        }
        await file.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
