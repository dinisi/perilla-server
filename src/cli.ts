#!/usr/bin/env node

import child_process = require("child_process");
import commander = require("commander");
import crypto = require("crypto");
import fs = require("fs-extra");
import mongoose = require("mongoose");
import path = require("path");
import prompts = require("prompts");
import { generate } from "randomstring";
import { ISystemConfig } from "./interfaces/system";
const version = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json")).toString()).version;

const uninstall = async () => {
    console.log("[INFO] config.json exists.");
    if ((await prompts({ type: "confirm", name: "value", message: "continue will overwrite exist data. confirm?", initial: false })).value) {
        console.log("[INFO] removing managed files...");
        const oldConfig = JSON.parse(fs.readFileSync("config.json").toString());
        try {
            fs.removeSync("files");
            fs.removeSync("dist");
            fs.unlinkSync("config.json");
        } catch (e) {
            console.log("[ERROR] " + e.message);
            if (!(await prompts({ type: "confirm", name: "value", message: "continue?", initial: false })).value) { process.exit(0); }
        }
        console.log("[INFO] Droping database...");
        await mongoose.connect(oldConfig.db.url, oldConfig.db.options);
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    } else {
        process.exit(0);
    }
};

const compileCode = () => {
    // tslint:disable-next-line:variable-name
    let tsc_path = null;
    if (process.platform === "win32") {
        tsc_path = path.join(__dirname, "..", "node_modules", ".bin", "tsc.cmd");
    } else {
        tsc_path = path.join(__dirname, "..", "node_modules", ".bin", "tsc");
    }
    if (tsc_path) {
        child_process.execSync(tsc_path);
    } else {
        console.log("Please compile typescript code by you own");
    }
};

const generateConfig = async () => {
    console.log("1");
    const questions = [
        {
            type: "text",
            name: "db_url",
            message: "Mongodb URL",
            initial: "mongodb://localhost:27017/perilla",
        },
        {
            type: "number",
            name: "redis_prefix",
            message: "Redis key prefix",
            initial: 0,
            min: 0,
            max: 15,
        },
        {
            type: "text",
            name: "http_hostname",
            initial: "localhost",
        },
        {
            type: "number",
            name: "http_port",
            initial: 8680,
            min: 1,
            max: 65535,
        },
        {
            type: "text",
            name: "sessionSecret",
            initial: generate(25),
        },
    ];
    console.log("2");
    const answers = await prompts({
        type: "text",
        name: "db_url",
        message: "Mongodb URL",
        initial: "mongodb://localhost:27017/perilla",
    });
    console.log("3");
    const config = {
        db: {
            url: answers.db_url,
            options: { useNewUrlParser: true },
        },
        redis: {
            prefix: answers.redis_prefix,
            options: {},
        },
        mail: {
            enabled: false,
        },
        http: {
            port: answers.http_port,
            hostname: answers.http_hostname,
            https: false,
        },
    };
    fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
};

const InitializeDatabase = async () => {
    require("./database");
    const { Entry, EntryType } = require("./schemas/entry");
    const admin = new Entry();
    admin._id = "Administrator";
    admin.description = "System administrator";
    admin.email = "admin@perilla.js.org";
    admin.type = EntryType.user;
    const password = (await prompts({ type: "password", name: "value", message: "Administrator password:" })).value;
    admin.setPassword(password);
    await admin.save();
    const { SystemMap } = require("./schemas/systemMap");
    const map = new SystemMap();
    map.user = admin._id;
    await map.save();
};

const init = async () => {
    // Init system
    // Steps:
    // 0. remove exists installition
    // 1. Compile typescript code into javascript
    // 2. Generate configuration file
    // 3. Initialize database

    console.log("[INFO] Initializing the system...");
    // Step 0
    if (fs.existsSync("config.json")) { await uninstall(); }
    // Step 1
    console.log("[INFO] [STEP 1/4] Compiling typescript code...");
    compileCode();
    // Step 2
    console.log("[INFO] [STEP 2/4]  Generating config...");
    await generateConfig();
    console.log("[INFO] [STEP 3/4] Initializing database...");
    // await InitializeDatabase();
    console.log("[INFO] ✔️ Done");
    console.log("[TIP] use `yarn start` to start perilla");
    console.log("[TIP] Edit config.json to customize perilla.");
    console.log("[TIP] Please read https://perilla.js.org for more information");
    process.exit(0);
};

commander
    .version(version)
    .command("init", "Initialize the system")
    .action(() => init())
    .parse(process.argv);
