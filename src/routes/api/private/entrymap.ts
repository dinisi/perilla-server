import { Router } from "express";
import { EntryMap } from "../../../schemas/entryMap";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateEntrymapRouter = Router();

privateEntrymapRouter.get("/count", RESTWarp(async (req, res) => {
    const query = EntryMap.find().where("to").equals(req.entry);
    res.RESTSend(await query.countDocuments());
}));

privateEntrymapRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = EntryMap.find().where("to").equals(req.entry);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    res.RESTSend(result);
}));

privateEntrymapRouter.get("/fetch", RESTWarp(async (req, res) => {
    req.checkQuery("entry").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.RESTFail(normalizeValidatorError(errors));
    } else {
        const map = await EntryMap.find().where("to").equals(req.entry).where("from").equals(req.query.entry);
        res.RESTSend(map);
    }
}));
