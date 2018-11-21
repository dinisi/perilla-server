import express = require("express");
import { existsSync } from "fs";
import { join } from "path";

export const FrontEndRouter = express.Router();

const FrontEndPath = join(__dirname, "..", "..", "..", "frontend");

if (existsSync(FrontEndPath)) {
    FrontEndRouter.use(express.static(FrontEndPath));
    FrontEndRouter.get("/*", (req, res) => {
        res.sendFile(join(FrontEndPath, "index.html"));
    });
} else {
    FrontEndRouter.get("/*", (req, res) => {
        res.send("Error: Frontend File not exists");
    });
}
