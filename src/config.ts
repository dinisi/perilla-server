import { existsSync, readFileSync } from "fs-extra";
import { ISystemConfig } from "./interfaces/system";

if (!existsSync("config.json")) { throw new Error("No config.json found"); }
const sysconfig = JSON.parse(readFileSync("config.json").toString());
if (!ISystemConfig.validate(sysconfig).success) {
    console.log("Invalid system config");
    process.exit(1);
}

export const config: ISystemConfig = sysconfig;
