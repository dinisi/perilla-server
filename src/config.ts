import { existsSync, readFileSync } from "fs-extra";
import { CONFIG_PATH } from "./constant";
import { ISystemConfig } from "./interfaces/system";
import { log } from "./log";

if (!existsSync(CONFIG_PATH)) { throw new Error("No config.json found"); }
const sysconfig = JSON.parse(readFileSync(CONFIG_PATH).toString());
if (!ISystemConfig.validate(sysconfig).success) {
    log("Invalid system config");
    process.exit(1);
}

export const config: ISystemConfig = sysconfig;
