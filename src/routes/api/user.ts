import { Response, Router } from "express";
import { ServerError } from "../../definitions/errors";
import { IAuthorizedRequest } from "../../definitions/requests";
import { User } from "../../schemas/user";

export let UserRouter = Router();

UserRouter.post("/generate", async (req: IAuthorizedRequest, res: Response) => {
    try {
        if (!req.commonAccess.createUser) { throw new ServerError("No access", 403); }
        // TODO
    } catch (e) {
        if (e instanceof ServerError) {
            res.status(e.code).send(e.message);
        } else {
            res.status(500).send(e.message);
        }
    }
});

UserRouter.get("/list", async (req: IAuthorizedRequest, res: Response) => {
    try {
        // TODO
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
        const user = await User.findOne({ _id: req.params.id }).select("-hash -salt").exec();
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
        if (req.params.id !== req.userID && !req.commonAccess.modifyUser) { throw new ServerError("No access", 403); }
        const user = await User.findOne({ _id: req.params.id });
        if (!user) { throw new ServerError("Not found", 404); }
        if (user._protected) { throw new ServerError("Object is protected", 403); }
        // TODO
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
        if (req.params.id !== req.userID && !req.commonAccess.modifyUser) { throw new ServerError("No access", 403); }
        const user = await User.findOne({ _id: req.params.id });
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
