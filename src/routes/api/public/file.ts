import { Router } from "express";
import { lookup } from "mime-types";
import { extendQuery } from "../../../interfaces/query";
import { File } from "../../../schemas/file";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const publicFileRouter = Router();

publicFileRouter.get("/count", RESTWarp(async (req, res) => {
    let query = File.find().where("public").equals(true);
    query = extendQuery(query, req.query.condition);
    return res.RESTSend(await query.countDocuments());
}));

publicFileRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = File.find().where("public").equals(true);
    query = query.select("id filename type description size created owner creator public");
    query = extendQuery(query, req.query.condition);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

publicFileRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    req.checkQuery("entry", "Invalid query: entry").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    if (!file || !file.public) { throw new Error("Not found"); }
    return  res.RESTSend(file);
}));

publicFileRouter.get("/raw", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    req.checkQuery("entry", "Invalid query: entry").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findOne({ owner: req.query.entry, id: req.query.id });
    res.sendFile(file.getPath(), { headers: { "Content-Type": file.type } });
}));
