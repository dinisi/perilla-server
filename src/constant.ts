import { join } from "path";

import { ensureDirSync } from "fs-extra";

export const JUDGE_PREFIX = "judge";
export const CHRON_PREFIX = "chron";
export const MANAGED_FILE_PATH = join(__dirname, "..", "files", "managed");
ensureDirSync(MANAGED_FILE_PATH);
export const APPLOG_PATH = join(__dirname, "..", "app.log");
export const FRONTEND_PATH = join(__dirname, "..", "frontend");
export const CONFIG_PATH = join(__dirname, "..", "config.json");
export const PACKAGE_PATH = join(__dirname, "..", "package.json");
