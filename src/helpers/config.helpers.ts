/*
// install rc again before using this
import rc from 'rc';
import { writeAsync } from 'fs-jetpack';

//        const validProperties = "modules" in config && "dir" in config && "branch" in config;
//         const validTypes = config["modules"] instanceof Array && typeof config["dir"] === "string" && typeof config["branch"] === "string";

export type IConfig = {
    serverDir: string;
    voiceDir: string;
    branch: string;
    modules: string[];
}

export function getConfig(): IConfig {
    const cfg = rc('altv', {
        modules: ['server','js'],
        serverDir: './',
        voiceDir: './',
        branch: 'release'
    });
    return cfg.config
}

export async function setConfig(config: IConfig): Promise<boolean> {
    try {
        //TODO beautify output
        await writeAsync('.altvrc', JSON.stringify(config));
        return true;
    } catch (e) {
        return false;
    }
}
 */