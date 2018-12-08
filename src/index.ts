import "./database";

import { json, urlencoded } from "body-parser";
import redisStore = require("connect-redis");
import express = require("express");
import session = require("express-session");
import { appendFileSync, readFileSync } from "fs-extra";
import http = require("http");
import https = require("https");
import { config } from "./config";
import { APPLOG_PATH } from "./constant";
import { connectDB } from "./database";
import { connectRedis, redisClient } from "./redis";
import { MainRouter } from "./routes";

const consoleLogger = console.log;
console.log = (message: string) => {
    consoleLogger(message);
    appendFileSync(APPLOG_PATH, `[${(new Date()).toLocaleString()}] ${message}\n`);
};
console.log("Perilla started");

(async () => {
    await connectDB();
    await connectRedis();

    const app = express();

    app.use(json());
    app.use(urlencoded({ extended: false }));
    const store = redisStore(session);

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
})();
