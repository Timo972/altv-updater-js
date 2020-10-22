#!/usr/bin/env node
const { deleteServerFiles } = require("../actions/deleteServerFiles")
const { runServer } = require("../actions/runServer")
const { downloadServer } = require("../actions/downloadServerFiles")
const { generateOthers } = require("../util/generateOthers")



async function download(dir, branch, modules) {

    const os = `${process.arch}_${process.platform}`

    return await downloadServer(modules, branch, dir, os)
}

module.exports = {
    download,
    remove: deleteServerFiles,
    generateOthers: (dir) => {
        generateOthers(`${process.arch}_${process.platform}`, dir)
    },
    run: runServer
}