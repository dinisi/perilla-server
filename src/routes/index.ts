import { Response, Router } from "express";
import { IClient } from "../definitions/client";
import { ServerError } from "../definitions/errors";
import { IAuthorizedRequest } from "../definitions/requests";
import { generateAccessToken, getClient, setClient } from "../redis";
import { Role } from "../schemas/role";
import { User } from "../schemas/user";
import { getVerificationCode } from "../verify";
import { APIRouter } from "./api";

export let MainRouter = Router();

MainRouter.get("/rolesof", async (req, res) => {
    try {
        const username: string = req.query.username;
        const user = await User.findOne({ username });
        if (!user) { throw new ServerError("Not found", 404); }
        const roles = await Role.find().where("_id").in(user.roles).select("-_id rolename description").exec();
        res.send(roles);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

MainRouter.post("/login", async (req, res) => {
    try {
        if (req.headers.authorization) { throw new ServerError("Already logged in", 403); }
        const user = await User.findOne().where("username").equals(req.body.username).exec();
        if (!user) { throw new ServerError("Not found", 404); }
        // 防止傻逼爆密码
        if (!user.validPassword(req.body.password)) { throw new ServerError("Unknow Error", 500); }
        const role = await Role.findOne().where("rolename").equals(req.body.rolename).where("_id").in(user.roles).exec();
        if (!role) { throw new ServerError("Not found", 404); }
        const client: IClient = {
            RoleID: role._id.toString(),
            UserID: user._id.toString(),
            accessToken: await generateAccessToken(),
            clientID: req.body.clientID,
        };
        const expire = 2 * 24 * 60 * 60;
        await setClient(client, expire);
        res.send({ authorization: client.accessToken });
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

MainRouter.use(
    "/api",
    async (req: IAuthorizedRequest, res: Response, next) => {
        try {
            if (!req.headers.authorization) { throw new ServerError("Not logged in", 403); }
            const client = await getClient(req.headers.authorization);
            const valid = getVerificationCode(client.accessToken, client.clientID);
            if (!(valid === req.query.v)) { throw new ServerError("Access denied", 403); }
            req.userID = client.UserID;
            req.roleID = client.RoleID;
            const role = await Role.findOne({ _id: client.RoleID });
            req.commonAccess = role.config;
            next();
        } catch (e) {
            if (e instanceof ServerError) {
                res.status(e.code).send(e.message);
            } else {
                res.status(500).send(e.message);
            }
        }
    },
    APIRouter,
);
