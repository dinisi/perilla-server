import { Router } from "express";
import { IRESTResponse } from "../../interfaces/route";

export let APIRouter = Router();

APIRouter.post("/register", async (req, res: IRESTResponse) => {
    req.checkBody("_id", "Invalid username");
    req.checkBody("password", "Invalid password").isString();
    req.checkBody("email", "Invalid email");

});
