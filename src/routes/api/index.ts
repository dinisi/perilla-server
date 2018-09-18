import { Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { accessRouter } from "./access";
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
APIRouter.use("/access", accessRouter);

APIRouter.get("/session", async (req: IAuthorizedRequest, res) => {
    try {
        res.send({
            payload: {
                headers: req.headers,
                hostname: req.hostname,
                httpVersion: req.httpVersion,
                ips: req.ips,
                user: req.user,
            },
            status: "success",
        });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
