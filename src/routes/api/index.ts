import { Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { AccessRouter } from "./access";
import { FileRouter } from "./file";
import { ProblemRouter } from "./problem";
import { RoleRouter } from "./role";
import { SolutionRouter } from "./solution";
import { UserRouter } from "./user";

export let APIRouter = Router();

APIRouter.use("/access", AccessRouter);

APIRouter.use("/file", FileRouter);
APIRouter.use("/problem", ProblemRouter);
APIRouter.use("/solution", SolutionRouter);
APIRouter.use("/user", UserRouter);
APIRouter.use("/role", RoleRouter);

APIRouter.get("/session", async (req: IAuthorizedRequest, res) => {
    try {
        res.send({
            payload: {
                headers: req.headers,
                hostname: req.hostname,
                httpVersion: req.httpVersion,
                ips: req.ips,
                role: req.role,
                roleID: req.roleID,
                userID: req.userID,
            },
            status: "success",
        });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
