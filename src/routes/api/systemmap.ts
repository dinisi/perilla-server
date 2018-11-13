import { Router } from "express";
import { SystemMap } from "../../schemas/systemmap";
import { isLoggedin, isSystemAdmin, PaginationWrap, RESTWrap } from "./util";

export const SystemMapRouter = Router();

SystemMapRouter.post("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    if (!await SystemMap.findOne({ user: req.query.user })) {
        const map = new SystemMap();
        map.user = req.query.user;
        await map.save();
    }
    return res.RESTEnd();
}));

SystemMapRouter.delete("/", isLoggedin, isSystemAdmin, RESTWrap(async (req, res) => {
    const map = await SystemMap.findOne({ user: req.query.user });
    if (!map) { throw new Error("Not found"); }
    await map.remove();
    return res.RESTEnd();
}));

SystemMapRouter.get("/list", PaginationWrap(() => SystemMap.find()));
