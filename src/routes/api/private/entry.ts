import { Router } from "express";
import { Entry, EntryType } from "../../../schemas/entry";
import { normalizeValidatorError, RESTWarp } from "../wrap";

export const privateEntryRouter = Router();

privateEntryRouter.get("/", RESTWarp(async (req, res) => {
    const entry = await Entry.findById(req.entry).select("-hash -salt");
    return res.RESTSend(entry);
}));

privateEntryRouter.post("/", RESTWarp(async (req, res) => {
    req.checkBody("email").isEmail();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    if (!req.admin) { throw new Error("Access denied"); }
    const entry = await Entry.findById(req.entry);
    entry.description = req.body.description;
    entry.email = req.body.email;
    if (req.body.password && entry.type === EntryType.user) {
        entry.setPassword(req.body.password);
    }
    await entry.save();
    return res.RESTEnd();
}));
