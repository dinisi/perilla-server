import { Response, Router } from "express";
import { ServerError } from "../../../definitions/errors";
import { IAuthorizedRequest } from "../../../definitions/requests";
import { FileAccessRouter } from "./file";
import { ProblemAccessRouter } from "./problem";
import { SolutionAccessRouter } from "./solution";

export let AccessRouter = Router();

AccessRouter.use((req: IAuthorizedRequest, res: Response, next) => {
    try {
        if (!req.role.MAccess) { throw new ServerError("Access denied", 403); }
        next();
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

AccessRouter.use("/file", FileAccessRouter);
AccessRouter.use("/problem", ProblemAccessRouter);
AccessRouter.use("/solution", SolutionAccessRouter);
