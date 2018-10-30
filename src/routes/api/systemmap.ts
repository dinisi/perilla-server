import { Router } from "express";
import { SystemMap } from "../../schemas/systemMap";
import { extendQuery, isLoggedin, isSystemAdmin, PaginationGuard, RESTWrap } from "./util";

export const SystemMapRouter = Router();

SystemMapRouter.get("/count", RESTWrap(async (req, res) => {
    let query = SystemMap.find();
    query = extendQuery(query, req);
    return res.RESTSend(await query.countDocuments());
}));

SystemMapRouter.get("/list", PaginationGuard, RESTWrap(async (req, res) => {
    let query = SystemMap.find();
    query = extendQuery(query, req);
    const result = await query.skip(req.pagination.skip).limit(req.pagination.limit);
    return res.RESTSend(result);
}));

SystemMapRouter.post("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("user").isString();
    if (!await SystemMap.findOne({ user: req.query.user })) {
        const map = new SystemMap();
        map.user = req.query.user;
        await map.save();
    }
    return res.RESTEnd();
}));

SystemMapRouter.delete("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    req.checkQuery("user").isString();
    const map = await SystemMap.findOne({ user: req.query.user });
    if (!map) { throw new Error("Not found"); }
    await map.remove();
    return res.RESTEnd();
}));
