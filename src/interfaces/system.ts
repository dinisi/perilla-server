import { Boolean, Number, Partial, Record, Static, String, Unknown } from "runtypes";

export const ISystemConfig = Record({
    db: Record({
        url: String,
        options: Unknown,
    }),
    http: Record({
        port: Number,
        hostname: String,
        https: Boolean,
    }).And(Partial({
        certificate: String,
        privatekey: String,
    })),
    secret: String,
});

export type ISystemConfig = Static<typeof ISystemConfig>;
