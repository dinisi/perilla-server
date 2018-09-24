import { Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Role } from "../../schemas/role";
import { User } from "../../schemas/user";
import { fileRouter } from "./file";
import { problemRouter } from "./problem";
import { roleRouter } from "./role";
import { solutionRouter } from "./solution";
import { userRouter } from "./user";

export let APIRouter = Router();

APIRouter.use("/file", fileRouter);
APIRouter.use("/problem", problemRouter);
APIRouter.use("/solution", solutionRouter);
APIRouter.use("/user", userRouter);
APIRouter.use("/role", roleRouter);

APIRouter.get("/session", async (req: IAuthorizedRequest, res) => {
    try {
        res.send({
            payload: {
                headers: req.headers,
                hostname: req.hostname,
                httpVersion: req.httpVersion,
                ips: req.ips,
                client: req.client,
            },
            status: "success",
        });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

// Authority control entity
APIRouter.get("/ace", async (req: IAuthorizedRequest, res) => {
    try {
        const search = new RegExp(req.query.search);
        const users = await User.find().where("username").regex(search).limit(10);
        const roles = await Role.find().where("rolename").regex(search).limit(10);
        const result = [];
        for (const user of users) {
            result.push({ id: user.id, name: user.username, type: "user" });
        }
        for (const role of roles) {
            result.push({ id: role.id, name: role.rolename, type: "role" });
        }
        res.send({ status: "success", payload: result });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
