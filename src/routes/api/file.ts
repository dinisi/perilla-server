import { Response, Router } from "express";
import { ensureDirSync, existsSync, move, unlink } from "fs-extra";
import * as multer from "multer";
import { IAuthorizedRequest } from "../../definitions/requests";
import { MD5 } from "../../md5";
import { BFile } from "../../schemas/file";
import { ensureElement, verifyAccess } from "../../utils";
import { validPaginate } from "../common";

ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

export let fileRouter = Router();

fileRouter.post("/upload", upload.array("files", 128), async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!await verifyAccess(req.user, "createFile")) { throw new Error("Access denied"); }
        const result = [];
        for (const file of req.files as Express.Multer.File[]) {
            const bfile = new BFile();
            const md5 = await MD5(file.path);
            bfile.size = file.size;
            bfile.hash = md5;
            bfile.owner = req.user.id;
            bfile.filename = file.originalname;
            bfile.description = file.originalname;
            ensureElement(bfile.allowedRead, req.user.self);
            await move(file.path, bfile.getPath());
            await bfile.save();
            result.push(bfile.id);
        }
        res.send({ status: "success", payload: result });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = BFile.find().where("allowedRead").in(req.user.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("description").regex(new RegExp(req.query.search)); }
        if (req.query.type) { query = query.where("type").equals(req.query.type); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });

    }
});

fileRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = BFile.find().where("allowedRead").in(req.user.roles);

        if (req.query.owner) { query = query.where("owner").equals(req.query.owner); }
        if (req.query.search) { query = query.where("description").regex(new RegExp(req.query.search)); }
        if (req.query.type) { query = query.where("type").equals(req.query.type); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const files = await query.select("id filename created owner").exec();
        res.send({ status: "success", payload: files });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id/raw", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.user.roles);
        if (!file) { throw new Error("Not found"); }
        res.download(file.getPath());
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/:id/raw", upload.single("file"), async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedModify").in(req.user.roles);
        if (!file) { throw new Error("Not found"); }
        const md5 = await MD5(req.file.path);
        file.hash = md5;
        file.size = req.file.size;
        file.filename = req.file.originalname;
        await file.save();
        if (existsSync(file.getPath())) { await unlink(file.getPath()); }
        await move(req.file.path, file.getPath());
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedModify").in(req.user.roles);
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
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.user.roles);
        if (!file) { throw new Error("Not found"); }
        res.send({ status: "success", payload: file });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.user.roles).select("filename").exec();
        if (!file) { throw new Error("Not found"); }
        res.send({ status: "success", payload: file });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

fileRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const file = await BFile.findById(req.params.id).where("allowedRead").in(req.user.roles);
        if (!file) { throw new Error("Not found"); }
        file.description = req.body.description;
        file.filename = req.body.filename;
        if (await verifyAccess(req.user, "manageSystem")) {
            file.allowedModify = req.body.allowedModify;
            file.allowedRead = req.body.allowedRead;
        }
        await file.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
