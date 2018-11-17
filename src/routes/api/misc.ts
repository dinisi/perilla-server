import { Router } from "express";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entrymap";
import { isLoggedin, RESTWrap } from "./util";

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
