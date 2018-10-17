import { Router } from "express";
import { Entry } from "../../../schemas/entry";
import { EntryMap } from "../../../schemas/entryMap";
import { validateOne } from "../../../utils";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateEntrymapRouter = Router();

privateEntrymapRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("entry").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const map = await EntryMap.findOne()
        .where("to").equals(req.entry)
        .where("from").equals(req.query.entry);
    if (!map) { throw new Error("Not found"); }
    return res.RESTSend(map);
}));

privateEntrymapRouter.post("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("entry").isString().notEmpty();
    req.checkBody("admin").isBoolean();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    let map = await EntryMap.findOne()
        .where("to").equals(req.entry)
        .where("from").equals(req.query.entry);
    if (!map) {
        if (!await validateOne(Entry, req.query.entry)) { throw new Error("Entry not found"); }
        map = new EntryMap();
        map.from = req.query.entry;
        map.to = req.entry;
    }
    map.admin = req.body.admin;
    await map.save();
    return res.RESTEnd();
}));

privateEntrymapRouter.delete("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("entry").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const map = await EntryMap.findOne().where("to").equals(req.entry).where("from").equals(req.query.entry);
    if (!map) { throw new Error("Not found"); }
    await map.remove();
    return res.RESTEnd();
}));

privateEntrymapRouter.get("/count", RESTWarp(async (req, res) => {
    const query = EntryMap.find().where("to").equals(req.entry);
    return res.RESTSend(await query.countDocuments());
}));

privateEntrymapRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = EntryMap.find().where("to").equals(req.entry);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
