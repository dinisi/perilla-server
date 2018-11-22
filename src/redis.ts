import { ClientOpts, createClient, RedisClient } from "redis";
import { config } from "./config";
import { registerGracefulExitHook } from "./utils";

export let redisClient: RedisClient = null;

export const connectRedis = async () => {
    redisClient = createClient(config.redis as ClientOpts);
    registerGracefulExitHook(async () => {
        return new Promise<void>((resolve, reject) => {
            redisClient.quit((err) => {
                if (err) { return reject(); }
                return resolve();
            });
        });
    });
    return new Promise((resolve) => {
        redisClient.on("ready", () => {
            console.log("REDIS connected");
            resolve();
        });
    });
};

export const set = async (key: string, prefix: string, value: string) => {
    key = prefix + key;
    key = prefix + key;
    return new Promise<void>((resolve, reject) => {
        redisClient.set(key, value, (err) => {
            if (err) { return reject(err); }
            return resolve();
        });
    });
};

export const get = async (key: string, prefix: string) => {
    key = prefix + key;
    return new Promise<string>((resolve, reject) => {
        redisClient.get(key, (err, reply) => {
            if (err) { return reject(err); }
            return resolve(reply);
        });
    });
};

export const expire = async (key: string, prefix: string, ttlInSec: number) => {
    key = prefix + key;
    return new Promise<void>((resolve, reject) => {
        redisClient.expire(key, ttlInSec, (err) => {
            if (err) { return reject(err); }
            return resolve();
        });
    });
};

export const lpush = async (key: string, prefix: string, item: string | string[]) => {
    key = prefix + key;
    return new Promise<void>((resolve, reject) => {
        redisClient.lpush(key, item, (err) => {
            if (err) { return reject(err); }
            return resolve();
        });
    });
};

export const rpop = async (key: string, prefix: string) => {
    key = prefix + key;
    return new Promise<string>((resolve, reject) => {
        redisClient.rpop(key, (err, reply) => {
            if (err) { return reject(err); }
            return resolve(reply);
        });
    });
};

export const llen = async (key: string, prefix: string) => {
    key = prefix + key;
    return new Promise<number>((resolve, reject) => {
        redisClient.llen(key, (err, reply) => {
            if (err) { return reject(err); }
            return resolve(reply);
        });
    });
};
