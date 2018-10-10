import * as Ajv from "ajv";
import { existsSync, readFileSync } from "fs-extra";
import { ISystemConfig } from "./interfaces/config/system";

const ajv = new Ajv();
const validate = ajv.compile(JSON.parse(readFileSync("schemas/sysconfig.json").toString()));

if (!existsSync("config.json")) { throw new Error("No config.json found"); }
const sysconfig = JSON.parse(readFileSync("config.json").toString());
const valid = validate(sysconfig);
if (!valid) { throw new Error("Invalid sysconfig"); }
export const config: ISystemConfig = sysconfig;
