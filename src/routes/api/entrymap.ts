/**
 * entrymap.ts
 * GET    / : get entrymap
 * POST   / : create/update entrymap
 * DELETE / : delete entrymap
 * GET    /list : list entrymaps
 */

import { Router } from "express";
import { Entry } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entryMap";
import { validateOne } from "../../utils";
import { isEntryAdmin, isLoggedin, PaginationWrap, RESTWrap } from "./util";

export const EntrymapRouter = Router();

EntrymapRouter.get("/", isLoggedin, RESTWrap(async (req, res) => {
    const map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) { throw new Error("Not found"); }
    return res.RESTSend(map);
}));

EntrymapRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    let map = await EntryMap.findOne({ to: req.query.entry, from: req.query.from });
    if (!map) {
        if (!await validateOne(Entry, req.query.from)) { throw new Error("Entry not found"); }
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

EntrymapRouter.get("/list", PaginationWrap(() => EntryMap.find()));
