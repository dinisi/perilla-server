import * as Ajv from "ajv";
import { Response, Router } from "express";
import { readFileSync } from "fs-extra";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Role } from "../../schemas/role";
import { validPaginate } from "../common";

export let roleRouter = Router();
const ajv = new Ajv();
const validate = ajv.compile(JSON.parse(readFileSync("schemas/configuration.json").toString()));

roleRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.manageSystem) { throw new Error("Access denied"); }
        const role = new Role();
        role.rolename = req.body.rolename;
        role.description = req.body.description;
        await role.save();
        res.send({ status: "success", payload: role.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

roleRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Role.find();
        if (req.query.rolename) {
            query = query.where("rolename").equals(req.query.rolename);
        }
        if (req.query.search) {
            query = query.where("rolename").regex(new RegExp(req.query.search));
        }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

roleRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Role.find();
        if (req.query.rolename) {
            query = query.where("rolename").equals(req.query.rolename);
        }
        if (req.query.search) {
            query = query.where("rolename").regex(new RegExp(req.query.search));
        }
        query = query.skip(req.query.skip).limit(req.query.limit);
        const roles = await query.select("_id rolename description").exec();
        res.send({ status: "success", payload: roles });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

roleRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) { throw new Error("Not found"); }
        res.send({ status: "success", payload: role });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

roleRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const role = await Role.findById(req.params.id).select("rolename").exec();
        if (!role) { throw new Error("Not found"); }
        res.send({ status: "success", payload: role });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

roleRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.manageSystem) { throw new Error("Access denied"); }
        const role = await Role.findById(req.params.id);
        if (!role) { throw new Error("Not found"); }
        if (role._protected) { throw new Error("Object is protected"); }
        const valid = validate(req.body.config);
        if (!valid) { throw new Error("Invalid config"); }
        role.rolename = req.body.rolename;
        role.description = req.body.description;
        role.config = req.body.config;
        await role.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

roleRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.manageSystem) { throw new Error("Access denied"); }
        const role = await Role.findById(req.params.id);
        if (!role) { throw new Error("Not found"); }
        if (role._protected) { throw new Error("Object is protected"); }
        await role.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
