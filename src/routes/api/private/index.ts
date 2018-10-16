import { Router } from "express";
import { IPrivateRequest, IRESTResponse } from "../../../interfaces/route";
import { EntryMap } from "../../../schemas/entryMap";

export const PrivateAPIRouter = Router();
const PrivateAPI = Router();

PrivateAPIRouter.use("/:entry", (req: IPrivateRequest, res: IRESTResponse, next) => {
    if (req.isAuthenticated()) {
        EntryMap.findOne({ from: req.user, to: req.params.entry })
            .then((map) => {
                if (!map) { return res.RESTFail("not such resource"); }
                req.entry = req.params.entry;
                req.admin = map.admin;
            })
            .catch((err) => res.RESTFail(err.message));
        next();
    } else {
        res.RESTFail("please login");
    }
}, PrivateAPI);

PrivateAPI.get("/", (req: IPrivateRequest, res: IRESTResponse) => {
    res.RESTSend({ entry: req.entry, admin: req.admin });
});
