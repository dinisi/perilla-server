import { Response, Router } from "express";
import { IAuthorizedRequest } from "../../interfaces/requests";

export let contestRouter = Router();

contestRouter.post("/new", async (req: IAuthorizedRequest, res: Response) => {
    try {
        //
    } catch (e) {
        res.send({ status: "failed", payload: e.message });
    }
});
