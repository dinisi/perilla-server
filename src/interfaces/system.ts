import { Always, Boolean, InstanceOf, Number, Partial, Record, Static, String } from "runtypes";

export const ISystemConfig = Record({
    db: Record({
        url: String,
        options: Always,
    }),
    redis: Always,
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

export type ISystemConfig = Static<typeof ISystemConfig>;
