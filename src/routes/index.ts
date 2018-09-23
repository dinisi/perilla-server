import { Response, Router } from "express";
import { IClient } from "../definitions/client";
import { IAuthorizedRequest } from "../definitions/requests";
import { generateAccessToken, getClient, setClient } from "../redis";
import { User } from "../schemas/user";
import { getVerificationCode } from "../utils";
import { APIRouter } from "./api";

export let MainRouter = Router();

MainRouter.post("/login", async (req, res) => {
    try {
        if (req.query.a) { throw new Error("Already logged in"); }
        const user = await User.findOne().where("username").equals(req.body.username).exec();
        if (!user) { throw new Error("Not found"); }
        if (!user.validPassword(req.body.password)) { throw new Error("Unknow Error"); }
        const client: IClient = {
            UserID: user.id,
            accessToken: await generateAccessToken(),
            clientID: req.body.clientID,
        };
        const expire = 2 * 24 * 60 * 60;
        await setClient(client, expire);
        res.send({ status: "success", payload: client.accessToken });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

MainRouter.post("/register", async (req, res) => {
    try {
        if (req.query.a) { throw new Error("Already logged in"); }
        const user = new User();
        user.username = req.body.username;
        user.realname = req.body.realname;
        user.email = req.body.email;
        user.setPassword(req.body.password);
        await user.save();
        res.send({ status: "success", payload: user.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

MainRouter.use(
    "/api",
    async (req: IAuthorizedRequest, res: Response, next) => {
        try {
            if (!req.query.a) { throw new Error("Not logged in"); }
            const client = await getClient(req.query.a);
            if (!client) { throw new Error("Invalid query"); }
            const validCode = client.clientID;
            if (!(validCode === req.query.c)) { throw new Error("Access denied"); }
            const user = await User.findById(client.UserID);
            req.user = user;
            next();
        } catch (e) {
            res.send({ status: "failed", payload: e.message });
        }
    },
    APIRouter,
);
