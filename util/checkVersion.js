const fs = require("fs")
const https = require("https")
const path = require('path')
const { promisify } = require("util")
const isEqual = require('lodash.isequal')

function checkVersion(file, workingDir) {
    return new Promise(async (resolve, reject) => {
        const fileDest = path.join(workingDir, file.folder, file.name)

        if (!fs.existsSync(fileDest))
            return resolve(false)

        const versionFile = await promisify(fs.readFile)(fileDest).catch(e => console.log("could not read update.json"))

        try {
            const currentVersion = JSON.parse(versionFile)
            https.get(file.url, res => {
                res.on("data", (chunk) => {
                    return resolve(isEqual(currentVersion, JSON.parse(chunk)))
                })
            })
        } catch (e) {
            return reject("could not parse current version: " + e)
        }
    })
}

module.exports = {
    checkVersion
}