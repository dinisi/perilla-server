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
    res.RESTEnd = () => {
        res.send({ status: "success" });
    };
    next();
});

MainRouter.use("/api", APIRouter);
