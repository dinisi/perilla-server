import { Router } from "express";
import { authenticate } from "passport";
import { IRESTResponse } from "../../interfaces/route";
import { Entry, EntryType } from "../../schemas/entry";
import "./passport";
import { PrivateAPIRouter } from "./private";
import { PublicAPIRouter } from "./public";

export const APIRouter = Router();

APIRouter.post("/register", async (req, res: IRESTResponse) => {
    req.checkBody("_id", "Invalid username");
    req.checkBody("password", "Invalid password").isString();
    req.checkBody("email", "Invalid email");
    const entry = new Entry();
    entry._id = req.body._id;
    entry.email = req.body.email;
    entry.type = EntryType.user;
    entry.setPassword(req.body.password);
    await entry.save();
});

APIRouter.post("/login", authenticate("local"), (req, res: IRESTResponse) => {
    res.RESTSend(req.user);
});

APIRouter.use("/public", PublicAPIRouter);
APIRouter.use("/private", PrivateAPIRouter);
