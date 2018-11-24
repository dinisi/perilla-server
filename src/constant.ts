import { join } from "path";

import { ensureDirSync } from "fs-extra";

// REDIS prefixes
export const JUDGE_PREFIX = "judge";
export const CHRON_PREFIX = "chron";

// File paths
export const MANAGED_FILE_PATH = join(__dirname, "..", "files", "managed");
ensureDirSync(MANAGED_FILE_PATH);
export const APPLOG_PATH = join(__dirname, "..", "app.log");
export const FRONTEND_PATH = join(__dirname, "..", "frontend");
export const CONFIG_PATH = join(__dirname, "..", "config.json");
export const PACKAGE_PATH = join(__dirname, "..", "package.json");

// Model options
export const ARTICLE = {
    title: {
        minlength: 1,
        maxlength: 50,
    },
    content: {
        default: "No content",
        minlength: 1,
        maxlength: 40960,
    },
    tags: {
        default: ["tagless"],
    },
};
export const ENTRY = {
    _id: {
        minlength: 1,
        maxlength: 50,
        validate: (v: string) => /^[A-Za-z0-9]*$/.test(v),
    },
    email: {
        minlength: 1,
        maxlength: 50,
        validate: (v: string) => /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(v),
    },
};
export const FILE = {
    title: {
        minlength: 1,
        maxlength: 50,
    },
    description: {
        default: "No description",
        minlength: 1,
        maxlength: 40960,
    },
    tags: {
        default: ["tagless"],
    },
};
export const PROBLEM = {
    title: {
        minlength: 1,
        maxlength: 50,
    },
    content: {
        default: "No content",
        minlength: 1,
        maxlength: 40960,
    },
    tags: {
        default: ["tagless"],
    },
};

// Error messages
export const ERR_ACCESS_DENIED = "Access denied";
export const ERR_NOT_FOUND = "Not found";
export const ERR_ALREADY_EXISTS = "Already exists";
export const ERR_NOT_LOGGED_IN = "Not logged in";
export const ERR_INVALID_REQUEST = "Invalid request";
