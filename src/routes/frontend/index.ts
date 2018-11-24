import express = require("express");
import { existsSync } from "fs";
import { join } from "path";
import { FRONTEND_PATH } from "../../constant";

export const FrontEndRouter = express.Router();

if (existsSync(FRONTEND_PATH)) {
    FrontEndRouter.use(express.static(FRONTEND_PATH));
    FrontEndRouter.get("/*", (req, res) => {
        res.sendFile(join(FRONTEND_PATH, "index.html"));
    });
} else {
    FrontEndRouter.get("/*", (req, res) => {
        res.status(404);
        res.send("Error: Frontend File not exists");
    });
}
