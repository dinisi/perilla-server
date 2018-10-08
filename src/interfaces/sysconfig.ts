import { ConnectionOptions } from "mongoose";

export interface ISystemConfig {
    defaultAdminUserID: string;
    defaultAdminRoleID: string;
    defaultJudgerUserID: string;
    defaultJudgerRoleID: string;
    defaultUserRoleID: string;
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
}
