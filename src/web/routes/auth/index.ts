import { Router } from "express";
import { sign } from "jsonwebtoken";
import { config } from "../../../config";
import { ERR_ACCESS_DENIED, ERR_INVALID_REQUEST, ERR_NOT_FOUND } from "../../../constant";
import { Entry, EntryType } from "../../../schemas/entry";
import { ensure, RESTWrap } from "../util";

export const AuthRouter = Router();

AuthRouter.post("/register", RESTWrap(async (req, res) => {
    const entry = new Entry();
    entry._id = req.body.username;
    entry.email = req.body.email;
    entry.type = EntryType.user;
    entry.setPassword(req.body.password);
    await entry.save();
    res.RESTSend(entry._id);
}));

AuthRouter.post("/login", RESTWrap(async (req, res) => {
    const entry = await Entry.findById(req.body.username);
    ensure(entry, ERR_NOT_FOUND);
    if (entry.type !== EntryType.user) { throw new Error(ERR_INVALID_REQUEST); }
    ensure(entry.validPassword(req.body.password), ERR_ACCESS_DENIED);
    const token = sign({ _id: entry._id }, config.secret, { expiresIn: "1d" });
    return res.RESTSend(token);
}));
