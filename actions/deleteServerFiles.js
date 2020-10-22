const path = require('path')
const fs = require("fs")
const { rmdirAsync } = require("../util/rmdirAsync")
const { promisify } = require("util")

async function deleteServerFiles(workingDir = "./") {
    const remDirs = ['data', 'modules', 'cache', 'resources']
    const remFiles = ['altv-server', 'altv-server.exe', 'update.json', 'server.cfg', 'start.sh', 'server.log', 'AltV.Net.Host.runtimeconfig.json', 'AltV.Net.Host.dll']

    if (remDirs.filter(x => fs.existsSync(path.join(workingDir, x))).length < 1 && remFiles.filter(x => fs.existsSync(path.join(workingDir, x))).length < 1) return

    await Promise.all(remDirs.filter(x => fs.existsSync(path.join(workingDir, x))).map((dir) => promisify(rmdirAsync)(path.join(workingDir, dir))));
    await Promise.all(remFiles.filter(file => fs.existsSync(path.join(workingDir, file))).map((file) => promisify(fs.unlink)(path.join(workingDir, file))));
}

module.exports = {
    deleteServerFiles
}