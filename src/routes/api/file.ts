import { Response, Router } from "express";
import { ensureDirSync, existsSync, move, unlink } from "fs-extra";
import * as path from "path";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest, IFileRequest } from "../../definitions/requests";
import { FileAccess } from "../../schemas/fileAccess";
ensureDirSync("files/uploads/");
import * as multer from "multer";
import { config } from "../../config";
import { MD5 } from "../../md5";
import { BFile } from "../../schemas/file";
import { validPaginate } from "../common";
const upload = multer({ dest: "files/uploads/" });

export let FileRouter = Router();

FileRouter.post("/upload", upload.array("files", 128), async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.CFile) { throw new ServerError("Access denied", 403); }
        const result = [];
        for (const file of req.files as Express.Multer.File[]) {
            const bfile = new BFile();
            const md5 = await MD5(file.path);
            bfile.hash = md5;
            bfile.owner = req.userID;
            const splitter = file.originalname.lastIndexOf(".");
            if (splitter !== -1 && splitter !== file.originalname.length - 1) {
                bfile.type = file.originalname.substring(splitter + 1, file.originalname.length);
            }
            await bfile.save();
            if (req.roleID !== config.defaultAdminRoleID && req.roleID !== config.defaultJudgerRoleID) {
                const fileAccess = new FileAccess();
                fileAccess.fileID = bfile._id;
                fileAccess.roleID = req.roleID;
                await fileAccess.save();
            }
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

FileRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = BFile.find();
        if (req.query.owner) {
            query = query.where("owner").equals(req.query.owner);
        }
        if (req.query.search) {
            query = query.where("description").regex(new RegExp(req.query.search));
        }
        if (req.query.type) {
            query = query.where("type").equals(req.query.type);
        }
        query = query.skip(req.query.skip).limit(req.query.limit);
        const files = await query.select("_id type created owner").exec();
        res.send(files);
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
        req.access = access;
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
        res.download(path.resolve("files/managed/" + req.fileID));
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
        if (!req.access.MContent) { throw new ServerError("No access", 403); }
        const bfile = await BFile.findById(req.fileID);
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
        if (!req.access.MContent) { throw new ServerError("No access", 403); }
        const bfile = await BFile.findById(req.fileID);
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

FileRouter.get("/:id/meta", async (req: IFileRequest, res: Response) => {
    try {
        const bfile = await BFile.findById(req.fileID);
        res.send(bfile);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileRouter.post("/:id/meta", async (req: IFileRequest, res: Response) => {
    try {
        if (!req.access.MContent) { throw new ServerError("No access", 403); }
        const bfile = await BFile.findById(req.fileID);
        bfile.description = req.body.description;
        bfile.type = req.body.type;
        await bfile.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

FileRouter.get("/:id/raw", async (req: IFileRequest, res: Response) => {
    try {
        res.sendFile(path.resolve("files/managed/" + req.fileID));
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
