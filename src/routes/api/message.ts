/**
 * message.ts
 * GET    /
 * PUT    /
 * POST   /
 * DELETE /
 * GET    /list
 */

import { Router } from "express";
import { Message } from "../../schemas/message";
import { isEntryAdmin, isEntryMember, isLoggedin, notNullOrUndefined, PaginationWrap, RESTWrap } from "./util";

export const MessageRouter = Router();

MessageRouter.get("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    notNullOrUndefined(message);
    return res.RESTSend(message);
}));

MessageRouter.put("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const message = await Message.findOne({ owner: req.query.entry, id: req.query.id });
    notNullOrUndefined(message);
    message.content = req.body.content;
    await message.save();
    return res.RESTEnd();
}));

MessageRouter.delete("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    const message = await Message.findOne({ owner: req.query.entry, from: req.query.id });
    notNullOrUndefined(message);
    await message.remove();
    return res.RESTEnd();
}));

MessageRouter.post("/", isLoggedin, isEntryMember, RESTWrap(async (req, res) => {
    const message = new Message();
    message.content = req.body.content;
    message.owner = req.query.entry;
    message.creator = req.user;
    await message.save();
    return res.RESTSend(message.id);
}));

MessageRouter.get("/list", isLoggedin, isEntryMember, PaginationWrap((req) => Message.find({ owner: req.query.entry })));
