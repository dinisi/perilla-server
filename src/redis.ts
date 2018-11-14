import * as redis from "redis";
import { config } from "./config";
export const instance = redis.createClient(config.redis as any);

export const publishJudgerCommand = (cmd: string) => {
    return new Promise((resolve, reject) => {
        instance.publish("perillajudger", cmd, (err, reply) => {
            if (err) { return reject(err); }
            return resolve(reply);
        });
    });
};
