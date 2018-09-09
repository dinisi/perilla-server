import { Response, Router } from "express";
import { IClient } from "../definitions/client";
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
        if (!user) { throw new Error("Not found"); }
        const roles = await Role.find().where("_id").in(user.roles).select("-_id rolename").exec();
        res.send({ status: "success", payload: roles });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

MainRouter.post("/login", async (req, res) => {
    try {
        if (req.query.a) { throw new Error("Already logged in"); }
        const user = await User.findOne().where("username").equals(req.body.username).exec();
        if (!user) { throw new Error("Not found"); }
        // 防止傻逼爆密码
        if (!user.validPassword(req.body.password)) { throw new Error("Unknow Error"); }
        const role = await Role.findOne().where("rolename").equals(req.body.rolename).where("_id").in(user.roles).exec();
        if (!role) { throw new Error("Not found"); }
        const client: IClient = {
            RoleID: role._id.toString(),
            UserID: user._id.toString(),
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
        res.send({ status: "success", payload: user._id });
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
            const valid = getVerificationCode(client.accessToken, client.clientID);
            if (!(valid === req.query.v)) { throw new Error("Access denied"); }
            const role = await Role.findById(client.RoleID);
            if (!role) { throw new Error("No such role"); }
            req.userID = client.UserID;
            req.roleID = client.RoleID;
            req.role = role;
            next();
        } catch (e) {
            res.send({ status: "failed", payload: e.message });
        }
    },
    APIRouter,
);
