import { Router } from "express";
import { File } from "../../../schemas/file";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateFileRouter = Router();

privateFileRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findById(req.query.id);
    if (!file) { throw new Error("Not found"); }
    return res.RESTSend(file);
}));

privateFileRouter.post("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("id").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findById(req.query.id);
    if (!file) { throw new Error("Not found"); }
    // TODO modify file
    return res.RESTEnd();
}));

privateFileRouter.delete("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    req.checkQuery("id").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const file = await File.findById(req.query.id);
    if (!file) { throw new Error("Not found"); }
    await file.remove();
    return res.RESTEnd();
}));

privateFileRouter.get("/count", RESTWarp(async (req, res) => {
    const query = File.find().where("owner").equals(req.entry);
    return res.RESTSend(await query.countDocuments());
}));

privateFileRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = File.find().where("owner").equals(req.entry);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
