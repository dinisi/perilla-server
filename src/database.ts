import mongoose = require("mongoose");
import { config } from "./config";
import { registerGracefulExitHook } from "./utils";

export const connectDB = async () => {
    await mongoose.connect(config.db.url, config.db.options as mongoose.ConnectionOptions);
    console.log("Mongoose connected");
    mongoose.connection.on("error", (err) => {
        console.log("Mongoose connection error: " + err);
    });
    mongoose.connection.on("disconnected", () => {
        console.log("Mongoose disconnected");
    });
    registerGracefulExitHook(async () => {
        return new Promise<void>((resolve) => {
            mongoose.connection.close(resolve);
        });
    });
};
