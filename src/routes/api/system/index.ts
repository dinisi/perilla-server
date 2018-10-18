import { Router } from "express";
import { SystemMap } from "../../../schemas/systemMap";
import { RESTWarp } from "../wrap";

export const SystemAPIRouter = Router();

SystemAPIRouter.use(RESTWarp((req, res, next) => {
    if (!req.isAuthenticated()) { throw new Error("Not logged in"); }
    const map = SystemMap.findOne({ user: req.user });
    if (!map) { throw new Error("Access denied"); }
}));
