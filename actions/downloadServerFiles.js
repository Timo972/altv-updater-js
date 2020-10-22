const fs = require("fs")
const path = require('path')
const chalk = require("chalk")

const { isBranchValid, isModuleValid } = require("../util/validation")
const { checkVersion } = require("../util/checkVersion")
const { downloadModule } = require("../util/downloadModule")

const { getUpdateFiles } = require("../util/getUpdateFiles")

function checkDirs(workingDir) {
    if (!fs.existsSync(workingDir))
        fs.mkdirSync(workingDir)
    if (!fs.existsSync(path.join(workingDir, 'modules')))
        fs.mkdirSync(path.join(workingDir, 'modules'))
}

async function downloadServer(modules, branch, dir, os) {

    if (typeof modules !== "object" && !(modules instanceof Array))
        throw new Error("No modules specified")

    if (!isBranchValid(branch))
        throw new Error("Invalid branch: " + branch)

    if (path.isAbsolute(dir))
        throw new Error("dir must be relative")

    checkDirs(dir)

    console.log(chalk.yellowBright(`Downloading alt:V Server branch ${branch} with modules: ${modules.join(" ")} into directory: ${dir}`))

    const updateFiles = getUpdateFiles(os, branch)

    const modulePromiseChain = modules.filter(m => isModuleValid(m)).map(module => async () => {
        console.log(`${chalk.yellowBright("[CHECKING]")}: ${module}`);

        const file = updateFiles.find(x => x.type === module && x.name === "update.json")

        const noUpdateNeeded = await checkVersion(file, dir).catch(e => {
            const errfile = updateFiles.find(x => x.name === 'update.json' && x.type === module)
            if (!errfile)
                fs.unlinkSync(path.join(dir, errfile.folder, errfile.name))
            console.error(e)
            console.log('Removed error files. Please re-run this updater')
        })

        if (noUpdateNeeded) {
            console.log(`${chalk.greenBright("[CHECKED]")}: ${module} - ${chalk.greenBright("Updated")}`)
            return
        }

        console.log(`${chalk.yellow("[UPDATING]")}: ${module}`);

        await downloadModule(updateFiles.filter(x => x.type === module), dir)
            .then(() => console.log(`${chalk.green("[UPDATED]")}: ${module} - ${chalk.greenBright("Done")}`))
            .catch(e => console.log(`${chalk.red("[ERROR]")} could not update module ${module}: ${e}`))

        return
    })

    let promise = modulePromiseChain[0]()
    for (let i = 1; i < modulePromiseChain.length; i++)
        await promise.then(modulePromiseChain[i])

    return
}

module.exports = {
    downloadServer
}