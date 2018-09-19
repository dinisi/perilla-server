import { Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Access } from "../../schemas/access";
import { verifyAccess } from "../../utils";

export let accessRouter = Router();

accessRouter.use(async (req: IAuthorizedRequest, res, next) => {
    try {
        if (!await verifyAccess(req.body, "manageSystem")) { throw new Error("Access denied"); }
        next();
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

accessRouter.get("/:name", async (req: IAuthorizedRequest, res) => {
    try {
        const access = await Access.findOne().where("accessName").equals(req.params.name);
        res.send({ status: "success", payload: access });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

accessRouter.post("/:name", async (req: IAuthorizedRequest, res) => {
    try {
        const access = await Access.findOne().where("accessName").equals(req.params.name);
        access.roles = req.body.roles;
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
