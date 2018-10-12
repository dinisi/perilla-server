import { Always, Array, Boolean, Number, Partial, Record, Static, String } from "runtypes";
import { IConfiguration } from "./user";

export const ISystemConfig = Record({
    db: Record({
        url: String,
        options: Always,
    }),
    redis: Record({
        prefix: String,
        options: Always,
    }),
    mail: Record({
        enabled: Boolean,
    }).And(Partial({
        options: Always,
        from: String,
    })),
    http: Record({
        port: Number,
        hostname: String,
        https: Boolean,
    }).And(Partial({
        certificate: String,
        privatekey: String,
    })),
    defaults: Record({
        role: Record({
            config: IConfiguration,
        }),
        user: Record({
            roleIDs: Array(String),
            config: IConfiguration,
        }),
        file: Record({
            allowedRead: Array(String),
            allowedModify: Array(String),
        }),
        problem: Record({
            allowedRead: Array(String),
            allowedModify: Array(String),
            allowedSubmit: Array(String),
        }),
        solution: Record({
            allowedRead: Array(String),
            allowedReadResult: Array(String),
            allowedModify: Array(String),
            allowedRejudge: Array(String),
        }),
        contest: Record({
            allowedRead: Array(String),
            allowedModify: Array(String),
        }),
    }),
    reservedUserID: String,
});

export interface ISystemConfig extends Static<typeof ISystemConfig> {
    [key: string]: any;
}
