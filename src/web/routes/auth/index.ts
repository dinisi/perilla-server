import { Router } from "express";
import { sign, verify } from "jsonwebtoken";
import { config } from "../../../config";
import { ERR_ACCESS_DENIED, ERR_INVALID_REQUEST, ERR_NOT_FOUND } from "../../../constant";
import { IPCMessageType } from "../../../interfaces/message";
import { Entry, EntryType } from "../../../schemas/entry";
import { sendMessage } from "../../../utils";
import { ensure, RESTWrap } from "../util";

export const AuthRouter = Router();

if (config.mail.enable) {
    AuthRouter.post("/register", RESTWrap(async (req, res) => {
        const token = sign({ username: req.body.username, email: req.body.email, password: req.body.password }, config.secret, { expiresIn: "1h" });
        const verifyURL = `${config.mail.baseURL}/auth/register?token=${token}`;
        sendMessage({
            type: IPCMessageType.SendMailRequest,
            payload: {
                to: req.body.email,
                subject: "Confirm registration",
                html: `Please open <a href="${verifyURL}">${verifyURL}</a> to confirm your registration`,
            },
        });
        res.RESTSend("Please check your inbox");
    }));

    AuthRouter.get("/register", RESTWrap(async (req, res) => {
        const token = req.query.token;
        const decoded = verify(token, config.secret) as any;
        const entry = new Entry();
        entry._id = decoded.username;
        entry.email = decoded.email;
        entry.type = EntryType.user;
        entry.setPassword(decoded.password);
        await entry.save();
        res.RESTSend("Registration Completed. Please login");
    }));
} else {
    AuthRouter.post("/register", RESTWrap(async (req, res) => {
        const entry = new Entry();
        entry._id = req.body.username;
        entry.email = req.body.email;
        entry.type = EntryType.user;
        entry.setPassword(req.body.password);
        await entry.save();
        res.RESTSend("Registration Completed. Please login");
    }));
}

AuthRouter.post("/login", RESTWrap(async (req, res) => {
    const entry = await Entry.findById(req.body.username);
    ensure(entry, ERR_NOT_FOUND);
    if (entry.type !== EntryType.user) { throw new Error(ERR_INVALID_REQUEST); }
    ensure(entry.validPassword(req.body.password), ERR_ACCESS_DENIED);
    const token = sign({ _id: entry._id }, config.secret, { expiresIn: "1d" });
    return res.RESTSend(token);
}));
