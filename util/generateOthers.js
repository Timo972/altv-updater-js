const fs = require("fs")
const path = require('path')
const { promisify } = require("util")

async function generateOthers(os, workingDir) {
    if (typeof os !== "string" || typeof workingDir !== "string") throw new Error("Invalid params")

    if (!fs.existsSync(path.join(workingDir, "server.cfg")))
        await promisify(fs.copyFile)(path.join(__dirname, "..", "data", "files", "server.cfg"), path.join(workingDir, "server.cfg"));

    if (!fs.existsSync(path.join(workingDir, 'resources')))
        await promisify(fs.mkdir)(path.join(workingDir, 'resources'))

    if (!fs.existsSync(path.join(workingDir, 'cache')))
        await promisify(fs.mkdir)(path.join(workingDir, 'cache'))

    if (os == 'x64_linux' && !fs.existsSync(path.join(workingDir, 'start.sh')))
        await promisify(fs.writeFile)(path.join(workingDir, 'start.sh'), `#!/bin/bash \nBASEDIR = $(dirname $0) \nexport LD_LIBRARY_PATH =\${ BASEDIR } \n./ altv - server`)
}

module.exports = {
    generateOthers
}