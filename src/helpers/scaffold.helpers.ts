import {Config} from 'cfg-reader';
import {join} from 'path';
import {writeAsync} from 'fs-jetpack';

export function generateServerConfig(path: string, modules: string[]): void {
    new Config(join(path, 'server.cfg'), {
        name: 'My awesome server',
        port: 7788,
        description: 'Genetared by altv-srv',
        players: 1024,
        modules,
        resources: [],
    }).save(false, false)
}

export async function generateStartScript(path: string): Promise<void> {
    await writeAsync(join(path, 'start.sh'),
        `
#!/bin/bash
BASEDIR = $(dirname $0) 
export LD_LIBRARY_PATH =\${BASEDIR}
./altv-server
`
    )
}