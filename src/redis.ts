import { promisifyAll } from "bluebird";
import { generate } from "randomstring";
import * as redis from "redis";
import { config } from "./config";
import { IJudgeTask } from "./interfaces/judgetask";
promisifyAll(redis);
export const REDISInstance: any = redis.createClient(config.redis.options as any);

const getKey = (prefix: string, key: string) => {
    return config.redis.prefix + "_" + prefix + "_" + key;
};

export const addJudgeTask = async (task: IJudgeTask, channel: string) => {
    await REDISInstance.lpushAsync(getKey("JQ", channel), JSON.stringify(task));
};
