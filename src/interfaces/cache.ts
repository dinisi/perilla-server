import { IConfiguration } from "./user";

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
    _id: string;
    realname: string;
    email: string;
    password: string;
}
