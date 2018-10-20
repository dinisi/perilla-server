import { Router } from "express";
import { Message } from "../../../schemas/message";
import { normalizeValidatorError, PaginationGuard, RESTWarp } from "../wrap";

export const systemMessageRouter = Router();

systemMessageRouter.get("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const message = await Message.findById(req.query.id);
    if (!message) { throw new Error("Not found"); }
    return res.RESTSend(message);
}));

systemMessageRouter.post("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isNumeric().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const message = await Message.findById(req.query.id);
    if (!message) { throw new Error("Not found"); }
    message.content = req.body.content;
    await message.save();
    return res.RESTEnd();
}));

systemMessageRouter.delete("/", RESTWarp(async (req, res) => {
    req.checkQuery("id", "Invalid query: ID").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const message = await Message.findById(req.query.id);
    if (!message) { throw new Error("Not found"); }
    await message.remove();
    return res.RESTEnd();
}));

systemMessageRouter.get("/count", RESTWarp(async (req, res) => {
    const query = Message.find();
    return res.RESTSend(await query.countDocuments());
}));

systemMessageRouter.get("/list", PaginationGuard, RESTWarp(async (req, res) => {
    const query = Message.find();
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
