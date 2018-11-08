import child_process = require("child_process");
import commander = require("commander");
import fs = require("fs-extra");
import mongoose = require("mongoose");
import path = require("path");
import prompts = require("prompts");
import { generate } from "randomstring";

const version = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json")).toString()).version;

const readbool = async (message: string, initial: boolean = false) => (await prompts({ type: "confirm", name: "v", message, initial })).v;
const readpass = async () => (await prompts({ type: "password", name: "v", message: "Please input password" })).v;

const uninstall = async () => {
    console.log("[INFO] config.json exists.");
    if (await readbool("continue will overwrite exist data. confirm?")) {
        console.log("[INFO] removing managed files...");
        const oldConfig = JSON.parse(fs.readFileSync("config.json").toString());
        try {
            fs.removeSync("files");
            fs.removeSync("dist");
            fs.unlinkSync("config.json");
        } catch (e) {
            console.log("[ERROR] " + e.message);
            if (!await readbool("continue?")) { process.exit(0); }
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
    const questions = [
        {
            type: "text",
            name: "db_url",
            message: "Mongodb URL",
            initial: "mongodb://localhost:27017/perilla",
        },
        {
            type: "text",
            name: "redis_prefix",
            message: "Redis key prefix",
            initial: "perilla_",
        },
        {
            type: "text",
            name: "http_hostname",
            message: "HTTP Hostname",
            initial: "localhost",
        },
        {
            type: "number",
            name: "http_port",
            message: "HTTP Port",
            initial: 8680,
            min: 1,
            max: 65535,
        },
        {
            type: "text",
            name: "session_secret",
            message: "session secret",
            initial: generate(25),
        },
    ];
    const answers = await prompts(questions);
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
        sessionSecret: answers.session_secret,
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
    admin.setPassword(await readpass());
    await admin.save();
    const { SystemMap } = require("./schemas/systemMap");
    const map = new SystemMap();
    map.user = admin._id;
    await map.save();
};

const createEntry = async (id: string) => {
    require("./database");
    const questions = [
        {
            type: "text",
            name: "email",
            message: "Entry email",
        },
        {
            type: "select",
            name: "type",
            message: "Entry type",
            choices: [
                { title: "User", value: 0 },
                { title: "Group", value: 1 },
            ],
        },
    ];
    const answers = await prompts(questions);
    const { Entry, EntryType } = require("./schemas/entry");
    const entry = new Entry();
    entry._id = id;
    entry.email = answers.email;
    entry.type = answers.type;
    if (entry.type === EntryType.user) {
        entry.setPassword(await readpass());
    }
    await entry.save();
};

const removeEntry = async (id: string) => {
    require("./database");
    const { Entry, EntryType } = require("./schemas/entry");
    const entry = await Entry.findById(id);
    if (!entry) { throw new Error("Entry not found"); }
    await entry.remove();
};

commander
    .version(version);

commander
    .command("init")
    .description("Initialize the system")
    .action(async () => {
        // 0. remove exists installition
        // 1. Compile typescript code into javascript
        // 2. Generate configuration file
        // 3. Initialize database

        console.log("[INFO] Initializing the system...");
        if (fs.existsSync("config.json")) { await uninstall(); }
        console.log("[INFO] [STEP 1/4] Compiling typescript code...");
        compileCode();
        console.log("[INFO] [STEP 2/4]  Generating config...");
        await generateConfig();
        console.log("[INFO] [STEP 3/4] Initializing database...");
        await InitializeDatabase();
        console.log("[INFO] ✔️ Done");
        console.log("[TIP] use `yarn start` to start perilla");
        console.log("[TIP] Edit config.json to customize perilla.");
        console.log("[TIP] Please read https://perilla.js.org for more information");
        process.exit(0);
    });

commander
    .command("entry <id>")
    .description("Entry utils")
    .option("-c, --create", "Create entry")
    .option("-r, --remove", "Delete entry")
    .option("-m, --modify", "Modify entry")
    .action(async (id, cmd) => {
        if (cmd.create) {
            await createEntry(id);
        }
        if (cmd.remove) {
            await removeEntry(id);
        }
    });

commander.parse(process.argv);
