import { Router } from "express";
import { Message } from "../../schemas/message";
import { PaginationWrap, RESTWrap, verifyAccess, verifyValidation } from "./util";

export const MessageRouter = Router();

MessageRouter.get("/", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    verifyAccess(message, req.user);
    return res.RESTSend(message);
}));

MessageRouter.post("/", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, id: req.query.id });
    verifyAccess(message, req.user, true);
    message.content = req.body.content;
    await message.save();
    return res.RESTEnd();
}));

MessageRouter.delete("/", RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    verifyAccess(message, req.user, true);
    await message.remove();
    return res.RESTEnd();
}));

MessageRouter.post("/new", RESTWrap(async (req, res) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    verifyValidation(req.validationErrors());

    const message = new Message();
    message.content = req.body.content;
    message.owner = req.query.entry;
    message.creator = req.user;
    await message.save();
    return res.RESTSend(message.id);
}));

MessageRouter.get("/list", PaginationWrap(() => Message.find()));
