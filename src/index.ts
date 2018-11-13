import "./database";

import { json, urlencoded } from "body-parser";
import * as REDISStore from "connect-redis";
import * as express from "express";
import * as session from "express-session";
import { appendFileSync, readFileSync } from "fs-extra";
import * as http from "http";
import * as https from "https";
import * as passport from "passport";
import { config } from "./config";
import { REDISInstance } from "./redis";
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
const store = REDISStore(session);
app.use(session({
    store: new store({ client: REDISInstance }),
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
