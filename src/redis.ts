import { promisifyAll } from "bluebird";
import { generate } from "randomstring";
import * as redis from "redis";
import { config } from "./config";
import { IClient, IPendingUser } from "./interfaces/cache";
promisifyAll(redis);
const instance: any = redis.createClient(config.redis.options as any);

const getKey = (prefix: string, key: string) => {
    return config.redis.prefix + "_" + prefix + "_" + key;
};

export const getClient = async (accessToken: string) => {
    const client = (JSON.parse(await instance.getAsync(getKey("AT", accessToken)))) as IClient;
    return client;
};

export const generateAccessToken = async () => {
    let token = generate(50);
    while (await instance.existsAsync(getKey("AT", token))) { token = generate(50); }
    return token;
};

export const setClient = async (client: IClient) => {
    await instance.setAsync(getKey("AT", client.accessToken), JSON.stringify(client));
    if (client.expire >= 0) { await instance.expireAsync(getKey("AT", client.accessToken), client.expire); }
};

export const addJudgeTask = async (solutionID: string, channel: string) => {
    await instance.lpushAsync(getKey("JQ", channel), solutionID);
};

export const getPendingUser = async (registerToken: string) => {
    const user = JSON.parse(await instance.getAsync(getKey("PU", registerToken))) as IPendingUser;
    return user;
};

export const generateRegisterToken = async () => {
    let token = generate(50);
    while (await instance.existsAsync(getKey("PU", token))) { token = generate(50); }
    return token;
};

export const setPendingUser = async (user: IPendingUser, registerToken: string, expire: number) => {
    await instance.setAsync(getKey("PU", registerToken), JSON.stringify(user));
    await instance.expireAsync(getKey("PU", registerToken), expire);
};
