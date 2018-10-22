import { Router } from "express";
import { Message } from "../../../schemas/message";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const privateMessageRouter = Router();

privateMessageRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    if (!message) { throw new Error("Not found"); }
    return res.RESTSend(message);
}));

privateMessageRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const message = await Message.findOne({ owner: req.query.entry, id: req.query.id });
    if (!message) { throw new Error("Not found"); }
    if (!req.admin && req.user !== message.creator) { throw new Error("Access denied"); }
    message.content = req.body.content;
    await message.save();
    return res.RESTEnd();
}));

privateMessageRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    if (!message) { throw new Error("Not found"); }
    if (!req.admin && req.user !== message.creator) { throw new Error("Access denied"); }
    await message.remove();
    return res.RESTEnd();
}));

privateMessageRouter.get("/count", RESTWarp(async (req, res) => {
    const query = Message.find().where("owner").equals(req.query.entry);
    return res.RESTSend(await query.countDocuments());
}));

privateMessageRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = Message.find().where("owner").equals(req.query.entry);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
