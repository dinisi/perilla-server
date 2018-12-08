import { Router } from "express";
import { ERR_NOT_LOGGED_IN } from "../../constant";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entrymap";
import { isLoggedin, PaginationWrap, RESTWrap } from "../util";

export const MiscRouter = Router();

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
