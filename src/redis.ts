import { promisifyAll } from "bluebird";
import { generate } from "randomstring";
import * as redis from "redis";
import { IClient, IPendingUser } from "./definitions/cache";
promisifyAll(redis);
const instance: any = redis.createClient();
const accessTokenPrefix = "at_";
const pendingUserPrefix = "pu_";

export const getClient = async (accessToken: string) => {
    const client = (JSON.parse(await instance.getAsync(accessTokenPrefix + accessToken))) as IClient;
    return client;
};

export const generateAccessToken = async () => {
    let token = generate(50);
    while (await instance.existsAsync(accessTokenPrefix + token)) { token = generate(50); }
    return token;
};

export const setClient = async (client: IClient) => {
    await instance.setAsync(accessTokenPrefix + client.accessToken, JSON.stringify(client));
    if (client.expire >= 0) { await instance.expireAsync(accessTokenPrefix + client.accessToken, client.expire); }
};

export const addJudgeTask = async (taskID: string) => {
    await instance.lpush("judgeTask", taskID);
};

export const getPendingUser = async (registerToken: string) => {
    const user = (JSON.parse(await instance.getAsync(pendingUserPrefix + registerToken))) as IPendingUser;
    return user;
};

export const generateRegisterToken = async () => {
    let token = generate(50);
    while (await instance.existsAsync(pendingUserPrefix + token)) { token = generate(50); }
    return token;
};

export const setPendingUser = async (user: IPendingUser, registerToken: string, expire: number) => {
    await instance.setAsync(pendingUserPrefix + registerToken, JSON.stringify(user));
    await instance.expireAsync(pendingUserPrefix + registerToken, expire);
};
