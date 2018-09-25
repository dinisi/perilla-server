import * as Ajv from "ajv";
import * as fs from "fs-extra";
import { readFileSync } from "fs-extra";
import { ISystemConfig } from "./definitions/config";

const ajv = new Ajv();
const validate = ajv.compile(JSON.parse(readFileSync("schemas/sysconfig.json").toString()));

export let config: ISystemConfig = null;

export const LoadConfig = () => {
    const sysconfig = JSON.parse(fs.readFileSync("config.json").toString());
    const valid = validate(sysconfig);
    if (!valid) { throw new Error("Invalid sysconfig"); }
    config = sysconfig;
};
