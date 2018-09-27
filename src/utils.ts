import { createHash } from "crypto";
import { createReadStream, stat } from "fs-extra";

export const ensureElement = <T>(arr: T[], element: T) => {
    if (!arr.includes(element)) {
        arr.push(element);
    }
};

export const getBaseURL = (hostname: string, port: number) => {
    return "http://" + hostname + (port === 80 ? "" : ":" + port);
};

export const MD5 = (path: string): Promise<string> => {
    return new Promise((reslove) => {
        const result = createHash("md5");
        const stream = createReadStream(path);
        stream.on("data", (chunk) => {
            result.update(chunk);
        });
        stream.on("end", () => {
            const md5 = result.digest("hex");
            reslove(md5);
        });
    });
};

export const getFileSize = (path: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        stat(path, (err, stats) => {
            if (err) { reject(err); }
            resolve(stats.size);
        });
    });
};
