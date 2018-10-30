import { Router } from "express";
import { ensureDirSync, writeFile } from "fs-extra";
import { lookup } from "mime-types";
import * as multer from "multer";
import * as tmp from "tmp";
import { File } from "../../schemas/file";
import { extendQuery, PaginationGuard, RESTWarp, verifyAccess, verifyValidation } from "./util";

export const FileRouter = Router();
ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

FileRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(file, req.user);
    return res.RESTSend(file);
}));

FileRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(file, req.user, true);
    file.filename = req.body.filename;
    file.type = req.body.type;
    file.description = req.body.description;
    file.public = req.body.public;
    await file.save();
    return res.RESTEnd();
}));

FileRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(file, req.user, true);
    await file.remove();
    return res.RESTEnd();
}));

FileRouter.get("/raw", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(file, req.user);
    return res.sendFile(file.getPath(), { headers: { "Content-Type": file.filename } });
}));

FileRouter.post("/upload", upload.single("file"), RESTWarp(async (req, res) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    verifyValidation(req.validationErrors());

    const file = new File();
    await file.setFile(req.file.path);
    file.owner = req.query.entry;
    file.creator = req.user;
    file.filename = req.file.originalname;
    file.type = lookup(req.file.originalname) || "text/plain";
    file.description = req.file.originalname;
    await file.save();
    return res.RESTSend(file.id);
}));

FileRouter.post("/new", RESTWarp(async (req, res) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    verifyValidation(req.validationErrors());

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
    file.owner = req.query.entry;
    file.creator = req.user;
    file.filename = req.body.filename;
    file.description = req.body.description;
    file.type = req.body.type || lookup(req.body.filename) || "text/plain";
    file.public = req.body.public;
    await file.save();
    return res.RESTSend(file.id);
}));

FileRouter.get("/count", RESTWarp(async (req, res) => {
    let query = File.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

FileRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = File.find().where("owner").equals(req.query.entry);
    query = query.select("id filename type description size created owner creator public");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
