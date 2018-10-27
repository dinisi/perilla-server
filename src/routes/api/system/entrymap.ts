import { Router } from "express";
import { EntryMap } from "../../../schemas/entryMap";
import { extendQuery, normalizeValidatorError, PaginationGuard, RESTWarp } from "../util";

export const systemEntryMapRouter = Router();

systemEntryMapRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const map = await EntryMap.findById(req.query.id);
    if (!map) { throw new Error("Not found"); }
    return res.RESTSend(map);
}));

systemEntryMapRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const map = await EntryMap.findById(req.query.id);
    if (!map) { throw new Error("Not found"); }
    map.admin = req.body.admin;
    await map.save();
    return res.RESTEnd();
}));

systemEntryMapRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const map = await EntryMap.findById(req.query.id);
    if (!map) { throw new Error("Not found"); }
    await map.remove();
    return res.RESTEnd();
}));

systemEntryMapRouter.get("/count", RESTWarp(async (req, res) => {
    let query = EntryMap.find();
    query = extendQuery(query, req.query.control);
    return res.RESTSend(await query.countDocuments());
}));

systemEntryMapRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = EntryMap.find();
    query = extendQuery(query, req.query.control);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
