import { Router } from "express";
import { extendQuery } from "../../../interfaces/query";
import { Entry } from "../../../schemas/entry";
import { PaginationGuard, RESTWarp } from "../wrap";

export const publicEntryRouter = Router();

publicEntryRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Entry.find();
    query = extendQuery(query, req.query.condition);
    return res.RESTSend(await query.countDocuments());
}));

publicEntryRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Entry.find();
    query = query.select("_id description email created type");
    query = extendQuery(query, req.query.condition);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
