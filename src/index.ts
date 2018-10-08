import "./database";
import "./redis";

import { json, urlencoded } from "body-parser";
import * as express from "express";
import { appendFileSync, readFileSync } from "fs-extra";
import * as http from "http";
import * as https from "https";
import { config } from "./config";
import { MainRouter } from "./routes";

const consoleLogger = console.log;
console.log = (message: string) => {
    consoleLogger(message);
    appendFileSync("app.log", `[${(new Date()).toLocaleString()}] ${message}\n`);
};
console.log("Perilla started");

const app: express.Application = express();

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

if (config.http.https) {
    const privateKey = readFileSync(config.http.privatekey);
    const certificate = readFileSync(config.http.certificate);
    const credentials = { key: privateKey, cert: certificate };

    const server = https.createServer(credentials, app);
    server.listen(config.http.port, config.http.hostname, () => {
        console.log(`HTTPS service started`);
    });
} else {
    const server = http.createServer(app);
    server.listen(config.http.port, config.http.hostname, () => {
        console.log(`HTTP service started`);
    });
}
