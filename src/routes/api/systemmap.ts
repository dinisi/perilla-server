/**
 * systemmap.ts
 * POST   /
 * DELETE /
 * LIST   /
 */

import { Router } from "express";
import { ERR_NOT_FOUND } from "../../constant";
import { Entry, EntryType } from "../../schemas/entry";
import { SystemMap } from "../../schemas/systemmap";
import { ensure, isLoggedin, isSystemAdmin, PaginationWrap, RESTWrap } from "./util";

export const SystemMapRouter = Router();

SystemMapRouter.post("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    if (!await SystemMap.findOne({ user: req.query.user })) {
        const entry = await Entry.findOne({ _id: req.query.user, type: EntryType.user });
        ensure(entry, ERR_NOT_FOUND);
        const map = new SystemMap();
        map.user = req.query.user;
        await map.save();
    }
    return res.RESTEnd();
}));

SystemMapRouter.delete("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    const map = await SystemMap.findOne({ user: req.query.user });
    if (!map) { throw new Error(ERR_NOT_FOUND); }
    await map.remove();
    return res.RESTEnd();
}));

SystemMapRouter.get("/list", PaginationWrap(() => SystemMap.find()));
