let argv = process.argv.splice(2);
const fs = require("fs-extra");
const prompts = require("prompts");
const mongoose = require("mongoose");
const child_process = require("child_process");
const path = require("path");

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
                    fs.unlinkSync("install.log");
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
        const Role = require(path.join(__dirname, "dist", "schemas", "role.js")).Role;
        const User = require(path.join(__dirname, "dist", "schemas", "user.js")).User;
        //
    } else {
        console.log("LightOnlineJudge CLI");
        console.log("");
        console.log("usage:");
        console.log("➜  node cli.js init");
        console.log("Initialize the system");
    }
})();