import { appendFileSync } from "fs";
import { scheduleJob } from "node-schedule";
import { join } from "path";
import { APPLOG_PATH } from "../constant";
import { connectDB } from "../database";
import { connectRedis } from "../redis";
import { fileGC } from "./filegc";

const consoleLogger = console.log;
console.log = (message: string) => {
    consoleLogger(message);
    appendFileSync(APPLOG_PATH, `CRON [${(new Date()).toLocaleString()}] ${message}\n`);
};
console.log("Perilla Cron started");

(async () => {
    await connectDB();
    await connectRedis();
    scheduleJob("fileGC", "0 0 0 * * *", fileGC);
})();
