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
import { ensureDirSync } from "fs-extra";
import { lookup } from "mime-types";
import * as multer from "multer";
import { File } from "../../schemas/file";
import { isEntryAdmin, isEntryMember, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const FileRouter = Router();
ensureDirSync("files/uploads/");
const upload = multer({ dest: "files/uploads/" });

FileRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    return res.RESTSend(file);
}));

FileRouter.put("/", isLoggedin, isEntryAdmin, upload.single("file"), RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    file.name = req.body.name || req.file.originalname;
    file.type = req.body.type || lookup(file.name) || "text/plain";
    file.description = req.body.description || file.name;
    if (req.body.tags) {
        if (req.body.tags instanceof Array) {
            file.tags = req.body.tags;
        } else {
            // FormData
            file.tags = JSON.parse(req.body.tags);
        }
    }
    if (req.file) {
        await file.setFile(req.file.path);
    }
    await file.save();
    return res.RESTEnd();
}));

FileRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    await file.remove();
    return res.RESTEnd();
}));

FileRouter.post("/", isLoggedin, isEntryAdmin, upload.single("file"), RESTWrap(async (req, res) => {
    notNullOrUndefined(req.file);
    const file = new File();
    await file.setFile(req.file.path);
    file.owner = req.query.entry;
    file.creator = req.user;
    file.name = req.body.name || req.file.originalname;
    file.type = req.body.type || lookup(file.name) || "text/plain";
    file.description = req.body.description || file.name;
    if (req.body.tags) {
        if (req.body.tags instanceof Array) {
            file.tags = req.body.tags;
        } else {
            // FormData
            file.tags = JSON.parse(req.body.tags);
        }
    }
    await file.save();
    return res.RESTSend(file.id);
}));

FileRouter.get("/raw", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(file);
    return res.sendFile(file.getPath(), { headers: { "Content-Type": file.type } });
}));

FileRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => {
    let base = File.find({ owner: req.query.entry }).select("id name type tags created creator");
    if (req.query.tags) {
        base = base.where("tags").all(req.query.tags);
    }
    if (req.query.type) {
        base = base.where("type").equals(req.query.type);
    }
    if (req.query.search) {
        base = base.where("name").regex(new RegExp(req.query.search.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, "\\$&"), "g"));
    }
    if (req.query.before) {
        base = base.where("created").lte(req.query.before);
    }
    if (req.query.after) {
        base = base.where("created").gte(req.query.after);
    }
    if (req.query.creator) {
        base = base.where("creator").equals(req.query.creator);
    }
    return base;
}));
