import { Boolean, Number, Partial, Record, Static, String, Unknown } from "runtypes";

export const ISystemConfig = Record({
    db: Record({
        url: String,
        options: Unknown,
    }),
    redis: Unknown,
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

export type ISystemConfig = Static<typeof ISystemConfig>;
