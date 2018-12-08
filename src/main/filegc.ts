import { existsSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { FILEGC_TTW, MANAGED_FILE_PATH } from "../constant";
import { log } from "../log";
import { File } from "../schemas/file";

export const HandleFileGC = (hash: string) => {
    const path = join(MANAGED_FILE_PATH, hash);
    if (!existsSync(path)) { return; }
    const stat = statSync(path);
    setTimeout(() => {
        File.findOne({ hash }).then((file) => {
            if (!file) {
                unlinkSync(path);
            }
        }).catch((e) => {
            log(e.message);
        });
    }, Math.max(0, FILEGC_TTW + Math.ceil(stat.ctimeMs)));
};
