/**
 * file.ts
 * GET    /   : get file details
 * PUT    /   : update file details
 * DELETE /   : delete file
 * GET    /raw: get file content
 * POST   /   : create file
 * GET    /list: list files
 */

import { Router } from "express";
import { ensureDirSync, existsSync, move } from "fs-extra";
import { lookup } from "mime-types";
import * as multer from "multer";
import { join } from "path";
import { MANAGED_FILE_PATH, UPLOAD_FILE_PATH } from "../../constant";
import { File } from "../../schemas/file";
import { getHash } from "../../utils";
import { ensure, isLoggedin, PaginationWrap, RESTWrap, verifyEntryAccess } from "./util";

export const FileRouter = Router();

const upload = multer({ dest: UPLOAD_FILE_PATH });

FileRouter.get("/provide", isLoggedin, RESTWrap(async (req, res) => {
    const dist = join(MANAGED_FILE_PATH, req.query.hash);
    if (existsSync(dist)) { throw new Error("File exists"); }
    res.RESTEnd();
}));

FileRouter.post("/provide", isLoggedin, upload.single("file"), RESTWrap(async (req, res) => {
    ensure(req.file, "Not found");
    const hash = await getHash(req.file.path);
    const dist = join(MANAGED_FILE_PATH, hash);
    if (existsSync(dist)) { throw new Error("File exists"); }
    await move(req.file.path, dist);
    res.RESTEnd();
}));

FileRouter.get("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(file, "Not found");
    return res.RESTSend(file);
}));

FileRouter.put("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(file, "Not found");
    ensure(req.admin || file.owner === req.user, "Access denied");
    file.name = req.body.name || file.name;
    file.type = req.body.type || lookup(file.name) || file.type || "text/plain";
    file.description = req.body.description || file.name;
    file.tags = req.body.tags || file.tags;
    file.setFile(req.body.hash);
    await file.save();
    return res.RESTEnd();
}));

FileRouter.delete("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(file, "Not found");
    ensure(req.admin || file.owner === req.user, "Access denied");
    await file.remove();
    return res.RESTEnd();
}));

FileRouter.post("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    ensure(req.file, "Not found");
    const file = new File();
    await file.setFile(req.file.path);
    file.owner = req.query.entry;
    file.creator = req.user;
    file.name = req.body.name || req.file.originalname;
    file.type = req.body.type || lookup(file.name) || "text/plain";
    file.description = req.body.description || file.name;
    file.tags = req.body.tags;
    await file.save();
    return res.RESTSend(file.id);
}));

FileRouter.get("/raw", verifyEntryAccess, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    ensure(file, "Not found");
    return res.sendFile(file.getPath(), { headers: { "Content-Type": file.type } });
}));

FileRouter.get("/list", verifyEntryAccess, PaginationWrap((req) => {
    let base = File.find({ owner: req.query.entry }).select("id name type tags created creator");
    if (req.query.tags !== undefined) {
        base = base.where("tags").all(req.query.tags);
    }
    if (req.query.type !== undefined) {
        base = base.where("type").equals(req.query.type);
    }
    if (req.query.search !== undefined) {
        base = base.where("name").regex(new RegExp(req.query.search.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, "\\$&"), "g"));
    }
    if (req.query.before !== undefined) {
        base = base.where("created").lte(req.query.before);
    }
    if (req.query.after !== undefined) {
        base = base.where("created").gte(req.query.after);
    }
    if (req.query.creator !== undefined) {
        base = base.where("creator").equals(req.query.creator);
    }
    return base;
}));
