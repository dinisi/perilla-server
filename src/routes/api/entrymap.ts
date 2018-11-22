/**
 * entrymap.ts
 * GET    / : get entrymap
 * POST   / : create/update entrymap
 * DELETE / : delete entrymap
 * GET    /list : list entrymaps
 */

import { Router } from "express";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entrymap";
import { ensure, PaginationWrap, RESTWrap, verifyEntryAccess } from "./util";

export const EntrymapRouter = Router();

EntrymapRouter.get("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    const map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) { throw new Error("Not found"); }
    return res.RESTSend(map);
}));

EntrymapRouter.post("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    ensure(req.admin, "Access denied");
    let map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) {
        const entry = await Entry.findOne({ _id: req.query.from, type: EntryType.user });
        ensure(entry, "Not found");
        map = new EntryMap();
        map.from = req.query.from;
        map.to = req.query.entry;
    }
    map.admin = req.body.admin;
    await map.save();
    return res.RESTEnd();
}));

EntrymapRouter.delete("/", verifyEntryAccess, RESTWrap(async (req, res) => {
    ensure(req.admin, "Access denied");
    const map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) { throw new Error("Not found"); }
    await map.remove();
    return res.RESTEnd();
}));

EntrymapRouter.get("/list", verifyEntryAccess, PaginationWrap((req) => {
    let query = EntryMap.find({ to: req.query.entry });
    if (req.query.search !== undefined) {
        query = query.where("from").regex(new RegExp(req.query.search.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, "\\$&"), "g"));
    }
    return query;
}));
