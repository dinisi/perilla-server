import { Router } from "express";
import { Entry, EntryType } from "../../../schemas/entry";
import { extendQuery, normalizeValidatorError, PaginationGuard, RESTWarp } from "../util";

export const systemEntryRouter = Router();

systemEntryRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Entry.find();
    query = extendQuery(query, req.query.control);
    return res.RESTSend(await query.countDocuments());
}));

systemEntryRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Entry.find();
    query = query.select("_id description email created type");
    query = extendQuery(query, req.query.control);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

systemEntryRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const entry = await Entry.findById(req.query.id).select("-hash -salt");
    if (!entry) { throw new Error("Not found"); }
    return  res.RESTSend(entry);
}));

systemEntryRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const entry = await Entry.findById(req.query.id);
    if (!entry) { throw new Error("Not found"); }
    entry.description = req.body.description;
    entry.email = req.body.email;
    if (req.body.password && entry.type === EntryType.user) {
        entry.setPassword(req.body.password);
    }
    await entry.save();
    return  res.RESTEnd();
}));
