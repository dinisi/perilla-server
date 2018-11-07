#!/usr/bin/env node

const argv = process.argv.splice(2);
import child_process = require("child_process");
import commander = require("commander");
import crypto = require("crypto");
import fs = require("fs-extra");
import mongoose = require("mongoose");
import path = require("path");
import prompts = require("prompts");
import { generate } from "randomstring";
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
    const tsc_path = path.join(__dirname, "node_modules", ".bin", "tsc");
    child_process.execSync(tsc_path);
};

const generateConfig = async () => {
    //
};

commander
    .version(version)
    .command("init", "Initialize the system")
    .action(async () => {
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
        // Step 2 - 1: connect to mongodb
        console.log("[INFO] [STEP 2/4] Initializing database...");
        const dbURL = "mongodb://localhost:27017/perilla";
        const dbOptions = { useNewUrlParser: true };
        await mongoose.connect(dbURL, dbOptions);

        // Step 2 - 2: define database models
        // User
        // Role
        const RoleSchema = new mongoose.Schema({
            _id: { type: String, required: true, minlength: 1 },
            description: { type: String, required: true },
            config: { type: Object, required: true },
            _protected: { type: Boolean, required: true },
        });
        const Role = mongoose.model("Role", RoleSchema);

        // Step 2 - 3: generate default users/roles
        const worst = {
            createFile: true,
            createProblem: true,
            createSolution: true,
            createContest: false,
            manageSystem: false,
            minSolutionCreationInterval: 10000,
        };
        const best = {
            createFile: true,
            createProblem: true,
            createSolution: true,
            createContest: true,
            manageSystem: true,
            minSolutionCreationInterval: 0,
        };
        // Roles
        const adminRole = new Role();
        adminRole._id = "Administrators";
        adminRole.description = "System administrators";
        adminRole.config = best;
        adminRole._protected = true;
        await adminRole.save();
        const judgerRole = new Role();
        judgerRole._id = "Judgers";
        judgerRole.description = "System judgers";
        judgerRole.config = worst;
        judgerRole._protected = true;
        await judgerRole.save();
        const userRole = new Role();
        userRole._id = "Users";
        userRole.description = "System users";
        userRole.config = worst;
        userRole._protected = true;
        await userRole.save();
        // Users
        const admin = new User();
        admin._id = "Administrator";
        admin.realname = "Administrator";
        admin.email = "admin@perilla.js.org";
        admin.roles = [adminRole.id, userRole.id];
        admin._protected = true;
        const adminPassword = generate(10);
        admin.setPassword(adminPassword);
        console.log("[INFO] [STEP 2/4] Admin password: " + adminPassword);
        admin.config = best;
        await admin.save();
        const judger = new User();
        judger._id = "Judger";
        judger.realname = "Judger";
        judger.email = "judger@perilla.js.org";
        judger.roles = [judgerRole.id, userRole.id];
        judger._protected = true;
        const judgerPassword = generate(10);
        judger.setPassword(judgerPassword);
        console.log("[INFO] [STEP 2/4] Judger password: " + judgerPassword);
        judger.config = worst;
        await judger.save();
        const removedUser = new User();
        removedUser._id = "removedUser";
        removedUser.realname = "removedUser";
        removedUser.email = "removed@perilla.js.org";
        removedUser.roles = [userRole.id];
        removedUser._protected = true;
        const removedUserPWD = generate(10);
        removedUser.setPassword(removedUserPWD);
        console.log("[INFO] [STEP 2/4] Removed user password: " + removedUserPWD);

        // Step 3
        console.log("[INFO] [STEP 3/4] Generating default config");
        const config = {
            db: {
                url: dbURL,
                options: dbOptions,
            },
            redis: {
                prefix: "PERILLA",
                options: {},
            },
            mail: {
                enabled: false,
            },
            http: {
                port: 3000,
                hostname: "localhost",
                https: false,
            },
            defaults: {
                role: {
                    config: worst,
                },
                user: {
                    config: worst,
                    roles: [userRole.id],
                },
            },
            reservedUserID: removedUser.id,
            system: {
                root: admin.id,
                wheel: adminRole.id,
            },
        };
        // Step 4
        console.log("[INFO] [STEP 4/4] Writing config.json");
        fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
        console.log("[INFO] ✔️ Done");
        console.log("[TIP] use `yarn start` to start perilla");
        console.log("[TIP] Edit config.json to customize perilla.");
        console.log("[TIP] Please read https://perilla.js.org for more information");
        process.exit(0);
    });

// (async () => {
//     if (argv[0] === "init") {
//
//     } else if (argv[0] === "recompile") {
//         console.log("[INFO] Compiling");
//         // tslint:disable-next-line:variable-name
//         const tsc_path = path.join(__dirname, "node_modules", ".bin", "tsc");
//         await child_process.execSync(tsc_path);
//         console.log("[INFO] Done");
//     } else if (argv[0] === "ui") {
//         if (argv[1] === "recompile") {
//             console.log("[INFO]");
//         } else {
//             console.log("Perilla CLI - UI");
//             console.log("");
//             console.log("usage:");
//             console.log("➜  node cli.js ui recompile");
//             console.log("Recompile UI");
//         }
//     } else {
//         console.log("Perilla CLI");
//         console.log("");
//         console.log("usage:");
//         console.log("➜  node cli.js init");
//         console.log("Initialize the system");
//         console.log("➜  node cli.js recompile");
//         console.log("Recompile typescript code into runnable javascript");
//     }
// })();
