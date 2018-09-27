import { Response, Router } from "express";
import { ensureDirSync, existsSync, move, unlink, writeFile } from "fs-extra";
import * as multer from "multer";
import { IAuthorizedRequest } from "../../definitions/requests";
import { BFile } from "../../schemas/file";
import { getFileSize, MD5 } from "../../utils";
import { ensureElement } from "../../utils";
import { validPaginate } from "../common";

ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

export let fileRouter = Router();

fileRouter.post("/upload", upload.array("files", 128), async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.createFile) { throw new Error("Access denied"); }
        const result = [];
        for (const file of req.files as Express.Multer.File[]) {
            const bfile = new BFile();
            const md5 = await MD5(file.path);
            bfile.size = file.size;
            bfile.hash = md5;
            bfile.owner = req.client.userID;
            bfile.filename = file.originalname;
            bfile.description = file.originalname;
            ensureElement(bfile.allowedRead, req.client.userID);
            await move(file.path, bfile.getPath());
            await bfile.save();
            result.push(bfile.id);
        }
        res.send({ status: "success", payload: result });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/create", async (req: IAuthorizedRequest, res) => {
    try {
        if (!req.client.config.createFile) { throw new Error("Access denied"); }
        const bfile = new BFile();
        await writeFile(bfile.getPath(), req.body.content);
        bfile.size = await getFileSize(bfile.getPath());
        bfile.hash = await MD5(bfile.getPath());
        bfile.owner = req.client.userID;
        bfile.filename = req.body.filename || "untitled";
        bfile.description = req.body.description;
        ensureElement(bfile.allowedRead, req.client.userID);
        await bfile.save();
        res.send({ status: "success", payload: bfile.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = BFile.find().where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("filename").regex(new RegExp(req.query.search)); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });

    }
});

fileRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = BFile.find().sort("-_id").where("allowedRead").in(req.client.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("filename").regex(new RegExp(req.query.search)); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const files = await query.select("_id filename created owner").exec();
        res.send({ status: "success", payload: files });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id/raw", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        res.download(file.getPath());
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedModify").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        await unlink(file.getPath());
        await file.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.client.roles);
        if (!file) { throw new Error("Not found"); }
        res.send({ status: "success", payload: file });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.client.roles).select("filename").exec();
        if (!file) { throw new Error("Not found"); }
        res.send({ status: "success", payload: file });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.client.roles);
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
