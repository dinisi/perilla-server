import { Response, Router } from "express";
import { ensureDirSync, exists, existsSync, move, unlink, unlinkSync } from "fs-extra";
import * as path from "path";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest, IFileRequest } from "../../definitions/requests";
import { FileAccess } from "../../schemas/fileAccess";
ensureDirSync("files/uploads/");
import * as multer from "multer";
import { MD5 } from "../../md5";
import { BFile } from "../../schemas/file";
const upload = multer({ dest: "files/uploads/" });

export let FileRouter = Router();

FileRouter.post("/upload", upload.array("files", 128), async (req: IAuthorizedRequest, res: Response) => {
    try {
        const result = [];
        for (const file of req.files as Express.Multer.File[]) {
            const bfile = new BFile();
            const md5 = await MD5(file.path);
            bfile.hash = md5;
            bfile.owner = req.userID;
            await bfile.save();
            await move(file.path, bfile.getPath());
            result.push(bfile._id);
        }
        res.send(result);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileRouter.use("/:id", async (req: IFileRequest, res: Response, next) => {
    try {
        const fileID = req.params.id;
        const access = await FileAccess.findOne({ roleID: req.roleID, fileID });
        if (!access) { throw new ServerError("Not found", 404); }
        req.fileID = fileID;
        req.access = access.config;
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileRouter.get("/:id", async (req: IFileRequest, res: Response) => {
    try {
        if (!req.access.read) { throw new ServerError("No access", 403); }
        res.sendFile(path.resolve("files/managed/" + req.fileID));
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileRouter.post("/:id", upload.single("file"), async (req: IFileRequest, res: Response) => {
    try {
        if (!req.access.modify) { throw new ServerError("No access", 403); }
        const bfile = await BFile.findOne({ _id: req.fileID });
        const md5 = await MD5(req.file.path);
        bfile.hash = md5;
        await bfile.save();
        if (existsSync(bfile.getPath())) { await unlink(bfile.getPath()); }
        await move(req.file.path, bfile.getPath());
        res.send(md5);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileRouter.delete("/:id", async (req: IFileRequest, res: Response) => {
    try {
        if (!req.access.modify) { throw new ServerError("No access", 403); }
        const bfile = await BFile.findOne({ _id: req.fileID });
        await unlink(bfile.getPath());
        await bfile.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
