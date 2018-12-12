import { json, urlencoded } from "body-parser";
import express = require("express");
import { readFileSync } from "fs-extra";
import http = require("http");
import https = require("https");
import { config } from "../config";
import { connectDB } from "../database";
import { log } from "../log";
import { MainRouter } from "./routes";

export const startWebService = async () => {
    await connectDB();

    const app = express();

    app.use(json());
    app.use(urlencoded({ extended: false }));

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, x-access-token");
        res.header("Access-Control-Allow-Credentials", "true");
        if (req.method === "OPTIONS") {
            return res.sendStatus(200);
        } else {
            return next();
        }
    });

    app.use(MainRouter);

    if (config.http.https) {
        const privateKey = readFileSync(config.http.privatekey);
        const certificate = readFileSync(config.http.certificate);
        const credentials = { key: privateKey, cert: certificate };

        const server = https.createServer(credentials, app);
        server.listen(config.http.port, config.http.hostname, () => {
            log(`HTTPS server started`);
        });
    } else {
        const server = http.createServer(app);
        server.listen(config.http.port, config.http.hostname, () => {
            log(`HTTP server started`);
        });
    }

    log("worker started");
};
