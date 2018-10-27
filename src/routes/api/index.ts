import "./passport";

import { Router } from "express";
import { authenticate } from "passport";
import { Entry, EntryType } from "../../schemas/entry";
import { EntryMap } from "../../schemas/entryMap";
import { commonRouter } from "./common";
import { PrivateAPIRouter } from "./private";
import { PublicAPIRouter } from "./public";
import { SystemAPIRouter } from "./system";
import { normalizeValidatorError, RESTWarp } from "./util";

export const APIRouter = Router();

APIRouter.post("/register", RESTWarp((req, res) => {
    req.checkBody("username", "Invalid body: username");
    req.checkBody("password", "Invalid body: password").isString();
    req.checkBody("email", "Invalid body: email").isEmail();
    const errors = req.validationErrors();
    if (errors) {
        return res.RESTFail(normalizeValidatorError(errors));
    } else {
        const entry = new Entry();
        entry._id = req.body.username;
        entry.email = req.body.email;
        entry.type = EntryType.user;
        entry.setPassword(req.body.password);
        entry.save()
            .then((saved) => res.RESTSend(saved._id))
            .catch((err) => res.RESTFail(err.message));
    }
}));

APIRouter.post("/login", authenticate("local"), RESTWarp((req, res) => {
    return res.RESTSend(req.user);
}));

APIRouter.post("/logout", RESTWarp((req, res) => {
    if (!req.isAuthenticated()) { throw new Error("Not logged in"); }
    req.logout();
    res.RESTEnd();
}));

APIRouter.get("/session", RESTWarp(async (req, res) => {
    if (req.isAuthenticated()) {
        const entries = await EntryMap.find({ from: req.user });
        res.RESTSend({ entries: entries.map((x) => x.to) });
    } else {
        res.RESTFail({});
    }
}));

APIRouter.use("/public", PublicAPIRouter);
APIRouter.use("/private", PrivateAPIRouter);
APIRouter.use("/system", SystemAPIRouter);
APIRouter.use("/common", commonRouter);
