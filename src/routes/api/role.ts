import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Role } from "../../schemas/role";
import { validPaginate } from "../common";

export let RoleRouter = Router();

RoleRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MRole) { throw new Error("No access"); }
        const role = new Role();
        role.rolename = req.body.rolename;
        role.description = req.body.description;
        role.MUser = req.body.MUser;
        role.MRole = req.body.MRole;
        role.CProblem = req.body.CProblem;
        role.CFile = req.body.CFile;
        role.MAccess = req.body.MAccess;
        await role.save();
        res.send({ status: "success", payload: role._id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

RoleRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
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

RoleRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = Role.find();
        if (req.query.rolename) {
            query = query.where("rolename").equals(req.query.rolename);
        }
        if (req.query.search) {
            query = query.where("rolename").regex(new RegExp(req.query.search));
        }
        query = query.skip(req.query.skip).limit(req.query.limit);
        const roles = query.select("_id rolename description").exec();
        res.send({ status: "success", payload: roles });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

RoleRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) { throw new Error("Not found"); }
        res.send({ status: "success", payload: role });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

RoleRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const role = await Role.findById(req.params.id).select("-_id rolename").exec();
        if (!role) { throw new Error("Not found"); }
        res.send({ status: "success", payload: role });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

RoleRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MRole) { throw new Error("No access"); }
        const role = await Role.findById(req.params.id);
        if (!role) { throw new Error("Not found"); }
        if (role._protected) { throw new Error("Object is protected"); }
        role.rolename = req.body.rolename;
        role.description = req.body.description;
        role.MUser = req.body.MUser;
        role.MRole = req.body.MRole;
        role.CProblem = req.body.CProblem;
        role.CFile = req.body.CFile;
        role.MAccess = req.body.MAccess;
        await role.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

RoleRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MRole) { throw new Error("No access"); }
        const role = await Role.findById(req.params.id);
        if (!role) { throw new Error("Not found"); }
        if (role._protected) { throw new Error("Object is protected"); }
        await role.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
