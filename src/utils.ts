import { createHash } from "crypto";
import { createReadStream, stat } from "fs-extra";
import { SHA3Hash } from "sha3";
import tmp = require("tmp");
import { Entry, EntryType } from "./schemas/entry";

export const getBaseURL = (hostname: string, port: number) => {
    return "http://" + hostname + (port === 80 ? "" : ":" + port);
};

export const getHash = (path: string): Promise<string> => {
    return new Promise((reslove) => {
        const md5 = createHash("md5");
        const sha3 = new SHA3Hash();
        const stream = createReadStream(path);
        stream.on("data", (chunk) => {
            md5.update(chunk);
            sha3.update(chunk);
        });
        stream.on("end", () => {
            const md5Value = md5.digest("hex");
            const sha3Value = sha3.digest("hex");
            reslove(md5Value + "_" + sha3Value);
        });
    });
};

export const getFileSize = (path: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        stat(path, (err, stats) => {
            if (err) { reject(err); }
            resolve(stats.size);
        });
    });
};

export const getTmpPath = () => new Promise<string>((resolve, reject) => {
    tmp.file((err, filepath) => {
        if (err) {
            reject(err);
        } else {
            resolve(filepath);
        }
    });
});

export const validateUser = async (ID: string) => {
    const user = await Entry.findById(ID);
    if (!user) { return false; }
    return user.type === EntryType.user;
};

export const validateGroup = async (ID: string) => {
    const group = await Entry.findById(ID);
    if (!group) { return false; }
    return group.type === EntryType.group;
};

type IGracefulExitHook = () => void | Promise<void>;
const gracefulExitHooks: IGracefulExitHook[] = [];

export const registerGracefulExitHook = (hook: IGracefulExitHook) => {
    gracefulExitHooks.push(hook);
};

export const gracefulExit = async (msg: string) => {
    for (const hook of gracefulExitHooks) { await hook(); }
    console.log(`Perilla exited: ${msg}`);
    process.exit(0);
};

process.once("SIGUSR2", () => { gracefulExit("SIGUSR2(nodemon restart)"); });
process.on("SIGINT", () => { gracefulExit("SIGINT(app termination)"); });
process.on("SIGTERM", () => { gracefulExit("SIGTERM(system termination)"); });
