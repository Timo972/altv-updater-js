import {join} from 'path';
import {exists, readAsync} from 'fs-jetpack';
import {get} from 'https';
import IsEqual from 'lodash.isequal';
import {IFile} from './cdn.helpers';

export async function checkVersion(file: IFile, wd: string): Promise<boolean> {
    const fileDest = join(wd, file.folder, file.name);

    if (!exists(fileDest))
        return false;

    try {
        const versionFile = await readAsync(fileDest);
        const currentVersion = JSON.parse(versionFile);

        const rawVersion: string = await new Promise((resolve, reject) => {
            get(file.url, (res) => {
                const chunks: Buffer[] = [];
                res.on("data", (d) => chunks.push(Buffer.from(d)));
                res.on("error", reject);
                res.on("end", () => resolve(Buffer.concat(chunks).toString('utf8')));
            });
        });
        const cdnVersion = JSON.parse(rawVersion);

        return IsEqual(currentVersion, cdnVersion);
    } catch (e) {
        return false;
    }
}