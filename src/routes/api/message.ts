import { Router } from "express";
import { Message } from "../../schemas/message";
import { isEntryAdmin, isEntryMember, isLoggedin, isSystemAdmin, notNullOrUndefined, PaginationWrap, RESTWrap, verifyValidation } from "./util";

export const MessageRouter = Router();

MessageRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    notNullOrUndefined(message);
    return res.RESTSend(message);
}));

MessageRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(message);
    message.content = req.body.content;
    await message.save();
    return res.RESTEnd();
}));

MessageRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString();
    verifyValidation(req.validationErrors());

    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    notNullOrUndefined(message);
    await message.remove();
    return res.RESTEnd();
}));

MessageRouter.post("/new", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    req.checkQuery("entry", "Invalid query: entry").isString();
    verifyValidation(req.validationErrors());

    const message = new Message();
    message.content = req.body.content;
    message.owner = req.query.entry;
    message.creator = req.user;
    await message.save();
    return res.RESTSend(message.id);
}));

MessageRouter.get("/list.private", isLoggedin, isEntryMember, PaginationWrap((req) => Message.find({ owner: req.query.entry })));
MessageRouter.get("/list.all", isLoggedin, isSystemAdmin, PaginationWrap(() => Message.find()));
