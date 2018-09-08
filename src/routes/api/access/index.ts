import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../../definitions/requests";
import { FileAccessRouter } from "./file";
import { ProblemAccessRouter } from "./problem";
import { SolutionAccessRouter } from "./solution";

export let AccessRouter = Router();

AccessRouter.use((req: IAuthorizedRequest, res: Response, next) => {
    try {
        if (!req.role.MAccess) { throw new Error("Access denied"); }
        next();
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

AccessRouter.use("/file", FileAccessRouter);
AccessRouter.use("/problem", ProblemAccessRouter);
AccessRouter.use("/solution", SolutionAccessRouter);
