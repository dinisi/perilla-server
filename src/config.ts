import * as fs from "fs-extra";
import { ISystemConfig } from "./definitions/config";

if (!fs.existsSync("config.json")) {
    // tslint:disable-next-line:no-console
    console.error("System is not initialized");
    fs.writeFileSync("config.json", "{}");
}

export let config: ISystemConfig = JSON.parse(fs.readFileSync("config.json").toString());

export const reloadConfig = () => {
    config = JSON.parse(fs.readFileSync("config.json").toString());
};
