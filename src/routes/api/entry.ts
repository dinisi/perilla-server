import { Router } from "express";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entryMap";
import { extendQuery, isEntryAdmin, isLoggedin, normalizeValidatorError, PaginationGuard, RESTWrap, verifyValidation } from "./util";

export const EntryRouter = Router();

EntryRouter.post("/create", isLoggedin, RESTWrap(async (req, res) => {
    req.checkBody("name", "Invalid body: name").isString();
    req.checkBody("email", "Invalid body: email").isEmail();
    verifyValidation(req.validationErrors());

    const entry = new Entry();
    entry._id = req.body.name;
    entry.email = req.body.email;
    entry.description = req.body.description;
    entry.type = EntryType.group;
    await entry.save();
    const map = new EntryMap();
    map.from = req.user;
    map.to = entry._id;
    map.admin = true;
    await map.save();
    res.RESTSend(entry._id);
}));

EntryRouter.get("/", RESTWrap(async (req, res) => {
    const entry = await Entry.findById(req.query.entry).select("-hash -salt");
    return res.RESTSend(entry);
}));

EntryRouter.post("/", isLoggedin, isEntryAdmin, RESTWrap(async (req, res) => {
    req.checkBody("email", "Invalid body: email").isEmail();
    verifyValidation(req.validationErrors());

    const entry = await Entry.findById(req.query.entry);
    entry.description = req.body.description;
    entry.email = req.body.email;
    if (req.body.password && entry.type === EntryType.user) {
        entry.setPassword(req.body.password);
    }
    await entry.save();
    return res.RESTEnd();
}));

// Public to everyone

EntryRouter.get("/count", RESTWrap(async (req, res) => {
    let query = Entry.find();
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

EntryRouter.get("/list", PaginationGuard, RESTWrap(async (req, res) => {
    let query = Entry.find();
    query = query.select("_id description email created type");
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));
