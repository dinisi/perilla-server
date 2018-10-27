import { Router } from "express";
import { ensureDirSync, writeFile } from "fs-extra";
import { lookup } from "mime-types";
import * as multer from "multer";
import * as tmp from "tmp";
import { File } from "../../../schemas/file";
import { extendQuery, normalizeValidatorError, PaginationGuard, RESTWarp } from "../util";

export const privateFileRouter = Router();
ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

privateFileRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    if (!file) { throw new Error("Not found"); }
    return res.RESTSend(file);
}));

privateFileRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    if (!file) { throw new Error("Not found"); }
    if (!req.admin && req.user !== file.creator) { throw new Error("Access denied"); }
    file.filename = req.body.filename;
    file.type = req.body.type;
    file.description = req.body.description;
    file.public = req.body.public;
    await file.save();
    return res.RESTEnd();
}));

privateFileRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    if (!file) { throw new Error("Not found"); }
    if (!req.admin && req.user !== file.creator) { throw new Error("Access denied"); }
    await file.remove();
    return res.RESTEnd();
}));

privateFileRouter.get("/raw", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    if (!file) { throw new Error("Not found"); }
    if (!req.admin && req.user !== file.creator) { throw new Error("Access denied"); }
    return res.sendFile(file.getPath(), { headers: { "Content-Type": file.filename } });
}));

privateFileRouter.post("/upload", upload.single("file"), RESTWarp(async (req, res) => {
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

privateFileRouter.post("/new", RESTWarp(async (req, res) => {
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

privateFileRouter.get("/count", RESTWarp(async (req, res) => {
    let query = File.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

privateFileRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = File.find().where("owner").equals(req.query.entry);
    query = query.select("id filename type description size created owner creator public");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
