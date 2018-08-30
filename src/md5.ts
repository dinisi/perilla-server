import { createHash } from "crypto";
import { createReadStream } from "fs-extra";

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
