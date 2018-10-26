import { Always, Array, Boolean, Number, Partial, Record, Static, String } from "runtypes";

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
    sessionSecret: String,
});

export interface ISystemConfig extends Static<typeof ISystemConfig> {
    [key: string]: any;
}
