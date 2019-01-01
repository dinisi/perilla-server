import { Router } from "express";
import { PACKAGE_PATH } from "../../constant";
import { IRESTResponse } from "../../interfaces/route";
import { APIRouter } from "./api";
import { AuthRouter } from "./auth";
import { FrontendRouter } from "./frontend";
import { RESTWrap } from "./util";

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
    return next();
});

MainRouter.get("/version", RESTWrap(async (req, res) => {
    const { version } = require(PACKAGE_PATH);
    res.RESTSend({ version });
}));

MainRouter.use("/api", APIRouter);
MainRouter.use("/auth", AuthRouter);
MainRouter.use("/", FrontendRouter);
