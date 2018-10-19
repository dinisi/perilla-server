import { Router } from "express";
import { SystemMap } from "../../../schemas/systemMap";
import { RESTWarp } from "../wrap";
import { systemEntryRouter } from "./entry";
import { systemEntryMapRouter } from "./entrymap";
import { systemFileRouter } from "./file";
import { systemProblemRouter } from "./problem";
import { SystemSolutionRouter } from "./solution";
import { SystemMapRouter } from "./systemmap";

export const SystemAPIRouter = Router();

SystemAPIRouter.use(RESTWarp(async (req, res, next) => {
    if (!req.isAuthenticated()) { throw new Error("Not logged in"); }
    const map = await SystemMap.findOne({ user: req.user });
    if (!map) { throw new Error("Access denied"); }
    next();
}));

SystemAPIRouter.use("/entry", systemEntryRouter);
SystemAPIRouter.use("/entrymap", systemEntryMapRouter);
SystemAPIRouter.use("/file", systemFileRouter);
SystemAPIRouter.use("/problem", systemProblemRouter);
SystemAPIRouter.use("/solution", SystemSolutionRouter);
SystemAPIRouter.use("/systemmap", SystemMapRouter);
