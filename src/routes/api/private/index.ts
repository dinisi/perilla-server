import { Router } from "express";
import { IRESTRequest, IRESTResponse } from "../../../interfaces/route";
import { EntryMap } from "../../../schemas/entryMap";

export const PrivateAPIRouter = Router();
const PrivateAPI = Router();

PrivateAPIRouter.use("/:entry", (req: IRESTRequest, res: IRESTResponse, next) => {
    if (req.isAuthenticated()) {
        EntryMap.findOne({ from: req.user, to: req.params.entry })
            .then((map) => {
                if (!map) { return res.RESTFail("not such resource"); }
                req.entry = req.params.entry;
                req.admin = map.admin;
                return next();
            })
            .catch((err) => res.RESTFail(err.message));
    } else {
        res.RESTFail("please login");
    }
}, PrivateAPI);

PrivateAPI.get("/", (req: IRESTRequest, res: IRESTResponse) => {
    res.RESTSend({ entry: req.entry, admin: req.admin });
});
