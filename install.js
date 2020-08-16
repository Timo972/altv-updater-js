#!/usr/bin/env node

const fs = require("fs")
const https = require("https")
const path = require('path')
const exec = require('child_process').exec
const Evt = require('events').EventEmitter
const isEqual = require('lodash.isequal')

class Updater extends Evt {
  constructor(BRANCH = 'release', DIR = '/') {
    super()
    if (fs.existsSync(path.join(__dirname, '/altv.json'))) {
      const alt_config = JSON.parse(fs.readFileSync(path.join(__dirname, '/altv.json')))
      if (BRANCH == alt_config.branch)
        BRANCH = alt_config.branch
      //if (DIR == '/' || DIR == alt_config.dir)
        DIR = alt_config.dir
      this.write_cfg(DIR, BRANCH)
    } else if (BRANCH !== 'release' || DIR !== '/') {
      this.write_cfg(DIR, BRANCH)
    }
    this.branch = BRANCH
    this.set_c_dir(DIR)
    this.os = `${process.arch}_${process.platform}`//process.arch == "linux" ? "x64_linux" : "x64_win32";
    if (this.os != 'x64_linux' && this.os != 'x64_win32')
      throw new Error("Unsupported platform (" + this.os + ")")
    if (BRANCH != 'rc' && BRANCH != 'release' && BRANCH != 'dev')
      throw new Error("Unsupported branch (" + this.branch + ")")
    console.log('Using js-updater - branch: ' + BRANCH)
    this.updateFiles = [
      {
        url: `https://cdn.altv.mp/js-module/${BRANCH}/${this.os}/update.json`,
        folder: `./modules/js-module`,
        name: `update.json`,
        type: 'js-module'
      },
      {
        url: `https://cdn.altv.mp/js-module/${BRANCH}/${this.os}/modules/js-module/${this.os == "x64_linux" ? `libjs-module.so` : `js-module.dll`}`,
        folder: `./modules/js-module`,
        name: this.os == "x64_linux" ? `js-module.so` : `js-module.dll`,
        type: 'js-module'
      },
      {
        url: `https://cdn.altv.mp/js-module/${BRANCH}/${this.os}/modules/js-module/${this.os == "x64_linux" ? `libnode.so.72` : `libnode.dll`}`,
        folder: `./modules/js-module`,
        name: this.os == "x64_linux" ? `libnode.so.72` : `libnode.dll`,
        type: 'js-module'
      },
      {
        url: `https://cdn.altv.mp/server/${BRANCH}/${this.os}/data/vehmodels.bin`,
        folder: `./data`,
        name: `vehmodels.bin`,
        type: 'server'
      },
      {
        url: `https://cdn.altv.mp/server/${BRANCH}/${this.os}/data/vehmods.bin`,
        folder: `./data`,
        name: `vehmods.bin`,
        type: 'server'
      },
      {
        url: `https://cdn.altv.mp/server/${BRANCH}/${this.os}/update.json`,
        folder: `./`,
        name: `update.json`,
        type: 'server'
      },
      {
        url: `https://cdn.altv.mp/server/${BRANCH}/${this.os}/${this.os == "x64_linux" ? `altv-server` : `altv-server.exe`}`,
        folder: `./`,
        name: this.os == "x64_linux" ? `altv-server` : `altv-server.exe`,
        type: 'server'
      }
    ]
  }
  set_c_dir(directory = '/') {
    this.dir = directory
    this._dirname = path.join(__dirname, directory)
  }
  write_cfg(directory, branch) {
    fs.writeFile(path.join(__dirname, '/altv.json'), JSON.stringify({ dir: directory, run: this.os !== 'x64_win32' ? path.join(__dirname, directory, 'start.sh') : path.join(__dirname, directory, `altv-server.exe`), branch: branch }), (err) => err ? console.log(err) : null)
  }
  version_check(type) {
    return new Promise((resolve, reject) => {
      let file = this.updateFiles.find(x => x.type === type && x.name === "update.json")
      if (!file) reject(new Error("no module of type " + type));
      if (!fs.existsSync(path.join(this._dirname, file.folder, file.name))) resolve(false)
      try {
        const current_file = fs.readFileSync(path.join(this._dirname, file.folder, file.name))
        let current = JSON.parse(current_file)
        const req = https.get(file.url, (res) => {
          res.on("data", (chunk) => {
            resolve(isEqual(current, JSON.parse(chunk)))
          })
        })
        req.on('error', (err) => {
          reject(new Error("Error while caching version file: " + err))
        })
      } catch (e) {
        reject(new Error("Error while parsing current version: " + e))
      }
    })
  }
  download_file(file) {
    return new Promise((resolve, reject) => {
      let downloaded = false
      if (fs.existsSync(path.join(this._dirname, file.folder, file.name)))
        fs.unlinkSync(path.join(this._dirname, file.folder, file.name))
      const dl = https.get(file.url, (res) => {
        if (!fs.existsSync(path.join(this._dirname, file.folder)))
          fs.mkdirSync(path.join(this._dirname, file.folder))
        console.log('Downloading: ' + file.name)
        res.pipe(fs.createWriteStream(path.join(this._dirname, file.folder, file.name)))
        res.on('close', () => {
          if (downloaded) return
          downloaded = true
          resolve()
        })
        res.on('error', () => {
          reject(new Error("Error while downloading: " + file.name + ' : ' + err))
        })
      })
      dl.on('abort', () => {
        reject(new Error("Error while downloading: aborted"))
      })
      dl.on('close', () => {
        if (downloaded) return
        downloaded = true
        resolve()
      })
      dl.on('error', (err) => {
        reject(new Error("Error while downloading: " + file.name + ' : ' + err))
      })
    })
  }
  download_module(type) {
    return new Promise((resolve, reject) => {
      let files = this.updateFiles.filter(x => x.type === type)
      if (files.length < 1) {
        reject(new Error("Unknown module type: " + type))
        return
      }
      let downloaded = 0;
      for (const file in files) {
        this.download_file(files[file]).then(() => {
          console.log('Downloaded: ' + files[file].name)
          downloaded++;
          if (downloaded >= files.length)
            resolve()
        }).catch(console.error)
      }
    })
  }
  init(modules = ['js-module', 'server']) {
    //if (typeof directory != 'string') return console.error('Invalid path')
    /*this.set_c_dir(directory);
    if (directory !== '/' || this.branch !== 'release')
      this.write_cfg(directory)*/
    if (!fs.existsSync(this._dirname))
      fs.mkdirSync(this._dirname)
    if (!fs.existsSync(path.join(this._dirname, 'modules')))
      fs.mkdirSync(path.join(this._dirname, 'modules'))
    let updated_modules = 0
    modules.forEach((module_name, index) => {
      this.version_check(module_name).then(isUp2Date => {
        if (isUp2Date) {
          updated_modules++
          if (modules.length <= updated_modules) {
            console.log('Server successfully updated')
            this.emit('done')
            //process.exit(0)
          }
          return console.log('module ' + module_name + ' is up to date')
        }
        console.log('Updating module: ' + module_name)
        this.download_module(module_name).then(() => {
          console.log('Updated module: ' + module_name)
          updated_modules++
          if (modules.length <= updated_modules) {
            console.log('Server successfully installed')
            this.emit('done')
            //process.exit(0)
          }
        }).catch(console.error)
      }).catch((err) => {
        let errfile = this.updateFiles.find(x => x.name === 'update.json' && x.type === module_name)
        fs.unlinkSync(path.join(this._dirname, errfile.folder, errfile.name))
        console.error(err)
        console.log('Removed error files. Please re-run this updater')
        this.emit('done', false)
      })
    })
  }
  generateOthers() {
    fs.writeFileSync(path.join(this._dirname, 'server.cfg'), `name: "TestServer",
host: "0.0.0.0",
port: 7788,
players: 1024,
password: "verysecurepassword", # remove hashtag before password to enable
announce: false, # set to false during development
#token: no-token, # only needed when announce: true
gamemode: "Freeroam",
website: "test.com",
language: "en",
description: "test",
debug: false, # set to true during development
useEarlyAuth: false,
earlyAuthUrl: 'https://login.example.com:PORT',
useCdn: false,
cdnUrl: 'https://cdn.example.com:PORT',
modules: [
  "js-module"
],
resources: [
],
tags: [ 
  "customTag1",
  "customTag2",
  "customTag3",
  "customTag4"
]`)
    fs.mkdirSync(path.join(this._dirname, 'resources'))
    fs.mkdirSync(path.join(this._dirname, 'cache'))
    if (this.os == 'x64_linux')
      fs.writeFileSync(path.join(this._dirname, 'start.sh'), `#!/bin/bash \nBASEDIR=$(dirname $0) \nexport LD_LIBRARY_PATH=\${BASEDIR} \n./altv-server`)
  }
  runServer() {
    return console.log('Running the server from the updater is currently not supported')
    console.log('Starting server ...')
    if (fs.existsSync(this.os === 'x64_win32' ? `${this._dirname}\\altv-server.exe` : `${this._dirname}start.sh`)) {
      const server = exec(this.os === 'x64_win32' ? `${this._dirname}\\altv-server.exe` : `${this._dirname}start.sh`, (error, stdout, stderr) => {
        if (error) console.error(error)
        if (stdout) console.log(stdout)
        if (stderr) console.log(stderr)
      })
      console.log(`Running Server with PID: ${server.pid}`)
      server.on('close', (code, signal) => process.exit(code))
      server.on('disconnect', () => process.exit(0))
      server.on('error', (err) => console.error(err))
      server.on('exit', (code, signal) => process.exit(code))
      server.on('message', (msg) => console.log(msg))
    }
    else {
      console.log('Cannot run server - if you are on linux you need to generate "others" with option --others')
      process.exit(0)
    }
  }
  done() {
    return new Promise(resolve => {
      this.on('done', (successful = true) => resolve(successful))
    })
  }
  uninstall() {
    console.log('uninstalling')
    if (fs.existsSync(path.join(__dirname, '/altv.json')) && this.dir !== '/') {
      //this.set_c_dir(JSON.parse(fs.readFileSync(path.join(__dirname, '/altv.json'), { encoding: 'utf8' })).dir)
      fs.unlink(path.join(__dirname, '/altv.json'), (err) => err ? console.log(err) : null)
      if (!fs.existsSync(this._dirname))
        return console.log('Already uninstalled')
      rmdirAsync(this._dirname, (err) => err ? console.log(err) : null)
      console.log('Uninstalled altv-server')
      return
    } else if (fs.existsSync(path.join(__dirname, '/altv.json')))
      fs.unlink(path.join(__dirname, '/altv.json'), (err) => err ? console.log(err) : null)
    //else
    //this.set_c_dir()
    const remDirs = ['data', 'modules', 'cache', 'resources']
    const remFiles = ['altv-server', 'update.json', 'server.cfg', 'start.sh', 'server.log']
    if (remDirs.filter(x => fs.existsSync(path.join(this._dirname, x))).length < 1 && remFiles.filter(x => fs.existsSync(path.join(this._dirname, x))).length < 1) return console.log('Already uninstalled')
    remDirs.filter(x => fs.existsSync(path.join(this._dirname, x))).forEach((dir) => {
      rmdirAsync(path.join(this._dirname, dir), (err, _) => {
        if (err) console.error(err)
        console.log('Uninstalled altv-server')
      })
    })
    remFiles.forEach((file) => {
      if (fs.existsSync(path.join(this._dirname, file)))
        fs.unlinkSync(path.join(this._dirname, file))
    })
  }
}

function rmdirAsync(path, callback) {
  fs.readdir(path, function (err, files) {
    if (err) {
      // Pass the error on to callback
      callback(err, []);
      return;
    }
    var wait = files.length,
      count = 0,
      folderDone = function (err) {
        count++;
        // If we cleaned out all the files, continue
        if (count >= wait || err) {
          fs.rmdir(path, callback);
        }
      };
    // Empty directory to bail early
    if (!wait) {
      folderDone();
      return;
    }

    // Remove one or more trailing slash to keep from doubling up
    path = path.replace(/\/+$/, "");
    files.forEach(function (file) {
      var curPath = path + "/" + file;
      fs.lstat(curPath, function (err, stats) {
        if (err) {
          callback(err, []);
          return;
        }
        if (stats.isDirectory()) {
          rmdirAsync(curPath, folderDone);
        } else {
          fs.unlink(curPath, folderDone);
        }
      });
    });
  });
};

function isStartArg(x) {
  if (typeof x != "string") return false
  return x.charAt(0) === '-' && x.charAt(1) === '-'
}

async function main() {
  const args = {}
  process.argv.filter(isStartArg).forEach((arg) => {
    let index = process.argv.indexOf(arg)
    args[arg.substring(2, arg.length)] = process.argv[index + 1]
    /*let after = process.argv.slice(process.argv.indexOf(arg) + 1, process.argv.length)
    console.table(after)
    if (after.findIndex(isStartArg) > -1)
      after.slice(after.findIndex(isStartArg), after.length)
    args[arg.substring(2, arg.length)] = after*/
  })
  if (args.hasOwnProperty('options'))
    return console.log(`
    Available options are:
      --dir [folder] : installs the server into a relative folder
      --branch [branch] (release|rc|dev) : selects the update branch
      --others : generates server.cfg and on linux start.sh also
      --uninstall : uninstalls the altv server
    `)
  const updater = new Updater(args.branch, args.hasOwnProperty('dir') ? args.dir : '/')
  if (args.hasOwnProperty('uninstall'))
    return updater.uninstall()
  else
    updater.init()
  if (args.hasOwnProperty('others'))
    updater.generateOthers()
  const successful_installed = await updater.done()
  if (args.hasOwnProperty('run') && successful_installed)
    updater.runServer()
}

main()