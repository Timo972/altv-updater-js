const fs = require("fs")
const { promisify } = require("util")
const path = require('path')

async function validConfig() {
    if(fs.existsSync(path.join(process.cwd(), ".altvrc"))) {
        const config = await readConfig()
        const validProperties = "modules" in config && "dir" in config && "branch" in config;
        const validTypes = config["modules"] instanceof Array && typeof config["dir"] === "string" && typeof config["branch"] === "string";
        return validProperties && validTypes;
    }
    else return false
}

async function readConfig() {
    const result = await promisify(fs.readFile)(path.join(process.cwd(), ".altvrc"), {
        encoding: "utf8"
    })

    try {
        const parsed = JSON.parse(result);
        return parsed;
    } catch (e) {
        console.log(`${chalk.red("[ERROR]")} could not read config file: ${e}`)
        process.exit(1)
    }
}

async function writeConfig(directory, branch, modules) {
    await promisify(fs.writeFile)(path.join(process.cwd(), ".altvrc"), JSON.stringify({ dir: directory, branch: branch, modules }), (err) => err ? console.log(err) : null)
}

module.exports = {
    readConfig,
    writeConfig,
    validConfig
}