import { IConfiguration } from "./configuration";

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
