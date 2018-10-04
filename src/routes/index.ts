import { Response, Router } from "express";
import express = require("express");
import { join } from "path";
import { config } from "../config";
import { IClient, IPendingUser } from "../definitions/cache";
import { IAuthorizedRequest } from "../definitions/requests";
import { sendMail } from "../mail";
import { generateAccessToken, generateRegisterToken, getClient, getPendingUser, setClient, setPendingUser } from "../redis";
import { Role } from "../schemas/role";
import { User } from "../schemas/user";
import { getBaseURL } from "../utils";
import { APIRouter } from "./api";

export let MainRouter = Router();

MainRouter.post("/login", async (req, res) => {
    try {
        if (req.query.a) { throw new Error("Already logged in"); }
        const user = await User.findOne().where("username").equals(req.body.username).exec();
        if (!user) { throw new Error("Not found"); }
        if (!user.validPassword(req.body.password)) { throw new Error("Unknow Error"); }
        // tslint:disable-next-line:no-shadowed-variable
        const config = user.config;
        const roles: string[] = [user.id];
        for (const roleID of user.roles) {
            const role = await Role.findById(roleID);
            if (role) {
                roles.push(roleID);
                for (const name in config) {
                    if (typeof config[name] === "boolean") {
                        config[name] = config[name] || role.config[name];
                    } else if (typeof config[name] === "number") {
                        config[name] = Math.min(config[name] as number, role.config[name] as number);
                    }
                }
            }
        }
        const client: IClient = {
            userID: user.id,
            accessToken: await generateAccessToken(),
            clientID: req.body.clientID,
            roles,
            config,
            lastVisit: +new Date(),
            lastSolutionCreation: -1,
            expire: 2 * 24 * 60 * 60,
        };
        await setClient(client);
        res.send({ status: "success", payload: client.accessToken });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

if (config.mail.enabled) {
    MainRouter.post("/register", async (req, res) => {
        try {
            if (req.query.a) { throw new Error("Already logged in"); }
            const token = await generateRegisterToken();
            const user: IPendingUser = {
                username: req.body.username,
                realname: req.body.realname,
                email: req.body.email,
                password: req.body.password,
            };
            await setPendingUser(user, token, 2 * 60 * 60);
            await sendMail(req.body.email, "Active account", `Please click <a href="${getBaseURL(config.http.hostname, config.http.port)}/active?token=${token}">link</a> to active your account`);
            res.send({ status: "success" });
        } catch (e) {
            console.log(e.message);
            res.send({ status: "failed", payload: e.message });
        }
    });
    MainRouter.get("/active", async (req, res) => {
        try {
            const token = req.query.token;
            const pendingUser = await getPendingUser(token);
            await setPendingUser(pendingUser, token, 0);
            const user = new User();
            user.username = pendingUser.username;
            user.realname = pendingUser.realname;
            user.email = pendingUser.email;
            user.setPassword(pendingUser.password);
            await user.save();
            res.send({ status: "success", payload: user.id });
        } catch (e) {
            res.send({ status: "failed", payload: e.message });
        }
    });
} else {
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
}

MainRouter.use(
    "/api",
    async (req: IAuthorizedRequest, res: Response, next) => {
        try {
            if (!req.query.a) { throw new Error("Not logged in"); }
            const client = await getClient(req.query.a);
            if (!client) { throw new Error("Invalid query"); }
            const validCode = client.clientID;
            if (!(validCode === req.query.c)) { throw new Error("Access denied"); }
            req.client = client;
            client.lastVisit = +new Date();
            await setClient(client);
            next();
        } catch (e) {
            res.send({ status: "failed", payload: e.message });
        }
    },
    APIRouter,
);

const UIPath = join(__dirname, "..", "..", "ui", "dist");

MainRouter.use(express.static(join(UIPath)));

// Redirt all unmatched routes to root
MainRouter.get("/*", (req, res) => {
    res.sendFile(join(UIPath, "index.html"));
});
