import { existsSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { MANAGED_FILE_PATH } from "../constant";
import { log } from "../log";
import { File } from "../schemas/file";

export const HandleFileGC = (hash: string) => {
    const path = join(MANAGED_FILE_PATH, hash);
    if (!existsSync(path)) { return; }
    File.findOne({ hash }).then((file) => {
        if (!file) {
            log("Removing " + path);
            unlinkSync(path);
        }
    }).catch((e) => {
        log(e.message);
    });
};
