import { Router } from "express";
import { ensureDirSync, writeFile } from "fs-extra";
import { lookup } from "mime-types";
import * as multer from "multer";
import * as tmp from "tmp";
import { File } from "../../schemas/file";
import { isEntryAdmin, isEntryMember, isLoggedin, isSystemAdmin, notNullOrUndefined, PaginationWrap, RESTWrap, verifyValidation } from "./util";

export const FileRouter = Router();
ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

FileRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    return res.RESTSend(file);
}));

FileRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    file.filename = req.body.filename;
    file.type = req.body.type;
    file.description = req.body.description;
    file.public = req.body.public;
    await file.save();
    return res.RESTEnd();
}));

FileRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    await file.remove();
    return res.RESTEnd();
}));

FileRouter.get("/raw", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    return res.sendFile(file.getPath(), { headers: { "Content-Type": file.filename } });
}));

FileRouter.post("/upload", isLoggedin, isEntryAdmin, upload.single("file"), RESTWrap(async (req, res) => {
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

FileRouter.post("/new", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
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

FileRouter.get("/list.private", isLoggedin, isEntryMember, PaginationWrap((req) => File.find({ owner: req.query.entry })));
FileRouter.get("/list.public", PaginationWrap(() => File.find({ public: true })));
FileRouter.get("/list.all", isLoggedin, isSystemAdmin, PaginationWrap(() => File.find()));
