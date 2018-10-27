import { Router } from "express";
import { File } from "../../../schemas/file";
import { extendQuery, normalizeValidatorError, PaginationGuard, RESTWarp } from "../util";

export const systemFileRouter = Router();

systemFileRouter.get("/count", RESTWarp(async (req, res) => {
    let query = File.find();
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

systemFileRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = File.find();
    query = query.select("id filename type description size created owner creator public");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

systemFileRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findById(req.query.id);
    if (!file) { throw new Error("Not error"); }
    return res.RESTSend(file);
}));

systemFileRouter.get("/raw", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findById(req.query.id);
    if (!file) { throw new Error("Not error"); }
    res.sendFile(file.getPath(), { headers: { "Content-Type": file.type } });
}));

systemFileRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findById(req.query.id);
    if (!file) { throw new Error("Not error"); }
    file.filename = req.body.filename;
    file.type = req.body.type;
    file.description = req.body.description;
    file.public = req.body.public;
    await file.save();
    return res.RESTEnd();
}));

systemFileRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findById(req.query.id);
    if (!file) { throw new Error("Not found"); }
    await file.remove();
    return res.RESTEnd();
}));
