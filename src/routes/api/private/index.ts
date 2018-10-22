import { Router } from "express";
import { IRESTRequest, IRESTResponse } from "../../../interfaces/route";
import { EntryMap } from "../../../schemas/entryMap";
import { normalizeValidatorError, RESTWarp } from "../wrap";
import { privateEntryRouter } from "./entry";
import { privateEntrymapRouter } from "./entrymap";
import { privateFileRouter } from "./file";
import { privateProblemRouter } from "./problem";
import { privateSolutionRouter } from "./solution";

export const PrivateAPIRouter = Router();

PrivateAPIRouter.use(RESTWarp(async (req, res, next) => {
    if (!req.isAuthenticated()) { throw new Error("Not logged in"); }
    req.checkQuery("entry", "Invalid entry").isString().notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        throw new Error(normalizeValidatorError(errors));
    }
    const map = await EntryMap.findOne({ from: req.user, to: req.query.entry });
    if (!map) { throw new Error("Access denied"); }
    req.admin = map.admin;
    return next();
}));

PrivateAPIRouter.get("/", (req: IRESTRequest, res: IRESTResponse) => {
    return res.RESTSend({ admin: req.admin });
});

PrivateAPIRouter.use("/entry", privateEntryRouter);
PrivateAPIRouter.use("/entrymap", privateEntrymapRouter);
PrivateAPIRouter.use("/file", privateFileRouter);
PrivateAPIRouter.use("/problem", privateProblemRouter);
PrivateAPIRouter.use("/solution", privateSolutionRouter);
