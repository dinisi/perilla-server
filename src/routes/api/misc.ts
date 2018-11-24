import { Router } from "express";
import { authenticate } from "passport";
import { ERR_NOT_LOGGED_IN } from "../../constant";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entrymap";
import { isLoggedin, PaginationWrap, RESTWrap } from "./util";

export const MiscRouter = Router();

MiscRouter.post("/register", RESTWrap((req, res) => {
    const entry = new Entry();
    entry._id = req.body.username;
    entry.email = req.body.email;
    entry.type = EntryType.user;
    entry.setPassword(req.body.password);
    entry.save()
        .then((saved) => res.RESTSend(saved._id))
        .catch((err) => res.RESTFail(err.message));
}));

MiscRouter.post("/login", authenticate("local"), RESTWrap((req, res) => {
    return res.RESTSend(req.user);
}));

MiscRouter.post("/logout", RESTWrap((req, res) => {
    if (!req.isAuthenticated()) { throw new Error(ERR_NOT_LOGGED_IN); }
    req.logout();
    res.RESTEnd();
}));

MiscRouter.get("/session", RESTWrap(async (req, res) => {
    if (req.isAuthenticated()) {
        res.RESTSend({ user: req.user });
    } else {
        res.RESTFail({});
    }
}));

MiscRouter.post("/creategroup", isLoggedin, RESTWrap(async (req, res) => {
    const entry = new Entry();
    entry._id = req.body.name;
    entry.email = req.body.email;
    entry.type = EntryType.group;
    await entry.save();
    const entrymap = new EntryMap();
    entrymap.from = req.user;
    entrymap.to = entry._id;
    entrymap.admin = true;
    await entrymap.save();
    res.RESTSend(entry._id);
}));

MiscRouter.get("/accessible", isLoggedin, PaginationWrap((req) => {
    let query = EntryMap.find({ from: req.user });
    if (req.query.search !== undefined) {
        query = query.where("to").regex(new RegExp(req.query.search.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, "\\$&"), "g"));
    }
    return query;
}));
