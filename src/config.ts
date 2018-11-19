import { existsSync, readFileSync } from "fs-extra";
import { join } from "path";
import { ISystemConfig } from "./interfaces/system";

const configFilePath = join(__dirname, "..", "config.json");
if (!existsSync(configFilePath)) { throw new Error("No config.json found"); }
const sysconfig = JSON.parse(readFileSync(configFilePath).toString());
if (!ISystemConfig.validate(sysconfig).success) {
    console.log("Invalid system config");
    process.exit(1);
}

export const config: ISystemConfig = sysconfig;
