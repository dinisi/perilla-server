import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Role } from "../../schemas/role";
import { User } from "../../schemas/user";
import { validPaginate } from "../common";

export let UserRouter = Router();

UserRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MUser) { throw new Error("No access"); }
        const user = new User();
        user.username = req.body.username;
        user.realname = req.body.realname;
        user.roles = req.body.roles;
        user.setPassword(req.body.password);
        await user.save();
        res.send({ status: "success", payload: user.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

UserRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = User.find();

        if (req.query.username) { query = query.where("username").equals(req.query.username); }
        if (req.query.realname) { query = query.where("realname").equals(req.query.realname); }
        if (req.query.email) { query = query.where("email").equals(req.query.email); }
        if (req.query.roles) { query = query.where("roles").all(req.query.roles); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

UserRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = User.find();

        if (req.query.username) { query = query.where("username").equals(req.query.username); }
        if (req.query.realname) { query = query.where("realname").equals(req.query.realname); }
        if (req.query.email) { query = query.where("email").equals(req.query.email); }
        if (req.query.roles) { query = query.where("roles").all(req.query.roles); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const users = await query.select("username realname email roles").exec();
        res.send({ status: "success", payload: users });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

UserRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-hash -salt").exec();
        if (!user) { throw new Error("Not found"); }
        res.send({ status: "success", payload: user });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

UserRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("username").exec();
        if (!user) { throw new Error("Not found"); }
        res.send({ status: "success", payload: user });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

UserRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (req.params.id !== req.userID && !req.role.MUser) { throw new Error("No access"); }
        const user = await User.findById(req.params.id);
        if (!user) { throw new Error("Not found"); }
        if (user._protected) { throw new Error("Object is protected"); }
        user.realname = req.body.realname;
        user.email = req.body.email;
        user.bio = req.body.bio;
        if (req.role.MUser) {
            user.roles.splice(0, user.roles.length);
            for (const id of req.body.roles) {
                if (await Role.findById(id)) {
                    user.roles.push(id);
                }
            }
        }
        await user.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

UserRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (req.params.id !== req.userID && !req.role.MUser) { throw new Error("No access"); }
        const user = await User.findById(req.params.id);
        if (!user) { throw new Error("Not found"); }
        if (user._protected) { throw new Error("Object is protected"); }
        await user.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
