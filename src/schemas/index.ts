// tslint:disable:no-console
import * as mongoose from "mongoose";
const dbURL: string = "mongodb://localhost:27017/loj";

mongoose.connect(dbURL, { useNewUrlParser: true });

mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to " + dbURL);
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
    gracefulShutdown("Heroku app termination", () => {
        process.exit(0);
    });
});

import "./file";
import "./fileAccess";
import "./problem";
import "./problemAccess";
import "./role";
import "./solution";
import "./solutionAccess";
import "./user";
