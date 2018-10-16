import { Router } from "express";
import * as express from "express";
import { join } from "path";
import { IRESTResponse } from "../interfaces/route";
import { APIRouter } from "./api";

export let MainRouter = Router();

MainRouter.use((req, res: IRESTResponse, next) => {
    res.RESTSend = (value: any) => {
        res.send({ status: "success", payload: value });
    };
    res.RESTFail = (message: any) => {
        res.send({ status: "failed", payload: message });
    };
    next();
});

MainRouter.use("/api", APIRouter);

const UIPath = join(__dirname, "..", "..", "ui", "dist");

MainRouter.use(express.static(join(UIPath)));

// Redirt all unmatched routes to root
MainRouter.get("/*", (req, res) => {
    res.sendFile(join(UIPath, "index.html"));
});

MainRouter.use((err: Error, req: express.Request, res: IRESTResponse) => {
    res.RESTFail(err.message);
});
