import { Router } from "express";
import { Entry } from "../../../schemas/entry";
import { extendQuery, PaginationGuard, RESTWarp } from "../util";

export const publicEntryRouter = Router();

publicEntryRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Entry.find();
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

publicEntryRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Entry.find();
    query = query.select("_id description email created type");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

publicEntryRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    const entry = await Entry.findById(req.query.entry).select("-hash -salt");
    return res.RESTSend(entry);
}));
