const fs = require("fs")
const https = require("https")
const path = require('path')
const isEqual = require('lodash.isequal');


class Updater {
  constructor(BRANCH = 'release') {
    this.os = `${process.arch}_${process.platform}`//process.arch == "linux" ? "x64_linux" : "x64_win32";
    if (this.os != 'x64_linux' && this.os != 'x64_win32')
      throw new Error("Unsupported platform (" + this.os + ")")
    if(BRANCH != 'rc' && BRANCH != 'release' && BRANCH != 'dev')
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
  version_check(type) {
    return new Promise((resolve, reject) => {
      let file = this.updateFiles.find(x => x.type === type && x.name === "update.json")
      if (!file) reject(new Error("no module of type " + type));
      if (!fs.existsSync(path.join(__dirname, file.folder, file.name))) resolve(false)
      try {
        const current_file = fs.readFileSync(path.join(__dirname, file.folder, file.name))
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
      if (fs.existsSync(path.join(__dirname, file.folder, file.name)))
        fs.unlinkSync(path.join(__dirname, file.folder, file.name))
      const dl = https.get(file.url, (res) => {
        if (!fs.existsSync(path.join(__dirname, file.folder)))
          fs.mkdirSync(path.join(__dirname, file.folder))
        console.log('Downloading: ' + file.name)
        res.pipe(fs.createWriteStream(path.join(__dirname, file.folder, file.name)))
        res.on('close', () => {
          resolve()
        })
        res.on('error', () => {
          reject(new Error("Error while downloading: " + file.name + ' : ' + err))
        })
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
    if (!fs.existsSync(path.join(__dirname, 'modules')))
      fs.mkdirSync(path.join(__dirname, 'modules'))
    let updated_modules = 0
    modules.forEach((module_name, index) => {
      this.version_check(module_name).then(isUp2Date => {
        if (isUp2Date) { 
          updated_modules++
          return console.log('module ' + module_name + ' is up to date')
      }
        console.log('Updating module: ' + module_name)
        this.download_module(module_name).then(() => {
          console.log('Updated module: ' + module_name)
          updated_modules++
          if(modules.length <= updated_modules) {
            console.log('Server successfully installed')
            process.exit(0)
          }
        }).catch(console.error)
      }).catch((err) => {
        let errfile = this.updateFiles.find(x=>x.name === 'update.json' && x.type === module_name)
        fs.unlinkSync(path.join(__dirname, errfile.folder, errfile.name))
        console.error(err)
        console.log('Removed error files. Please re-run this updater')
      })
    })
  }
  generateOthers(){
    fs.writeFileSync(path.join(__dirname, 'server.cfg'), `name: "TestServer",
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
    fs.mkdirSync(path.join(__dirname, 'resources'))
    fs.mkdirSync(path.join(__dirname, 'cache'))
    if(this.os == 'x64_linux')
      fs.writeFileSync(path.join(__dirname, 'start.sh'), `#!/bin/bash \nBASEDIR=$(dirname $0) \nexport LD_LIBRARY_PATH=\${BASEDIR} \n./altv-server`)
  }
  uninstall() {
    console.log('uninstalling')
    const remDirs = ['data', 'modules', 'cache', 'resources']
    const remFiles = ['altv-server', 'update.json', 'server.cfg', 'start.sh', 'server.log']
    if(remDirs.filter(x=>fs.existsSync(path.join(__dirname, x))).length < 1 && remFiles.filter(x=>fs.existsSync(path.join(__dirname, x))).length < 1)return console.log('Already uninstalled')
    remDirs.filter(x=>fs.existsSync(path.join(__dirname, x))).forEach((dir) => {
      rmdirAsync(path.join(__dirname, dir), (err, _) => {
        if(err) console.error(err)
        console.log('Uninstalled altv-server')
      })
    })
    remFiles.forEach((file) => {
      if(fs.existsSync(path.join(__dirname, file)))
        fs.unlinkSync(path.join(__dirname, file))
    })
  }
}

function rmdirAsync (path, callback) {
  fs.readdir(path, function(err, files) {
    if(err) {
      // Pass the error on to callback
      callback(err, []);
      return;
    }
    var wait = files.length,
      count = 0,
      folderDone = function(err) {
      count++;
      // If we cleaned out all the files, continue
      if( count >= wait || err) {
        fs.rmdir(path,callback);
      }
    };
    // Empty directory to bail early
    if(!wait) {
      folderDone();
      return;
    }
    
    // Remove one or more trailing slash to keep from doubling up
    path = path.replace(/\/+$/,"");
    files.forEach(function(file) {
      var curPath = path + "/" + file;
      fs.lstat(curPath, function(err, stats) {
        if( err ) {
          callback(err, []);
          return;
        }
        if( stats.isDirectory() ) {
          rmdirAsync(curPath, folderDone);
        } else {
          fs.unlink(curPath, folderDone);
        }
      });
    });
  });
};

function isStartArg(x) {
  if(typeof x != "string") return false
  return x.charAt(0) === '-' && x.charAt(1) === '-'
}

function main(){
  const args = {}
  process.argv.filter(isStartArg).forEach((arg) => {
    let after = process.argv.slice(process.argv.indexOf(arg)+1, process.argv.length)
    if(after.findIndex(isStartArg) > -1)
      after.slice(after.findIndex(isStartArg), after.length)
    args[arg.substring(2, arg.length)] = after
  })
  const updater = new Updater(args.branch) 
  if(args.hasOwnProperty('uninstall'))
    return updater.uninstall()
  else
    updater.init()
  if(args.hasOwnProperty('others'))
    updater.generateOthers()
}

main()