import "./passport";

import { Router } from "express";
import { authenticate } from "passport";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entrymap";
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
import { RESTWrap } from "./util";

export const APIRouter = Router();

APIRouter.post("/register", RESTWrap((req, res) => {
    const entry = new Entry();
    entry._id = req.body.username;
    entry.email = req.body.email;
    entry.type = EntryType.user;
    entry.setPassword(req.body.password);
    entry.save()
        .then((saved) => res.RESTSend(saved._id))
        .catch((err) => res.RESTFail(err.message));
}));

APIRouter.post("/login", authenticate("local"), RESTWrap((req, res) => {
    return res.RESTSend(req.user);
}));

APIRouter.post("/logout", RESTWrap((req, res) => {
    if (!req.isAuthenticated()) { throw new Error("Not logged in"); }
    req.logout();
    res.RESTEnd();
}));

APIRouter.get("/session", RESTWrap(async (req, res) => {
    if (req.isAuthenticated()) {
        res.RESTSend({ user: req.user });
    } else {
        res.RESTFail({});
    }
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
