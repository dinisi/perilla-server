import { Router } from "express";
import { sign } from "jsonwebtoken";
import { config } from "../../../config";
import { ERR_ACCESS_DENIED, ERR_INVALID_REQUEST, ERR_NOT_FOUND } from "../../../constant";
import { Entry, EntryType } from "../../../schemas/entry";
import { RESTWrap } from "../util";

export const AuthRouter = Router();

AuthRouter.post("/register", RESTWrap((req, res) => {
    const entry = new Entry();
    entry._id = req.body.username;
    entry.email = req.body.email;
    entry.type = EntryType.user;
    entry.setPassword(req.body.password);
    entry.save()
        .then((saved) => res.RESTSend(saved._id))
        .catch((err) => res.RESTFail(err.message));
}));

AuthRouter.post("/login", RESTWrap(async (req, res) => {
    const entry = await Entry.findById(req.body.username);
    if (!entry) { throw new Error(ERR_NOT_FOUND); }
    if (entry.type !== EntryType.user) { throw new Error(ERR_INVALID_REQUEST); }
    if (!entry.validPassword(req.body.password)) { throw new Error(ERR_ACCESS_DENIED); }
    const token = sign(entry._id, config.secret, { expiresIn: "1d" });
    return res.RESTSend(token);
}));
