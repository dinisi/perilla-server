import { Response, Router } from "express";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest } from "../../definitions/requests";
import { Role } from "../../schemas/role";
import { User } from "../../schemas/user";
import { validPaginate } from "../common";

export let UserRouter = Router();

UserRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.role.MUser) { throw new ServerError("No access", 403); }
        const user = new User();
        user.username = req.body.username;
        user.realname = req.body.realname;
        user.roles = req.body.roles;
        user.setPassword(req.body.password);
        await user.save();
        res.send(user.id);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

UserRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = User.find();
        if (req.query.username) {
            query = query.where("username").equals(req.query.username);
        }
        if (req.query.realname) {
            query = query.where("realname").equals(req.query.realname);
        }
        if (req.query.email) {
            query = query.where("email").equals(req.query.email);
        }
        if (req.query.roles) {
            query = query.where("roles").all(req.query.roles);
        }
        query = query.skip(req.query.skip).limit(req.query.limit);
        const users = await query.select("username realname email roles").exec();
        res.send(users);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

UserRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-hash -salt").exec();
        if (!user) { throw new ServerError("Not found", 404); }
        res.send(user);
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

UserRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (req.params.id !== req.userID && !req.role.MUser) { throw new ServerError("No access", 403); }
        const user = await User.findById(req.params.id);
        if (!user) { throw new ServerError("Not found", 404); }
        if (user._protected) { throw new ServerError("Object is protected", 403); }
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
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

UserRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (req.params.id !== req.userID && !req.role.MUser) { throw new ServerError("No access", 403); }
        const user = await User.findById(req.params.id);
        if (!user) { throw new ServerError("Not found", 404); }
        if (user._protected) { throw new ServerError("Object is protected", 403); }
        await user.remove();
        res.send("success");
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});
