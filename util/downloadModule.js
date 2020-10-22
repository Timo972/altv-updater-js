const fs = require("fs")
const https = require("https")
const path = require('path')
const { promisify } = require("util")

async function downloadModule(updateFiles, workingDir) {

    const downloadChain = updateFiles.map(file => () => {
        return new Promise(async (resolve, reject) => {
            const fileDest = path.join(workingDir, file.folder, file.name)
            const fileDestFolder = path.join(workingDir, file.folder)

            console.log(`[DOWNLOADING]: ${file.name}`)

            if (fs.existsSync(fileDest))
                await promisify(fs.unlink)(fileDest)

            if (!fs.existsSync(fileDestFolder))
                await promisify(fs.mkdir)(fileDestFolder)

            https.get(file.url, resp => {
                const writeStream = fs.createWriteStream(fileDest)

                resp.pipe(writeStream)

                resp.on("error", e => reject(e))

                writeStream.on("error", e => reject(e))

                writeStream.on("finish", () => {
                    console.log(`[DOWNLOADED]: ${file.name}`)
                    resolve()
                })
            }).on("abort", () => reject("download aborted"))
                .on("error", e => reject(e))
        })
    })

    let download = downloadChain[0]()
    for (let i = 1; i < downloadChain.length; i++)
        await download.then(downloadChain[i]).catch(e => console.log(`${chalk.red("[ERROR]")} could not download file ${file.name}: ${e}`))

    return
}

module.exports = {
    downloadModule
}