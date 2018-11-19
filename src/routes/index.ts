import { Router } from "express";
import { join } from "path";
import { IRESTResponse } from "../interfaces/route";
import { APIRouter } from "./api";
import { RESTWrap } from "./api/util";
import { FrontEndRouter } from "./frontend";

export let MainRouter = Router();

MainRouter.use((req, res: IRESTResponse, next) => {
    res.RESTSend = (value: any) => {
        res.json({ status: "success", payload: value });
    };
    res.RESTFail = (message: any) => {
        res.json({ status: "failed", payload: message });
    };
    res.RESTEnd = () => {
        res.json({ status: "success" });
    };
    next();
});

MainRouter.get("/", RESTWrap(async (req, res) => {
    const { version } = require(join("..", "..", "package.json"));
    res.RESTSend({ version });
}));

MainRouter.use("/api", APIRouter);
MainRouter.use("/frontend", FrontEndRouter);
