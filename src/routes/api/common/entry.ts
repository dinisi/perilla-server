import { Router } from "express";
import { Entry, EntryType } from "../../../schemas/entry";
import { normalizeValidatorError, RESTWarp } from "../wrap";

export const commonEntryRouter = Router();

commonEntryRouter.post("/create", RESTWarp(async (req, res) => {
    req.checkBody("name").isString().notEmpty();
    req.checkBody("email").isEmail();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const entry = new Entry();
    entry._id = req.body.name;
    entry.email = req.body.email;
    entry.description = req.body.description;
    entry.type = EntryType.group;
    await entry.save();
    res.RESTSend(entry._id);
}));
