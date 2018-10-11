#!/bin/node

let argv = process.argv.splice(2);
const fs = require("fs-extra");
const prompts = require("prompts");
const mongoose = require("mongoose");
const child_process = require("child_process");
const path = require("path");
const crypto = require("crypto");
const generate = require("randomstring").generate;

const oldLog = console.log;
console.log = function (message) {
    oldLog(message);
    fs.appendFileSync("cli.log", `[${(new Date()).toLocaleString()}] ${message}\n`);
};

(async () => {
    if (argv[0] === "init") {
        // Init system
        // Steps:
        // 0. remove exists installition
        // 1. Compile typescript code into javascript
        // 2. Init database
        // 3. Generate inital config (use least questions)
        // 4. Write config to config.json

        // Step 0
        if (fs.existsSync("config.json")) {
            console.log("[INFO] config.json exists.")
            if ((await prompts({ type: "confirm", name: "value", message: "continue will overwrite exist data. confirm?", initial: false })).value) {
                console.log("[INFO] removing managed files...");
                const oldConfig = JSON.parse(fs.readFileSync("config.json").toString());
                try {
                    fs.removeSync("files");
                    fs.removeSync("dist");
                    fs.unlinkSync("config.json");
                    fs.unlinkSync("cli.log");
                } catch (e) {
                    console.log("[ERROR] " + e.message);
                    if (!(await prompts({ type: "confirm", name: "value", message: "continue?", initial: false })).value) process.exit(0);
                }
                console.log("[INFO] Droping database...");
                await mongoose.connect(oldConfig.db.url, oldConfig.db.options);
                await mongoose.connection.dropDatabase();
                await mongoose.disconnect();
            } else {
                process.exit(0);
            }
        }
        console.log("[INFO] Initializing the system...");
        // Step 1
        console.log("[INFO] [STEP 1/4] Compiling typescript code...");
        const tsc_path = path.join(__dirname, "node_modules", ".bin", "tsc");
        await child_process.execSync(tsc_path);
        // Step 2
        // Step 2 - 1: connect to mongodb
        console.log("[INFO] [STEP 2/4] Initializing database...");
        const dbURL = (await prompts({ type: "text", name: "value", message: "Database URL:", initial: "mongodb://localhost:27017/perilla" })).value;
        const dbOptions = { useNewUrlParser: true };
        await mongoose.connect(dbURL, dbOptions);

        // Step 2 - 2: define database models
        const UserSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            bio: { type: String, required: true, default: "No bio" },
            email: { type: String, required: true, unique: true },
            realname: { type: String, required: true, unique: true },
            roles: { type: [String], required: true },
            hash: String,
            salt: String,
            config: { type: Object, required: true },
            _protected: { type: Boolean, required: true },
        });
        UserSchema.methods.setPassword = function (password) {
            this.salt = crypto.randomBytes(16).toString("hex");
            this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
        };
        const User = mongoose.model("User", UserSchema);
        const RoleSchema = new mongoose.Schema({
            rolename: { type: String, unique: true, required: true },
            description: { type: String, required: true },
            config: { type: Object, required: true },
            _protected: { type: Boolean, required: true },
        });
        RoleSchema.pre("remove", function (next) {
            const This = this;
            if (This._protected) {
                return;
            }
            next();
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
            defaultSolutionResult: false
        };
        const best = {
            createFile: true,
            createProblem: true,
            createSolution: true,
            createContest: true,
            manageSystem: true,
            minSolutionCreationInterval: 0,
            defaultSolutionResult: true
        };
        // Roles
        const adminRole = new Role();
        adminRole.rolename = "Administrators";
        adminRole.description = "System administrators";
        adminRole.config = best;
        adminRole._protected = true;
        await adminRole.save();
        const judgerRole = new Role();
        judgerRole.rolename = "Judgers";
        judgerRole.description = "System judgers";
        judgerRole.config = worst;
        judgerRole._protected = true;
        await judgerRole.save();
        const userRole = new Role();
        userRole.rolename = "Users";
        userRole.description = "System users";
        userRole.config = worst;
        userRole._protected = true;
        await userRole.save();
        // Users
        const admin = new User();
        admin.username = "Administrator";
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
        judger.username = "Judger";
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
        removedUser.username = "removedUser";
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
                options: dbOptions
            },
            redis: {
                prefix: "PERILLA",
                options: {}
            },
            mail: {
                enabled: false
            },
            http: {
                port: 3000,
                hostname: "localhost",
                https: false
            },
            defaults: {
                role: {
                    config: worst
                },
                user: {
                    config: worst,
                    roles: [userRole.id]
                },
                file: {
                    allowedRead: [adminRole.id, judgerRole.id],
                    allowedModify: [adminRole.id]
                },
                problem: {
                    allowedRead: [adminRole.id, judgerRole.id],
                    allowedModify: [adminRole.id],
                    allowedSubmit: [adminRole.id]
                },
                solution: {
                    allowedRead: [adminRole.id, judgerRole.id],
                    allowedReadResult: [adminRole.id],
                    allowedModify: [adminRole.id, judgerRole.id],
                    allowedRejudge: [adminRole.id]
                },
                contest: {
                    allowedRead: [adminRole.id, judgerRole.id],
                    allowedModify: [adminRole.id]
                }
            },
            reservedUserID: removedUser.id
        };
        // Step 4
        console.log("[INFO] [STEP 4/4] Writing config.json");
        fs.writeFileSync("config.json", JSON.stringify(config, null, '\t'));
        console.log("[INFO] ✔️ Done");
        console.log("[TIP] use `yarn start` to start perilla");
        console.log("[TIP] Edit config.json to customize perilla.");
        console.log("[TIP] Please read https://perilla.js.org for more information");
        process.exit(0);
    } else if (argv[0] === "recompile") {
        console.log("[INFO] Compiling");
        const tsc_path = path.join(__dirname, "node_modules", ".bin", "tsc");
        await child_process.execSync(tsc_path);
        console.log("[INFO] Done");
    } else if (argv[0] === "ui") {
        if (argv[1] === "recompile") {
            console.log("[INFO]");
        } else {
            console.log("Perilla CLI - UI");
            console.log("");
            console.log("usage:");
            console.log("➜  node cli.js ui recompile");
            console.log("Recompile UI");
        }
    } else {
        console.log("Perilla CLI");
        console.log("");
        console.log("usage:");
        console.log("➜  node cli.js init");
        console.log("Initialize the system");
        console.log("➜  node cli.js recompile");
        console.log("Recompile typescript code into runnable javascript");
    }
})();
