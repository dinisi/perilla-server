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
        console.log("[INFO] [STEP 1/4] Compiling typescript code...");
        const tsc_path = path.join(__dirname, "node_modules", ".bin", "tsc");
        await child_process.execSync(tsc_path);
        console.log("[INFO] [STEP 2/4] Initializing database...");
        const dbURL = (await prompts({ type: "text", name: "value", message: "Database URL:", initial: "mongodb://localhost:27017/loj" })).value;
        const dbOptions = { useNewUrlParser: true };
        await mongoose.connect(dbURL, dbOptions);
        // Database models
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
        // UAC defines
        const worst = {
            createFile: true,
            createProblem: true,
            createSolution: true,
            manageSystem: false,
            minSolutionCreationInterval: 10000,
        };
        const best = {
            createFile: true,
            createProblem: true,
            createSolution: true,
            manageSystem: true,
            minSolutionCreationInterval: 0,
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
        admin.email = "admin@zhangzisu.cn";
        admin.roles = [adminRole.id];
        admin._protected = true;
        const adminPassword = generate(10);
        admin.setPassword(adminPassword);
        console.log("[INFO] [STEP 2/4] Admin password: " + adminPassword);
        admin.config = best;
        await admin.save();
        const judger = new User();
        judger.username = "Judger";
        judger.realname = "Judger";
        judger.email = "judger@zhangzisu.cn";
        judger.roles = [judgerRole.id];
        judger._protected = true;
        const judgerPassword = generate(10);
        judger.setPassword(judgerPassword);
        console.log("[INFO] [STEP 2/4] Judger password: " + judgerPassword);
        judger.config = worst;
        await judger.save();
        console.log("[INFO] [STEP 3/4] Generating HTTP config");
        const httpResult = await prompts([
            {
                type: "text",
                name: "hostname",
                message: "HTTP Hostname:",
                initial: "127.0.0.1"
            },
            {
                type: "number",
                name: "port",
                message: "HTTP Port",
                initial: 80
            }
        ]);
        const config = {
            defaultAdminUserID: admin.id,
            defaultAdminRoleID: adminRole.id,
            defaultJudgerUserID: judger.id,
            defaultJudgerRoleID: judgerRole.id,
            defaultUserRoleID: userRole.id,
            db: {
                url: dbURL,
                options: dbOptions
            },
            mail: {
                enabled: false
            },
            http: httpResult
        };
        console.log("[INFO] [STEP 4/4] Generating config.json");
        fs.writeFileSync("config.json", JSON.stringify(config, null, '\t'));
        console.log("[INFO] Done");
        process.exit(0);
    } else {
        console.log("LightOnlineJudge CLI");
        console.log("");
        console.log("usage:");
        console.log("➜  node cli.js init");
        console.log("Initialize the system");
    }
})();
