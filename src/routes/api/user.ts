import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../interfaces/requests";
import { IConfiguration } from "../../interfaces/user";
import { User } from "../../schemas/user";
import { validPaginate } from "../common";

export let userRouter = Router();

userRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.client.config.manageSystem) { throw new Error("Access denied"); }
        const user = new User();
        user.username = req.body.username;
        user.realname = req.body.realname;
        user.roleIDs = req.body.roleIDs;
        user.email = req.body.email;
        user.setPassword(req.body.password);
        await user.save();
        res.send({ status: "success", payload: user.id });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

userRouter.get("/count", async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = User.find();

        if (req.query.username) { query = query.where("username").equals(req.query.username); }
        if (req.query.realname) { query = query.where("realname").equals(req.query.realname); }
        if (req.query.email) { query = query.where("email").equals(req.query.email); }
        if (req.query.roles) { query = query.where("roles").all(req.query.roles); }
        if (req.query.search) { query = query.where("username").regex(new RegExp(req.query.search)); }

        res.send({ status: "success", payload: await query.countDocuments() });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

userRouter.get("/list", validPaginate, async (req: IAuthorizedRequest, res: Response) => {
    try {
        let query = User.find();

        if (req.query.username) { query = query.where("username").equals(req.query.username); }
        if (req.query.realname) { query = query.where("realname").equals(req.query.realname); }
        if (req.query.email) { query = query.where("email").equals(req.query.email); }
        if (req.query.roles) { query = query.where("roles").all(req.query.roles); }
        if (req.query.search) { query = query.where("username").regex(new RegExp(req.query.search)); }

        query = query.skip(req.query.skip).limit(req.query.limit);
        const users = await query.select("username realname email roles").exec();
        res.send({ status: "success", payload: users });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

userRouter.get("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-hash -salt").exec();
        if (!user) { throw new Error("Not found"); }
        res.send({ status: "success", payload: user });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

userRouter.get("/:id/summary", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("username email").exec();
        if (!user) { throw new Error("Not found"); }
        res.send({ status: "success", payload: user });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

userRouter.post("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        const allowedManage = req.client.config.manageSystem;
        if (req.params.id !== req.client.userID && !allowedManage) { throw new Error("Access denied"); }
        const user = await User.findById(req.params.id);
        if (!user) { throw new Error("Not found"); }
        if (user._protected) { throw new Error("Object is protected"); }
        if (!IConfiguration.validate(req.body.config).success) { throw new Error("Invalid config"); }
        user.realname = req.body.realname;
        user.email = req.body.email;
        user.bio = req.body.bio;
        if (allowedManage) {
            user.roleIDs = req.body.roleIDs;
            user.config = req.body.config;
        }
        if (req.body.password) { user.setPassword(req.body.password); }
        await user.save();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});

userRouter.delete("/:id", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (req.params.id !== req.client.userID && !req.client.config.manageSystem) { throw new Error("Access denied"); }
        const user = await User.findById(req.params.id);
        if (!user) { throw new Error("Not found"); }
        if (user._protected) { throw new Error("Object is protected"); }
        await user.remove();
        res.send({ status: "success" });
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
