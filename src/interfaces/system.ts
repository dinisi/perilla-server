import { Boolean, Number, Partial, Record, Static, String, Unknown } from "runtypes";

export const ISystemConfig = Record({
    db: Record({
        url: String,
    }).And(Partial({
        options: Unknown,
    })),
    http: Record({
        port: Number,
        hostname: String,
        https: Boolean,
    }).And(Partial({
        certificate: String,
        privatekey: String,
    })),
    mail: Record({
        enable: Boolean,
    }).And(Partial({
        option: Unknown,
        from: String,
        baseURL: String,
    })),
    secret: String,
});

export type ISystemConfig = Static<typeof ISystemConfig>;
