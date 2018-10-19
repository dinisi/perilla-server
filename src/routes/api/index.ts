import { Router } from "express";
import { authenticate } from "passport";
import { Entry, EntryType } from "../../schemas/entry";
import "./passport";
import { PrivateAPIRouter } from "./private";
import { PublicAPIRouter } from "./public";
import { SystemAPIRouter } from "./system";
import { normalizeValidatorError, RESTWarp } from "./wrap";

export const APIRouter = Router();

APIRouter.post("/register", RESTWarp((req, res) => {
    req.checkBody("_id", "Invalid username");
    req.checkBody("password", "Invalid password").isString();
    req.checkBody("email", "Invalid email").isEmail();
    const errors = req.validationErrors();
    if (errors) {
        return res.RESTFail(normalizeValidatorError(errors));
    } else {
        const entry = new Entry();
        entry._id = req.body._id;
        entry.email = req.body.email;
        entry.type = EntryType.user;
        entry.setPassword(req.body.password);
        entry.save()
            .then((saved) => res.RESTSend(saved._id))
            .catch((err) => res.RESTFail(err.message));
    }
}));

APIRouter.post("/login", authenticate("local"), RESTWarp((req, res) => {
    return res.RESTSend(req.user);
}));

APIRouter.use("/public", PublicAPIRouter);
APIRouter.use("/private", PrivateAPIRouter);
APIRouter.use("/system", SystemAPIRouter);
