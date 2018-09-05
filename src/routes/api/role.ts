import { Response, Router } from "express";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Role } from "../../schemas/role";

export let RoleRouter = Router();

RoleRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MRole) { throw new ServerError("No access", 403); }
        const role = new Role();
        role.rolename = req.body.rolename;
        role.description = req.body.description;
        role.MUser = req.body.MUser;
        role.MRole = req.body.MRole;
        role.CProblem = req.body.CProblem;
        role.CFile = req.body.CFile;
        role.MAccess = req.body.MAccess;
        await role.save();
        res.send(role._id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

RoleRouter.get("/list", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const roles = await Role.find().select("_id rolename description").exec();
        res.send(roles);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

RoleRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) { throw new ServerError("Not found", 404); }
        res.send(role);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

RoleRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MRole) { throw new ServerError("No access", 403); }
        const role = await Role.findById(req.params.id);
        if (!role) { throw new ServerError("Not found", 404); }
        if (role._protected) { throw new ServerError("Object is protected", 403); }
        role.rolename = req.body.rolename;
        role.description = req.body.description;
        role.MUser = req.body.MUser;
        role.MRole = req.body.MRole;
        role.CProblem = req.body.CProblem;
        role.CFile = req.body.CFile;
        role.MAccess = req.body.MAccess;
        await role.save();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

RoleRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MRole) { throw new ServerError("No access", 403); }
        const role = await Role.findById(req.params.id);
        if (!role) { throw new ServerError("Not found", 404); }
        if (role._protected) { throw new ServerError("Object is protected", 403); }
        await role.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
