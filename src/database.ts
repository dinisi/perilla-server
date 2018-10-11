import * as mongoose from "mongoose";
import { config } from "./config";

mongoose.connect(config.db.url, config.db.options as mongoose.ConnectionOptions);
mongoose.connection.on("connected", () => {
    console.log("Mongoose connected");
});
mongoose.connection.on("error", (err) => {
    console.log("Mongoose connection error: " + err);
});
mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});
const gracefulShutdown = (msg: string, callback: any) => {
    mongoose.connection.close(() => {
        console.log("Mongoose disconnected through " + msg);
        callback();
    });
};
process.once("SIGUSR2", () => {
    gracefulShutdown("nodemon restart", () => {
        process.kill(process.pid, "SIGUSR2");
    });
});
process.on("SIGINT", () => {
    gracefulShutdown("app termination", () => {
        process.exit(0);
    });
});
process.on("SIGTERM", () => {
    gracefulShutdown("system termination", () => {
        process.exit(0);
    });
});
