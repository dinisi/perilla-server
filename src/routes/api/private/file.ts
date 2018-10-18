import { Router } from "express";
import { ensureDirSync, writeFile } from "fs-extra";
import { lookup } from "mime-types";
import * as multer from "multer";
import * as tmp from "tmp";
import { File } from "../../../schemas/file";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateFileRouter = Router();
ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

privateFileRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.entry, id: req.query.id });
    if (!file) { throw new Error("Not found"); }
    return res.RESTSend(file);
}));

privateFileRouter.post("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.entry, id: req.query.id });
    if (!file) { throw new Error("Not found"); }
    file.filename = req.body.filename;
    file.type = req.body.type;
    file.description = req.body.description;
    file.public = req.body.public;
    await file.save();
    return res.RESTEnd();
}));

privateFileRouter.delete("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("id").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.entry, id: req.query.id });
    if (!file) { throw new Error("Not found"); }
    await file.remove();
    return res.RESTEnd();
}));

privateFileRouter.post("/upload", upload.single("file"), RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    const file = new File();
    await file.setFile(req.file.path);
    file.owner = req.entry;
    file.filename = req.file.originalname;
    file.type = lookup(req.file.originalname) || "text/plain";
    file.description = req.file.originalname;
    await file.save();
    res.RESTSend(file.id);
}));

privateFileRouter.post("/new", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
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
    file.owner = req.entry;
    file.filename = req.body.filename;
    file.description = req.body.description;
    file.type = req.body.type || lookup(req.body.filename) || "text/plain";
    file.public = req.body.public;
    await file.save();
    res.RESTSend(file.id);
}));

privateFileRouter.get("/count", RESTWarp(async (req, res) => {
    const query = File.find().where("owner").equals(req.entry);
    return res.RESTSend(await query.countDocuments());
}));

privateFileRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = File.find().where("owner").equals(req.entry);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));