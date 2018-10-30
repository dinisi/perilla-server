import { Router } from "express";
import { Message } from "../../schemas/message";
import { extendQuery, PaginationGuard, RESTWarp, verifyAccess, verifyValidation } from "./util";

export const MessageRouter = Router();

MessageRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    verifyAccess(message, req.user);
    return res.RESTSend(message);
}));

MessageRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(message, req.user, true);
    message.content = req.body.content;
    await message.save();
    return res.RESTEnd();
}));

MessageRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    verifyAccess(message, req.user, true);
    await message.remove();
    return res.RESTEnd();
}));

MessageRouter.post("/new", RESTWarp(async (req, res) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    verifyValidation(req.validationErrors());

    const message = new Message();
    message.content = req.body.content;
    message.owner = req.query.entry;
    message.creator = req.user;
    await message.save();
    return res.RESTSend(message.id);
}));

MessageRouter.get("/count", RESTWarp(async (req, res) => {
    let query = Message.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

MessageRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    let query = Message.find().where("owner").equals(req.query.entry);
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
