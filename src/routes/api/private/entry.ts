import { Router } from "express";
import { IRESTRequest } from "../../../interfaces/route";
import { Entry, EntryType } from "../../../schemas/entry";
import { RESTWarp } from "../wrap";

export const privateEntryRouter = Router();

privateEntryRouter.get("/", RESTWarp(async (req, res) => {
    const entry = await Entry.findById(req.entry).select("-hash -salt");
    res.RESTSend(entry);
}));

privateEntryRouter.post("/", RESTWarp(async (req, res) => {
    if (!req.admin) { throw new Error("Access denied"); }
    const entry = await Entry.findById(req.entry);
    if (req.body.description) {
        entry.description = req.body.description;
    }
    if (req.body.email) {
        entry.email = req.body.email;
    }
    if (req.body.password && entry.type === EntryType.user) {
        entry.setPassword(req.body.password);
    }
    await entry.save();
    res.RESTEnd();
}));
