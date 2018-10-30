import { Router } from "express";
import { Entry } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entryMap";
import { validateOne } from "../../utils";
import { extendQuery, isEntryAdmin, isLoggedin, normalizeValidatorError, PaginationGuard, RESTWrap, verifyValidation } from "./util";

export const EntrymapRouter = Router();

EntrymapRouter.get("/", isLoggedin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    req.checkQuery("entry", "Invalid query: entry").isString();
    verifyValidation(req.validationErrors());

    const map = await EntryMap.findOne({ to: req.query.entry, from: req.query.id });
    if (!map) { throw new Error("Not found"); }
    return res.RESTSend(map);
}));

EntrymapRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    req.checkBody("admin", "Invalid body: admin").isBoolean();
    verifyValidation(req.validationErrors());

    let map = await EntryMap.findOne({ to: req.query.entry, from: req.query.id });
    if (!map) {
        if (!await validateOne(Entry, req.query.id)) { throw new Error("Entry not found"); }
        map = new EntryMap();
        map.from = req.query.id;
        map.to = req.query.entry;
    }
    map.admin = req.body.admin;
    await map.save();
    return res.RESTEnd();
}));

EntrymapRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    verifyValidation(req.validationErrors());

    const map = await EntryMap.findOne({ to: req.query.entry, from: req.query.id });
    if (!map) { throw new Error("Not found"); }
    await map.remove();
    return res.RESTEnd();
}));

// Public to everyone

EntrymapRouter.get("/count", RESTWrap(async (req, res) => {
    let query = EntryMap.find().where("to").equals(req.query.entry);
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

EntrymapRouter.get("/list", PaginationGuard, RESTWrap(async (req, res) => {
    let query = EntryMap.find().where("to").equals(req.query.entry);
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
