/**
 * file.ts
 * GET    /   : get file details
 * PUT    /   : update file details
 * DELETE /   : delete file
 * GET    /raw: get file content
 * POST   /   : create file
 * GET    /list: list files
 */

import Busboy = require("busboy");
import { Router } from "express";
import { createWriteStream, existsSync, moveSync } from "fs-extra";
import { lookup } from "mime-types";
import { join } from "path";
import { SHA3Hash } from "sha3";
import { file as createTmpFile } from "tmp";
import { MANAGED_FILE_PATH } from "../../constant";
import { File } from "../../schemas/file";
import { ensure, isLoggedin, PaginationWrap, RESTWrap, verifyEntryAccess } from "./util";

export const FileRouter = Router();

FileRouter.get("/provide", isLoggedin, RESTWrap(async (req, res) => {
    const dist = join(MANAGED_FILE_PATH, req.query.hash);
    if (existsSync(dist)) { throw new Error("File exists"); }
    res.RESTEnd();
}));

FileRouter.post("/provide", isLoggedin, (req, res) => {
    try {
        const busboy = new Busboy({ headers: req.headers });
        busboy.on("file", (fieldname, stream) => {
            createTmpFile((err, path) => {
                if (err) {throw err; }
                const sha3 = new SHA3Hash();
                const ws = createWriteStream(path);
                stream.on("data", (chunk) => {
                    sha3.update(chunk);
                    ws.write(chunk);
                });
                stream.on("end", () => {
                    const sha3Value = sha3.digest("hex");
                    ws.end(() => {
                        if (!existsSync(join(MANAGED_FILE_PATH, sha3Value))) {
                            moveSync(path, join(MANAGED_FILE_PATH, sha3Value));
                        }
                    });
                });
            });
        });
        busboy.on("finish", () => {
            res.json({ status: "success" });
        });
        return req.pipe(busboy);
    } catch (e) {
        res.json({ status: "failed", payload: e.message });
    }
});

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
    req.body.hash && file.setFile(req.body.hash);
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
    const file = new File();
    await file.setFile(req.body.hash);
    file.owner = req.query.entry;
    file.creator = req.user;
    file.name = req.body.name;
    file.type = req.body.type || lookup(file.name) || file.type || "text/plain";
    file.description = req.body.description || file.name;
    file.tags = req.body.tags || file.tags;
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
