import { promisifyAll } from "bluebird";
import { generate } from "randomstring";
import * as redis from "redis";
import { IClient } from "./definitions/client";
promisifyAll(redis);
const instance: any = redis.createClient();

export const getClient = async (accessToken: string) => {
    const client = (JSON.parse(await instance.getAsync(accessToken))) as IClient;
    return client;
};

export const generateAccessToken = async () => {
    let token = generate(50);
    while (await instance.existsAsync(token)) { token = generate(50); }
    return token;
};

export const setClient = async (client: IClient, expire: number) => {
    await instance.setAsync(client.accessToken, JSON.stringify(client));
    if (expire >= 0) { await instance.expireAsync(client.accessToken, expire); }
};

export const addJudgeTask = async (taskID: string) => {
    await instance.lpush("judgeTask", taskID);
};
