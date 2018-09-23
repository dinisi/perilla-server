import { Response, Router } from "express";
import { IClient } from "../definitions/client";
import { IAuthorizedRequest } from "../definitions/requests";
import { generateAccessToken, getClient, setClient } from "../redis";
import { Role } from "../schemas/role";
import { User } from "../schemas/user";
import { APIRouter } from "./api";

export let MainRouter = Router();

MainRouter.post("/login", async (req, res) => {
    try {
        if (req.query.a) { throw new Error("Already logged in"); }
        const user = await User.findOne().where("username").equals(req.body.username).exec();
        if (!user) { throw new Error("Not found"); }
        if (!user.validPassword(req.body.password)) { throw new Error("Unknow Error"); }
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
