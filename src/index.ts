import "./database";
import "./redis";

import { json, urlencoded } from "body-parser";
import * as express from "express";
import { appendFileSync } from "fs-extra";
import { MainRouter } from "./routes";

const consoleLogger = console.log;
console.log = (message: string) => {
    consoleLogger(message);
    appendFileSync("app.log", `[${(new Date()).toLocaleString()}] ${message}\n`);
};
console.log("LightOnlineJudge started");

const app: express.Application = express();
const port: number = parseInt(process.env.PORT, 10) || 3000;

app.use(json());
app.use(urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, auth, *");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(MainRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
