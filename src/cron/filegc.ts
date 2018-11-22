import { readdir, remove } from "fs-extra";
import { join } from "path";
import { MANAGED_FILE_PATH } from "../constant";
import { File } from "../schemas/file";

const gcInterval = 7 * 24 * 60 * 60 * 60 * 1000;

export const fileGC = async () => {
    try {
        const files = await readdir(MANAGED_FILE_PATH);
        const start = +new Date();
        let delta = 0;
        for (const file of files) {
            if (!await File.find({ hash: file }).countDocuments()) {
                await remove(join(MANAGED_FILE_PATH, file));
                delta++;
            }
        }
        const end = +new Date();
        console.log(`GC used ${(end - start) / 1000} seconds and removed ${delta} files.`);
        setTimeout(fileGC, gcInterval);
    } catch (e) {
        console.log(e.message);
    }
};
