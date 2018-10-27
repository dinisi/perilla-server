import { Router } from "express";
import { Message } from "../../../schemas/message";
import { extendQuery, normalizeValidatorError, PaginationGuard, RESTWarp } from "../util";

export const privateMessageRouter = Router();

privateMessageRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    if (!message) { throw new Error("Not found"); }
    return res.RESTSend(message);
}));

privateMessageRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
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
    req.checkQuery("id", "Invalid query: ID").isString();
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

privateMessageRouter.post("/new", RESTWarp(async (req, res) => {
    const message = new Message();
    message.content = req.body.content;
    message.owner = req.query.entry;
    message.creator = req.user;
    await message.save();
    return res.RESTSend(message.id);
}));

privateMessageRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Message.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

privateMessageRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Message.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
