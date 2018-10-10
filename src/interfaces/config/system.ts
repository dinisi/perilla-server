import { ConnectionOptions } from "mongoose";
import { IConfiguration } from "./user";

export interface ISystemConfig {
    db: {
        url: string;
        options: ConnectionOptions;
    };
    mail: {
        enabled: boolean;
        options?: any;
        from?: string;
    };
    http: {
        port: number;
        hostname: string;
        https: boolean;
        certificate?: string;
        privatekey?: string;
    };
    defaults: {
        role: {
            config: IConfiguration,
        },
        user: {
            roles: string[];
            config: IConfiguration
        },
        file: {
            allowedRead: string[];
            allowedModify: string[];
        },
        problem: {
            allowedRead: string[];
            allowedModify: string[];
            allowedSubmit: string[];
        },
        solution: {
            allowedRead: string[];
            allowedReadResult: string[];
            allowedRejudge: string[];
            allowedModify: string[];
        },
        contest: {
            allowedRead: string[];
            allowedModify: string[];
        },
    };
    reservedUserID: string;
}
