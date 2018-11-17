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
import { isEntryAdmin, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const EntrymapRouter = Router();

EntrymapRouter.get("/", isLoggedin, RESTWrap(async (req, res) => {
    const map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) { throw new Error("Not found"); }
    return res.RESTSend(map);
}));

EntrymapRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    let map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) {
        const entry = await Entry.findOne({ _id: req.query.from, type: EntryType.user });
        notNullOrUndefined(entry);
        map = new EntryMap();
        map.from = req.query.from;
        map.to = req.query.entry;
    }
    map.admin = req.body.admin;
    await map.save();
    return res.RESTEnd();
}));

EntrymapRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) { throw new Error("Not found"); }
    await map.remove();
    return res.RESTEnd();
}));

EntrymapRouter.get("/list", PaginationWrap((req) => {
    let query = EntryMap.find({ to: req.query.entry });
    if (req.query.search) {
        query = query.where("from").regex(new RegExp(req.query.search.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, "\\$&"), "g"));
    }
    return query;
}));
