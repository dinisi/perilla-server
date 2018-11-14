import "./database";

import { json, urlencoded } from "body-parser";
import MongoStore = require("connect-mongo");
import express = require("express");
import session = require("express-session");
import { appendFileSync, readFileSync } from "fs-extra";
import http = require("http");
import https = require("https");
import mongoose = require("mongoose");
import passport = require("passport");
import { config } from "./config";
import { connectDB } from "./database";
import { MainRouter } from "./routes";

const consoleLogger = console.log;
console.log = (message: string) => {
    consoleLogger(message);
    appendFileSync("app.log", `[${(new Date()).toLocaleString()}] ${message}\n`);
};
console.log("Perilla started");

(async () => {
    await connectDB();

    const app = express();

    app.use(json());
    app.use(urlencoded({ extended: false }));
    const store = MongoStore(session);
    app.use(session({
        store: new store({ mongooseConnection: mongoose.connection }),
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
    }));
    app.use(passport.initialize());
    app.use(passport.session());

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
