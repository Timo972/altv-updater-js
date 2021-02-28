#!/usr/bin/env node

const fs = require("fs")
const path = require('path')
const chalk = require("chalk")
const { promisify } = require("util")
const { readConfig, writeConfig } = require("../util/config")
const { deleteServerFiles } = require("../actions/deleteServerFiles")
const { runServer } = require("../actions/runServer")
const { generateOthers } = require("../util/generateOthers")
const { downloadServer } = require("../actions/downloadServerFiles")

const os = `${process.arch}_${process.platform}`

if (os != 'x64_linux' && os != 'x64_win32')
  throw new Error("Unsupported platform (" + os + ")")

let workingDir = process.cwd()

function setWorkingDir(directory = './') {
  workingDir = path.join(process.cwd(), directory)
}

async function uninstall() {
  console.log('uninstalling')

  if (fs.existsSync(path.join(process.cwd(), '.altvrc'))) {
    const config = await readConfig()

    setWorkingDir(config.dir)

    await promisify(fs.unlink)(path.join(process.cwd(), '.altvrc'))

    if (!fs.existsSync(workingDir))
      return console.log('Already uninstalled')

    await deleteServerFiles(workingDir);
  } else {
    await deleteServerFiles(__dirname);
  }
  console.log("Uninstalled alt:V Server")
}

async function getVersion() {
  return (await promisify(fs.readFile)(path.join(__dirname, "package.json"))).version
}

function isStartArg(x) {
  if (typeof x != "string") return false
  return x.charAt(0) === '-' && x.charAt(1) === '-'
}

async function main() {
  const args = {}
  process.argv.filter(isStartArg).forEach((arg) => {
    let index = process.argv.indexOf(arg)
    args[arg.substring(2, arg.length)] = process.argv[index + 1]
  })

  if (args.hasOwnProperty('options') || args.hasOwnProperty('help'))
    return console.log(`
    Available options are:
    --dir [folder] : installs the server into a relative folder
    --branch [branch](release | rc | dev) : selects the update branch
    --others : generates server.cfg and on linux start.sh also
    --uninstall : uninstalls the altv server
    --csharp : downloads coreclr - module with right branch
    --js : downloads js - module with right branch
      `)

  if (args.hasOwnProperty("version"))
    return console.log("Running version: ", (await getVersion()))

  if (args.hasOwnProperty('uninstall'))
    return (await uninstall())

  else {
    let branch = args.hasOwnProperty("branch") ? args.branch : "release"
    let dir = args.hasOwnProperty("dir") ? args.dir : "./"
    let modules = []

    if (args.hasOwnProperty("csharp"))
      modules.push("csharp-module")

    if (args.hasOwnProperty("js"))
      modules.push("js-module")

    let config = {}

    if (fs.existsSync(path.join(process.cwd(), ".altvrc")))
      config = await readConfig()


    if (config.hasOwnProperty("modules") && modules.length === 0)
      modules = config.modules

    if (modules instanceof Array && !modules.includes("server"))
      modules.push("server")

    if (modules.length === 0)
      modules = ["server", "js-module"]


    if (config.hasOwnProperty("branch") && branch == null)
      branch = config.branch
    else if (branch == null)
      branch = "release"


    if (config.hasOwnProperty("dir") && dir == null)
      dir == config.dir
    else if (dir == null)
      dir = "./"

    if (dir != "./" || branch != "release" || !modules.includes("js-module") || modules.includes("csharp-module"))
      await writeConfig(dir, branch, modules)

    await downloadServer(modules, branch, dir, os).catch(e => {
      console.error(e)
      process.exit(1)
    })

    if (args.hasOwnProperty('others'))
      await generateOthers(os, dir)

    if (args.hasOwnProperty('run'))
      runServer()
  }

}

main()