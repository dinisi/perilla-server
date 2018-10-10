import { IConfiguration } from "./config/user";

export interface IClient {
    clientID: string;
    accessToken: string;
    userID: string;
    roles: string[];
    config: IConfiguration;
    lastVisit: number;
    lastSolutionCreation: number;
    expire: number;
}

export interface IPendingUser {
    username: string;
    realname: string;
    email: string;
    password: string;
}
