import { Router } from "express";
import { verify } from "jsonwebtoken";
import { config } from "../../../config";
import { RESTWrap } from "../util";
import { adminRouter } from "./admin";
import { ArticleRouter } from "./article";
import { EntryRouter } from "./entry";
import { EntrymapRouter } from "./entrymap";
import { FileRouter } from "./file";
import { JudgerRouter } from "./judger";
import { MiscRouter } from "./misc";
import { ProblemRouter } from "./problem";
import { SolutionRouter } from "./solution";
import { SystemMapRouter } from "./systemmap";

export const APIRouter = Router();

APIRouter.use(RESTWrap(async (req, res, next) => {
    const token = req.headers["x-access-token"] || (req.body && req.body.access_token) || (req.query && req.query.access_token);
    if (typeof token === "string" && token) {
        const decoded = verify(token, config.secret) as any;
        req.user = decoded._id as string;
    }
    return next();
}));

APIRouter.use("/admin", adminRouter);
APIRouter.use("/article", ArticleRouter);
APIRouter.use("/entry", EntryRouter);
APIRouter.use("/entrymap", EntrymapRouter);
APIRouter.use("/file", FileRouter);
APIRouter.use("/judger", JudgerRouter);
APIRouter.use("/misc", MiscRouter);
APIRouter.use("/problem", ProblemRouter);
APIRouter.use("/solution", SolutionRouter);
APIRouter.use("/systemmap", SystemMapRouter);