/**
 * entry.ts
 * GET    /
 * PUT    /
 * DELETE /
 * GET    /list
 */

import { Router } from "express";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entrymap";
import { isEntryAdmin, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const EntryRouter = Router();

EntryRouter.get("/", RESTWrap(async (req, res) => {
    const entry = await Entry.findById(req.query.entry).select("-hash -salt");
    notNullOrUndefined(entry);
    return res.RESTSend(entry);
}));

EntryRouter.put("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const entry = await Entry.findById(req.query.entry);
    notNullOrUndefined(entry);
    entry.description = req.body.description;
    entry.email = req.body.email;
    if (req.body.password && entry.type === EntryType.user) {
        entry.setPassword(req.body.password);
    }
    await entry.save();
    return res.RESTEnd();
}));

EntryRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const entry = await Entry.findById(req.query.entry);
    notNullOrUndefined(entry);
    await entry.remove();
    return res.RESTEnd();
}));

EntryRouter.get("/list", PaginationWrap(() => Entry.find().select("-hash -salt")));
